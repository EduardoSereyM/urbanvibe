import asyncio
import logging
from sqlalchemy import text
from app.db.session import engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_migration_v14_2():
    logger.info("Starting Migration V14.2: Updating venue_invitations for groups...")
    
    migration_steps = [
        # 1. Make friend_id nullable
        """ALTER TABLE public.venue_invitations ALTER COLUMN friend_id DROP NOT NULL""",
        
        # 2. Add group_id
        """ALTER TABLE public.venue_invitations ADD COLUMN IF NOT EXISTS group_id uuid""",
        
        # 3. Add FK for group_id
        """DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'venue_invitations_group_fk') THEN
                ALTER TABLE public.venue_invitations 
                ADD CONSTRAINT venue_invitations_group_fk 
                FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
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

    logger.info("Migration V14.2 applied successfully!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration_v14_2())
