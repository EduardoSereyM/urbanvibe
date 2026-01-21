import asyncio
import logging
from sqlalchemy import text
from app.db.session import engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_migration_v14():
    logger.info("Starting Migration V14: Groups Ecosystem...")
    
    migration_steps = [
        # 1. Table Groups
        """CREATE TABLE IF NOT EXISTS public.groups (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            description text,
            avatar_url text,
            creator_id uuid NOT NULL,
            is_private boolean DEFAULT true,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            CONSTRAINT groups_creator_fk FOREIGN KEY (creator_id) REFERENCES public.profiles(id)
        )""",

        # 2. Table Group Members
        """CREATE TABLE IF NOT EXISTS public.group_members (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            group_id uuid NOT NULL,
            user_id uuid NOT NULL,
            role text NOT NULL DEFAULT 'member',
            joined_at timestamptz DEFAULT now(),
            CONSTRAINT group_members_group_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE,
            CONSTRAINT group_members_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id),
            CONSTRAINT unique_group_membership UNIQUE (group_id, user_id)
        )""",

        # 3. Table Group Invitations
        """CREATE TABLE IF NOT EXISTS public.group_invitations (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            group_id uuid NOT NULL,
            inviter_id uuid NOT NULL,
            invitee_id uuid NOT NULL,
            status text NOT NULL DEFAULT 'pending',
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            CONSTRAINT group_invitations_group_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE,
            CONSTRAINT group_invitations_inviter_fk FOREIGN KEY (inviter_id) REFERENCES public.profiles(id),
            CONSTRAINT group_invitations_invitee_fk FOREIGN KEY (invitee_id) REFERENCES public.profiles(id),
            CONSTRAINT group_invitations_status_check CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled'))
        )""",
        
        # Add new gamification event for group check-ins if not exists
        """INSERT INTO public.gamification_events (event_code, target_type, description, points, is_active) VALUES
            ('GROUP_CHECKIN', 'user', 'Check-in grupal (bonificado x1.5)', 15, true)
            ON CONFLICT (event_code) DO NOTHING"""
    ]

    async with engine.begin() as conn:
        for i, step in enumerate(migration_steps):
            logger.info(f"Executing step {i+1}/{len(migration_steps)}...")
            try:
                await conn.execute(text(step))
            except Exception as e:
                logger.error(f"Error in step {i+1}: {e}")
                raise

    logger.info("Migration V14: Groups Ecosystem applied successfully!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration_v14())
