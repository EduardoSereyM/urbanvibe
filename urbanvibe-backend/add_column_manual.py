import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def add_column():
    async with AsyncSessionLocal() as session:
        try:
            print("Adding is_testing column...")
            await session.execute(text("ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS is_testing BOOLEAN DEFAULT FALSE;"))
            await session.commit()
            print("Column added successfully.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(add_column())
