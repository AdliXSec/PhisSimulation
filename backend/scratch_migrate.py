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
        print("Migrating campaigns...")
        try:
            await conn.execute(text("ALTER TABLE campaigns ADD COLUMN ui_position_x FLOAT;"))
            await conn.execute(text("ALTER TABLE campaigns ADD COLUMN ui_position_y FLOAT;"))
            print("Successfully added columns to campaigns")
        except Exception as e:
            print(f"Error on campaigns (might already exist): {e}")
            
        print("Migrating departments...")
        try:
            await conn.execute(text("ALTER TABLE departments ADD COLUMN ui_position_x FLOAT;"))
            await conn.execute(text("ALTER TABLE departments ADD COLUMN ui_position_y FLOAT;"))
            print("Successfully added columns to departments")
        except Exception as e:
            print(f"Error on departments (might already exist): {e}")

    await engine.dispose()
    print("Done")

if __name__ == "__main__":
    asyncio.run(migrate())
