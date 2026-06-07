import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

sys.path.append(os.getcwd())
from app.core.config import settings

async def migrate():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        print("Migrating users...")
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS canvas_locked BOOLEAN DEFAULT FALSE;"))
            print("Successfully added columns to users")
        except Exception as e:
            print(f"Error on users: {e}")

    await engine.dispose()
    print("Done")

if __name__ == "__main__":
    asyncio.run(migrate())
