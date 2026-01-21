import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def create_table():
    sql = """
    CREATE TABLE IF NOT EXISTS public.venue_invitations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES public.profiles(id),
        friend_id uuid NOT NULL REFERENCES public.profiles(id),
        venue_id uuid NOT NULL REFERENCES public.venues(id),
        message text,
        status text NOT NULL DEFAULT 'pending',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    );
    """
    async with AsyncSessionLocal() as db:
        await db.execute(text(sql))
        await db.commit()
    print("Table venue_invitations created successfully")

if __name__ == "__main__":
    asyncio.run(create_table())
