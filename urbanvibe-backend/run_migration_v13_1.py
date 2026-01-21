import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

async def run_migration():
    # Cargar .env del backend
    backend_path = r"c:\UrbanVibe\UV APP\urbanvibe-backend"
    load_dotenv(os.path.join(backend_path, ".env"))
    
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ No se encontró DATABASE_URL en el .env")
        return

    print(f"🔗 Conectando a la base de datos...")
    engine = create_async_engine(db_url)
    
    sql_commands = [
        """
        CREATE TABLE IF NOT EXISTS public.friendships (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL,
            friend_id uuid NOT NULL,
            status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'blocked'::text])),
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now(),
            CONSTRAINT friendships_pkey PRIMARY KEY (id),
            CONSTRAINT friendships_user_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
            CONSTRAINT friendships_friend_fkey FOREIGN KEY (friend_id) REFERENCES public.profiles(id),
            CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
        );
        """,
        "CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);",
        "CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);"
    ]
    
    try:
        async with engine.begin() as conn:
            print("🚀 Ejecutando migración...")
            for cmd in sql_commands:
                if cmd.strip():
                    await conn.execute(text(cmd))
            print("✅ Tabla 'friendships' e índices creados exitosamente.")
    except Exception as e:
        print(f"❌ Error ejecutando la migración: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration())
