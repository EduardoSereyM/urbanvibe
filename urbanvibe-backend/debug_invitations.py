import asyncio
from sqlalchemy import text, select
from app.db.session import AsyncSessionLocal
from app.models.profiles import Profile
from app.models.venues import Venue

async def debug_check():
    code_to_find = "UV-15VWZR"
    print(f"--- Debugging Code: {code_to_find} ---")

    async with AsyncSessionLocal() as db:
        # 1. Raw SQL Check (Bypasses ORM potential issues)
        print("\n1. Executing RAW SQL query...")
        try:
            result = await db.execute(text(f"SELECT id, username, referral_code FROM public.profiles WHERE referral_code = '{code_to_find}'"))
            row = result.first()
            if row:
                print(f"✅ FOUND in Profiles via SQL: {row}")
            else:
                print("❌ NOT FOUND in Profiles via SQL")
                
            result_v = await db.execute(text(f"SELECT id, name, referral_code FROM public.venues WHERE referral_code = '{code_to_find}'"))
            row_v = result_v.first()
            if row_v:
                print(f"✅ FOUND in Venues via SQL: {row_v}")
            else:
                print("❌ NOT FOUND in Venues via SQL")

        except Exception as e:
            print(f"SQL Error: {e}")

        # 2. ORM Check
        print("\n2. Executing ORM query...")
        try:
            # Check Profiles
            q = select(Profile).where(Profile.referral_code == code_to_find)
            res = await db.execute(q)
            user = res.scalars().first()
            if user:
                print(f"✅ FOUND in Profiles via ORM: {user.username} (ID: {user.id})")
            else:
                print("❌ NOT FOUND in Profiles via ORM")

            # Check Venues
            q2 = select(Venue).where(Venue.referral_code == code_to_find)
            res2 = await db.execute(q2)
            venue = res2.scalars().first()
            if venue:
                print(f"✅ FOUND in Venues via ORM: {venue.name}")
            else:
                print("❌ NOT FOUND in Venues via ORM")

        except Exception as e:
             print(f"ORM Error: {e}")
             
        # 3. List some valid codes to see what IS there
        print("\n3. Listing top 5 referral codes in Profiles:")
        try:
            res_all = await db.execute(text("SELECT referral_code FROM public.profiles WHERE referral_code IS NOT NULL LIMIT 5"))
            for r in res_all:
                print(f" - {r[0]}")
        except Exception as e:
            print(e)

if __name__ == "__main__":
    asyncio.run(debug_check())
