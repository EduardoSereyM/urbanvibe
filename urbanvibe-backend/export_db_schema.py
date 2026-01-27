"""
Script para exportar el esquema completo de la base de datos PostgreSQL.
Exporta todas las tablas de todos los esquemas (no solo public).

Uso:
    cd urbanvibe-backend
    python export_db_schema.py

Output:
    ../esquemaddbb.md (actualizado con el DDL completo)
"""

import os
import asyncio
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Cargar variables de entorno
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Convertir a async si es necesario
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)


async def get_all_schemas(engine) -> list:
    """Obtiene todos los esquemas de la base de datos (excepto system schemas)."""
    async with engine.connect() as conn:
        result = await conn.execute(text("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
            ORDER BY schema_name
        """))
        return [row[0] for row in result.fetchall()]


async def get_tables_in_schema(engine, schema: str) -> list:
    """Obtiene todas las tablas de un esquema específico."""
    async with engine.connect() as conn:
        result = await conn.execute(text(f"""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = :schema
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """), {"schema": schema})
        return [row[0] for row in result.fetchall()]


async def get_table_ddl(engine, schema: str, table: str) -> str:
    """Genera el DDL (CREATE TABLE) para una tabla específica."""
    ddl_lines = []
    
    async with engine.connect() as conn:
        # 1. Obtener columnas
        columns_result = await conn.execute(text("""
            SELECT 
                column_name,
                data_type,
                character_maximum_length,
                column_default,
                is_nullable,
                udt_name
            FROM information_schema.columns 
            WHERE table_schema = :schema AND table_name = :table
            ORDER BY ordinal_position
        """), {"schema": schema, "table": table})
        
        columns = columns_result.fetchall()
        
        if not columns:
            return f"-- Tabla {schema}.{table} no tiene columnas definidas\n"
        
        # 2. Obtener primary key
        pk_result = await conn.execute(text("""
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = :schema
            AND tc.table_name = :table
        """), {"schema": schema, "table": table})
        pk_columns = [row[0] for row in pk_result.fetchall()]
        
        # 3. Obtener foreign keys
        fk_result = await conn.execute(text("""
            SELECT 
                kcu.column_name,
                ccu.table_schema AS foreign_table_schema,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = :schema
            AND tc.table_name = :table
        """), {"schema": schema, "table": table})
        fk_map = {row[0]: (row[1], row[2], row[3]) for row in fk_result.fetchall()}
        
        # 4. Construir DDL
        table_name = f"{schema}.{table}" if schema != "public" else table
        ddl_lines.append(f"CREATE TABLE {table_name} (")
        
        col_definitions = []
        for col in columns:
            col_name, data_type, max_length, default, nullable, udt_name = col
            
            # Tipo de dato
            if data_type == "character varying" and max_length:
                col_type = f"VARCHAR({max_length})"
            elif data_type == "character" and max_length:
                col_type = f"CHAR({max_length})"
            elif data_type == "ARRAY":
                col_type = f"{udt_name.replace('_', '')}[]"
            elif data_type == "USER-DEFINED":
                col_type = udt_name.upper()
            else:
                col_type = data_type.upper()
            
            # Constraints
            constraints = []
            if col_name in pk_columns and len(pk_columns) == 1:
                constraints.append("PRIMARY KEY")
            if nullable == "NO" and col_name not in pk_columns:
                constraints.append("NOT NULL")
            if default:
                # Limpiar default value
                default_clean = default.replace("::text", "").replace("::character varying", "")
                if "nextval" in default.lower():
                    constraints.append("GENERATED BY DEFAULT")
                elif default_clean:
                    constraints.append(f"DEFAULT {default_clean}")
            
            # FK reference
            if col_name in fk_map:
                fk_schema, fk_table, fk_col = fk_map[col_name]
                fk_ref = f"{fk_schema}.{fk_table}" if fk_schema != "public" else fk_table
                constraints.append(f"REFERENCES {fk_ref}({fk_col})")
            
            col_def = f"    {col_name} {col_type}"
            if constraints:
                col_def += " " + " ".join(constraints)
            
            col_definitions.append(col_def)
        
        # Composite primary key
        if len(pk_columns) > 1:
            col_definitions.append(f"    PRIMARY KEY ({', '.join(pk_columns)})")
        
        ddl_lines.append(",\n".join(col_definitions))
        ddl_lines.append(");")
        
    return "\n".join(ddl_lines)


async def export_schema():
    """Función principal que exporta todo el esquema."""
    print("🗄️  EXPORTADOR DE ESQUEMA DE BASE DE DATOS")
    print("=" * 60)
    
    if not DATABASE_URL:
        print("❌ Error: DATABASE_URL no está configurada en .env")
        return
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    
    output_lines = [
        "# Esquema de Base de Datos - UrbanVibe",
        "",
        f"**Generado automáticamente:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}",
        "",
        "> ⚠️ Este archivo es generado por el script `export_db_schema.py`. No editar manualmente.",
        "",
        "---",
        ""
    ]
    
    try:
        # Obtener todos los esquemas
        schemas = await get_all_schemas(engine)
        print(f"📂 Esquemas encontrados: {schemas}")
        
        total_tables = 0
        
        for schema in schemas:
            tables = await get_tables_in_schema(engine, schema)
            
            if not tables:
                continue
            
            output_lines.append(f"## Esquema: `{schema}`")
            output_lines.append("")
            output_lines.append(f"Tablas: {len(tables)}")
            output_lines.append("")
            
            for table in tables:
                print(f"  📋 Procesando {schema}.{table}...")
                
                output_lines.append(f"### {table}")
                output_lines.append("")
                output_lines.append("```sql")
                
                ddl = await get_table_ddl(engine, schema, table)
                output_lines.append(ddl)
                
                output_lines.append("```")
                output_lines.append("")
                
                total_tables += 1
            
            output_lines.append("---")
            output_lines.append("")
        
        # Escribir archivo
        output_path = os.path.join(os.path.dirname(__file__), "..", "esquemaddbb.md")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(output_lines))
        
        print("")
        print("=" * 60)
        print(f"✅ Esquema exportado exitosamente!")
        print(f"   📄 Archivo: esquemaddbb.md")
        print(f"   📊 Total tablas: {total_tables}")
        print(f"   📂 Esquemas: {len(schemas)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(export_schema())
