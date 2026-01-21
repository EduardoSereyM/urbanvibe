"""
Script de auditora para detectar tablas no utilizadas, duplicadas u obsoletas
en el proyecto UrbanVibe.

Analiza:
1. Tablas definidas en esquemaddbb.md
2. Modelos SQLAlchemy en app/models/
3. Uso de modelos en endpoints de app/api/v1/endpoints/
4. Detecta duplicaciones y tablas hurfanas
"""

import re
from pathlib import Path
from typing import Dict, List, Set
from collections import defaultdict


def extract_tables_from_schema_doc(schema_path: Path) -> Dict[str, Dict]:
    """Extrae todas las tablas definidas en esquemaddbb.md (formato SQL DDL)"""
    content = schema_path.read_text(encoding='utf-8')
    tables = {}
    
    # Buscar CREATE TABLE statements
    table_pattern = r'CREATE TABLE (?:public\.)?([a-z_]+)\s*\((.*?)\);'
    
    for match in re.finditer(table_pattern, content, re.IGNORECASE | re.DOTALL):
        table_name = match.group(1)
        table_body = match.group(2)
        
        # Extraer columnas (primera palabra despus de espacio/newline)
        columns = []
        for line in table_body.split('\n'):
            line = line.strip()
            if line and not line.startswith('CONSTRAINT') and not line.startswith('--'):
                # Extraer nombre de columna (primera palabra)
                col_match = re.match(r'^\s*([a-z_]+)', line, re.IGNORECASE)
                if col_match:
                    col_name = col_match.group(1).lower()
                    # Filtrar palabras clave SQL
                    if col_name not in ['primary', 'foreign', 'check', 'unique', 'index']:
                        columns.append(col_name)
        
        tables[table_name] = {
            'description': f'Tabla SQL: {table_name}',
            'columns': columns,
            'has_foreign_keys': 'FOREIGN KEY' in table_body
        }
    
    return tables


def extract_models_from_code(models_dir: Path) -> Dict[str, Dict]:
    """Extrae todos los modelos SQLAlchemy definidos en app/models/"""
    models = {}
    
    for model_file in models_dir.glob('*.py'):
        if model_file.name == '__init__.py':
            continue
        
        content = model_file.read_text(encoding='utf-8')
        
        # Buscar clases que heredan de Base
        class_pattern = r'class\s+(\w+)\(Base\):'
        for match in re.finditer(class_pattern, content):
            class_name = match.group(1)
            
            # Buscar __tablename__
            tablename_match = re.search(
                rf'class {class_name}\(Base\):.*?__tablename__\s*=\s*["\']([^"\']+)["\']',
                content,
                re.DOTALL
            )
            
            if tablename_match:
                table_name = tablename_match.group(1)
                models[class_name] = {
                    'table_name': table_name,
                    'file': model_file.name,
                    'has_relationships': 'relationship(' in content
                }
    
    return models


def find_model_usage_in_endpoints(endpoints_dir: Path, models: Dict) -> Dict[str, List[str]]:
    """Detecta qu modelos se usan en qu endpoints"""
    usage = defaultdict(list)
    
    for endpoint_file in endpoints_dir.glob('*.py'):
        if endpoint_file.name == '__init__.py':
            continue
        
        content = endpoint_file.read_text(encoding='utf-8')
        
        # Buscar imports de modelos
        for model_name in models.keys():
            # Buscar tanto imports como uso directo
            if re.search(rf'\b{model_name}\b', content):
                usage[model_name].append(endpoint_file.name)
    
    return dict(usage)


def detect_similar_tables(tables: Dict[str, Dict]) -> List[tuple]:
    """Detecta tablas con nombres similares que podran ser duplicadas"""
    similar_pairs = []
    table_names = list(tables.keys())
    
    for i, table1 in enumerate(table_names):
        for table2 in table_names[i+1:]:
            # Calcular similitud bsica
            similarity = calculate_similarity(table1, table2)
            if similarity > 0.6:  # Umbral de similitud
                similar_pairs.append((table1, table2, similarity))
    
    return similar_pairs


