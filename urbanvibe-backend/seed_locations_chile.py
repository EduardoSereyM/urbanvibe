import asyncio
import logging
from app.db.session import AsyncSessionLocal
from app.models.locations import Country, Region, City
from sqlalchemy import select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Data: Chile Regiones y Comunas (Limitado a RM por ahora)
CHILE_DATA = {
    "Metropolitana de Santiago": [
        # Provincia de Santiago
        "Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia",
        "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo",
        "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura",
        "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura",
        # Provincia de Cordillera
        "Puente Alto", "Pirque", "San José de Maipo",
        # Provincia de Chacabuco
        "Colina", "Lampa", "Tiltil",
        # Provincia de Maipo
        "San Bernardo", "Buin", "Calera de Tango", "Paine",
        # Provincia de Melipilla
        "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro",
        # Provincia de Talagante
        "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"
    ]
}

async def seed_locations():
    async with AsyncSessionLocal() as session:
        logger.info("🌱 Seeding Locations for CHILE...")
        
        # 1. Country
        country = await session.get(Country, "CL")
        if not country:
            country = Country(code="CL", name="Chile")
            session.add(country)
            await session.commit()
            logger.info("✅ Created Country: Chile (CL)")
        else:
            logger.info("ℹ️ Country Chile already exists.")
            
        # 2. Regions & Cities
        for region_name, cities_list in CHILE_DATA.items():
            # Check Region
            query = select(Region).where(Region.name == region_name, Region.country_code == "CL")
            result = await session.execute(query)
            region = result.scalars().first()
            
            if not region:
                region = Region(name=region_name, country_code="CL")
                session.add(region)
                await session.flush() # get ID
                logger.info(f"  ✅ Created Region: {region_name}")
            else:
                logger.info(f"  ℹ️ Region {region_name} exists.")
                
            # Check Cities
            for city_name in cities_list:
                c_query = select(City).where(City.name == city_name, City.region_id == region.id)
                c_result = await session.execute(c_query)
                city = c_result.scalars().first()
                
                if not city:
                    city = City(name=city_name, region_id=region.id)
                    session.add(city)
                    logger.info(f"    -> Added City: {city_name}")
        
        await session.commit()
        logger.info("✨ Seeding Completed Successfully!")

if __name__ == "__main__":
    asyncio.run(seed_locations())
