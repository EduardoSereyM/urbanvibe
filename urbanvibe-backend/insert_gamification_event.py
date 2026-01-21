import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def insert_event():
    sql = """
    INSERT INTO public.gamification_events (event_code, target_type, description, points, is_active)
    VALUES ('FRIEND_INVITE_VENUE', 'user', 'Invitar a un amigo a un local', 10, true)
    ON CONFLICT (event_code) DO NOTHING;
    """
    async with AsyncSessionLocal() as db:
        await db.execute(text(sql))
        await db.commit()
    print("Gamification event inserted successfully")

if __name__ == "__main__":
    asyncio.run(insert_event())