def calculate_similarity(str1: str, str2: str) -> float:
    """Calcula similitud simple entre dos strings"""
    # Similitud de Jaccard basada en bigramas
    def get_bigrams(s):
        return set(s[i:i+2] for i in range(len(s)-1))
    
    bigrams1 = get_bigrams(str1.lower())
    bigrams2 = get_bigrams(str2.lower())
    
    if not bigrams1 or not bigrams2:
        return 0.0
    
    intersection = len(bigrams1 & bigrams2)
    union = len(bigrams1 | bigrams2)
    
    return intersection / union if union > 0 else 0.0


def generate_audit_report(
    schema_tables: Dict,
    models: Dict,
    usage: Dict,
    similar_pairs: List
) -> str:
    """Genera el reporte de auditora en Markdown"""
    
    # Mapear modelos a tablas
    model_to_table = {model: info['table_name'] for model, info in models.items()}
    table_to_model = {info['table_name']: model for model, info in models.items()}
    
    # Clasificar tablas
    active_tables = set()
    zombie_models = []  # Modelos definidos pero no usados
    orphan_tables = []  # Tablas en BD sin modelo
    
    for model, endpoints in usage.items():
        if endpoints:
            table_name = models[model]['table_name']
            active_tables.add(table_name)
    
    for model, info in models.items():
        if model not in usage or not usage[model]:
            zombie_models.append((model, info['table_name']))
    
    for table_name in schema_tables.keys():
        if table_name not in table_to_model and table_name not in active_tables:
            orphan_tables.append(table_name)
    
    # Generar Markdown
    lines = [
        "# Reporte de Auditora: Base de Datos y API",
        "",
        f"**Fecha:** {Path(__file__).stat().st_mtime}",
        "**Proyecto:** UrbanVibe Backend",
        "",
        "---",
        "",
        "## Resumen Ejecutivo",
        "",
        f"-  **Tablas en esquema BD:** {len(schema_tables)}",
        f"-  **Modelos SQLAlchemy:** {len(models)}",
        f"- OK **Tablas activas (usadas en endpoints):** {len(active_tables)}",
        f"- [ZOMBIE] **Modelos zombie (no usados):** {len(zombie_models)}",
        f"- ADVERTENCIA **Tablas hurfanas (sin modelo):** {len(orphan_tables)}",
        f"-  **Posibles duplicaciones:** {len(similar_pairs)}",
        "",
        "---",
        "",
        "## 1 Tablas ACTIVAS (En Uso)",
        "",
        "Estas tablas tienen modelos SQLAlchemy y se usan en al menos un endpoint.",
        ""
    ]
    
    for table_name in sorted(active_tables):
        model_name = table_to_model.get(table_name, 'N/A')
        endpoints = usage.get(model_name, [])
        lines.extend([
            f"### OK `{table_name}`",
            "",
            f"- **Modelo:** `{model_name}`",
            f"- **Usado en:** {len(endpoints)} endpoint(s)",
            f"  - {', '.join(f'`{e}`' for e in endpoints[:3])}{'...' if len(endpoints) > 3 else ''}",
            ""
        ])
    
    lines.extend([
        "---",
        "",
        "## 2 Modelos ZOMBIE (Definidos pero NO usados)",
        "",
        "ADVERTENCIA **ACCIN RECOMENDADA:** Revisar si estos modelos son necesarios o se pueden eliminar.",
        ""
    ])
    
    if zombie_models:
        for model_name, table_name in sorted(zombie_models):
            file_name = models[model_name]['file']
            lines.extend([
                f"### [ZOMBIE] `{model_name}`  tabla `{table_name}`",
                "",
                f"- **Archivo:** `app/models/{file_name}`",
                f"- **Estado:** No se encuentra ninguna referencia en endpoints",
                f"- **Recomendacin:** Verificar si es legacy o si falta implementar endpoints",
                ""
            ])
    else:
        lines.append("OK No se encontraron modelos zombie. Todos los modelos estn en uso.")
        lines.append("")
    
    lines.extend([
        "---",
        "",
        "## 3 Tablas HURFANAS (En BD pero sin modelo)",
        "",
        "ADVERTENCIA **ACCIN RECOMENDADA:** Crear modelos o considerar eliminar estas tablas.",
        ""
    ])
    
    if orphan_tables:
        for table_name in sorted(orphan_tables):
            desc = schema_tables.get(table_name, {}).get('description', 'Sin descripcin')
            lines.extend([
                f"### ADVERTENCIA `{table_name}`",
                "",
                f"- **Descripcin:** {desc}",
                f"- **Estado:** Existe en BD pero NO tiene modelo SQLAlchemy",
                f"- **Recomendacin:** Crear modelo si es necesaria, o eliminar si es legacy",
                ""
            ])
    else:
        lines.append("OK No se encontraron tablas hurfanas. Todas las tablas tienen modelos.")
        lines.append("")
    
    lines.extend([
        "---",
        "",
        "## 4 Posibles DUPLICACIONES",
        "",
        " Tablas con nombres similares que podran estar duplicando funcionalidad.",
        ""
    ])
    
    if similar_pairs:
        for table1, table2, similarity in sorted(similar_pairs, key=lambda x: x[2], reverse=True):
            lines.extend([
                f"###  `{table1}`  `{table2}` (similitud: {similarity:.0%})",
                "",
                f"- **Tabla 1:** `{table1}` - {schema_tables.get(table1, {}).get('description', 'N/A')}",
                f"- **Tabla 2:** `{table2}` - {schema_tables.get(table2, {}).get('description', 'N/A')}",
                f"- **Recomendacin:** Revisar si pueden consolidarse",
                ""
            ])
    else:
        lines.append("OK No se detectaron duplicaciones obvias.")
        lines.append("")
    
    lines.extend([
        "---",
        "",
        "##  Prximos Pasos",
        "",
        "1. **Revisar modelos zombie:** Determinar si deben eliminarse o implementarse",
        "2. **Crear modelos faltantes:** Para tablas hurfanas que se usen",
        "3. **Consolidar duplicados:** Unificar tablas similares en un solo esquema",
        "4. **Documentar decisiones:** Actualizar `esquemaddbb.md` con el estado final",
        "",
        "---",
        "",
        "**Reporte generado automticamente por `audit_db_usage.py`**"
    ])
    
    return '\n'.join(lines)


