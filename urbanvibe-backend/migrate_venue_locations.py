"""
Script para migrar venues legacy: asignar region_id y city_id basándose en los nombres existentes.
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def migrate_venues():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.connect() as conn:
        # 1. Obtener venues sin region_id o city_id pero con nombres
        venues_result = await conn.execute(text("""
            SELECT id, name, region_state, city, country_code 
            FROM venues 
            WHERE deleted_at IS NULL 
              AND (region_id IS NULL OR city_id IS NULL)
              AND (region_state IS NOT NULL OR city IS NOT NULL)
        """))
        venues = venues_result.fetchall()
        
        print(f"Encontrados {len(venues)} venues para migrar")
        
        for venue in venues:
            venue_id, name, region_state, city_name, country_code = venue
            print(f"\nProcesando: {name}")
            print(f"  region_state: {region_state}, city: {city_name}, country: {country_code}")
            
            region_id = None
            city_id = None
            
            # Buscar region_id por nombre
            if region_state:
                region_result = await conn.execute(text("""
                    SELECT id, name FROM regions 
                    WHERE name ILIKE :name 
                    LIMIT 1
                """), {"name": f"%{region_state}%"})
                region_row = region_result.fetchone()
                if region_row:
                    region_id = region_row[0]
                    print(f"  → Encontrada región: {region_row[1]} (ID: {region_id})")
            
            # Buscar city_id por nombre
            if city_name:
                city_result = await conn.execute(text("""
                    SELECT id, name FROM cities 
                    WHERE name ILIKE :name 
                    LIMIT 1
                """), {"name": f"%{city_name}%"})
                city_row = city_result.fetchone()
                if city_row:
                    city_id = city_row[0]
                    print(f"  → Encontrada ciudad: {city_row[1]} (ID: {city_id})")
            
            # Actualizar venue si encontramos al menos uno
            if region_id or city_id:
                await conn.execute(text("""
                    UPDATE venues 
                    SET region_id = COALESCE(:region_id, region_id),
                        city_id = COALESCE(:city_id, city_id),
                        country_code = COALESCE(country_code, 'CL')
                    WHERE id = :venue_id
                """), {"region_id": region_id, "city_id": city_id, "venue_id": venue_id})
                print(f"  ✅ Actualizado!")
            else:
                print(f"  ⚠️ No se encontraron coincidencias")
        
        await conn.commit()
        print("\n✅ Migración completada!")

if __name__ == "__main__":
    asyncio.run(migrate_venues())
