import asyncio
import logging
from sqlalchemy import text
from app.db.session import engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_migration():
    logger.info("🚀 Starting Locations Migration...")
    
    async with engine.begin() as conn:
        # 1. Add Columns
        logger.info("Adding columns to profiles...")
        await conn.execute(text("""
            ALTER TABLE public.profiles
            ADD COLUMN IF NOT EXISTS country_code text,
            ADD COLUMN IF NOT EXISTS region_id bigint,
            ADD COLUMN IF NOT EXISTS city_id bigint;
        """))
        
        # 2. Add Constraints (using DO block for idempotency)
        logger.info("Adding foreign keys...")
        await conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_country_fk') THEN
                    ALTER TABLE public.profiles
                    ADD CONSTRAINT profiles_country_fk
                    FOREIGN KEY (country_code) REFERENCES public.countries(code);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_region_fk') THEN
                    ALTER TABLE public.profiles
                    ADD CONSTRAINT profiles_region_fk
                    FOREIGN KEY (region_id) REFERENCES public.regions(id);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_city_fk') THEN
                    ALTER TABLE public.profiles
                    ADD CONSTRAINT profiles_city_fk
                    FOREIGN KEY (city_id) REFERENCES public.cities(id);
                END IF;
            END $$;
        """))
        
    logger.info("✅ Locations Migration Completed Successfully!")

if __name__ == "__main__":
    asyncio.run(run_migration())
