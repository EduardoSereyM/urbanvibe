import asyncio
import logging
from sqlalchemy import text
from app.db.session import engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_migration():
    logger.info("🚀 Starting Venues Location Migration...")
    
    async with engine.begin() as conn:
        # 1. Add Columns (country_code already exists but might need FK)
        logger.info("Adding/Updating columns in venues...")
        await conn.execute(text("""
            ALTER TABLE public.venues
            ADD COLUMN IF NOT EXISTS region_id bigint,
            ADD COLUMN IF NOT EXISTS city_id bigint;
        """))
        
        # 2. Add Constraints
        logger.info("Adding foreign keys to venues...")
        await conn.execute(text("""
            DO $$
            BEGIN
                -- Country Code (Check if FK exists, if not add it)
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'venues_country_fk') THEN
                     -- Ensure data consistency first? assuming CL matches. 
                     -- If column exists but is not FK, just add constraint.
                    ALTER TABLE public.venues
                    ADD CONSTRAINT venues_country_fk
                    FOREIGN KEY (country_code) REFERENCES public.countries(code);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'venues_region_fk') THEN
                    ALTER TABLE public.venues
                    ADD CONSTRAINT venues_region_fk
                    FOREIGN KEY (region_id) REFERENCES public.regions(id);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'venues_city_fk') THEN
                    ALTER TABLE public.venues
                    ADD CONSTRAINT venues_city_fk
                    FOREIGN KEY (city_id) REFERENCES public.cities(id);
                END IF;
            END $$;
        """))
        
    logger.info("✅ Venues Location Migration Completed Successfully!")

if __name__ == "__main__":
    asyncio.run(run_migration())
