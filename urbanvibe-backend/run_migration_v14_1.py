import asyncio
import logging
from sqlalchemy import text
from app.db.session import engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_migration_v14_1():
    logger.info("Starting Migration V14.1: Adding group_id to checkins...")
    
    migration_steps = [
        """ALTER TABLE public.checkins 
           ADD COLUMN IF NOT EXISTS group_id uuid""",
        
        """DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checkins_group_fk') THEN
                ALTER TABLE public.checkins 
                ADD CONSTRAINT checkins_group_fk 
                FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE SET NULL;
            END IF;
        END $$"""
    ]

    async with engine.begin() as conn:
        for i, step in enumerate(migration_steps):
            logger.info(f"Executing step {i+1}/{len(migration_steps)}...")
            try:
                await conn.execute(text(step))
            except Exception as e:
                logger.error(f"Error in step {i+1}: {e}")
                raise

    logger.info("Migration V14.1 applied successfully!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration_v14_1())