def main():
    """Funcin principal"""
    print(" Iniciando auditora de Base de Datos y API...")
    
    # Rutas
    base_path = Path(__file__).parent.parent
    schema_path = base_path / 'esquemaddbb.md'
    models_dir = Path(__file__).parent / 'app' / 'models'
    endpoints_dir = Path(__file__).parent / 'app' / 'api' / 'v1' / 'endpoints'
    
    # 1. Extraer tablas del esquema
    print(" Extrayendo tablas de esquemaddbb.md...")
    schema_tables = extract_tables_from_schema_doc(schema_path)
    print(f"   OK Encontradas {len(schema_tables)} tablas")
    
    # 2. Extraer modelos SQLAlchemy
    print(" Analizando modelos SQLAlchemy...")
    models = extract_models_from_code(models_dir)
    print(f"   OK Encontrados {len(models)} modelos")
    
    # 3. Detectar uso en endpoints
    print(" Analizando uso en endpoints...")
    usage = find_model_usage_in_endpoints(endpoints_dir, models)
    active_count = sum(1 for v in usage.values() if v)
    print(f"   OK {active_count} modelos activos")
    
    # 4. Detectar similitudes
    print(" Detectando posibles duplicaciones...")
    similar_pairs = detect_similar_tables(schema_tables)
    print(f"   ADVERTENCIA {len(similar_pairs)} pares similares")
    
    # 5. Generar reporte
    print(" Generando reporte...")
    report = generate_audit_report(schema_tables, models, usage, similar_pairs)
    
    # 6. Guardar
    output_path = base_path / 'DB_AUDIT_REPORT.md'
    output_path.write_text(report, encoding='utf-8')
    
    print(f"OK Reporte generado: {output_path}")
    print(f" Resumen:")
    print(f"   - Tablas en esquema: {len(schema_tables)}")
    print(f"   - Modelos SQLAlchemy: {len(models)}")
    print(f"   - Modelos activos: {active_count}")
    print(f"   - Modelos zombie: {len(models) - active_count}")


if __name__ == '__main__':
    main()
