import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def check_venue():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.connect() as conn:
        result = await conn.execute(text("""
            SELECT name, region_id, city_id, region_state, city, country_code 
            FROM venues 
            WHERE deleted_at IS NULL
            LIMIT 5
        """))
        for row in result:
            print(f'Name: {row[0]}')
            print(f'  region_id: {row[1]}, city_id: {row[2]}')
            print(f'  region_state: {row[3]}, city: {row[4]}, country: {row[5]}')
            print()

asyncio.run(check_venue())
