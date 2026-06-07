import asyncio
import os
import sys
import logging
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

sys.path.append(os.getcwd())
from app.core.config import settings
from app.core.database import Base

# Import all models to ensure they are registered with SQLAlchemy Base.metadata
from app.models import *

from app.core.sql_scripts import TRIGGERS_SQL, SEED_SQL
from seed_html_templates import seed_templates

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_sql_string(conn, sql_str, name):
    logger.info(f"[*] Executing {name}...")
    try:
        # We execute the file as a single block using the raw asyncpg connection.
        raw_conn = await conn.get_raw_connection()
        await raw_conn.driver_connection.execute(sql_str)
        logger.info(f"[*] Successfully executed {name}")
    except Exception as e:
        logger.error(f"[!] Error executing {name}: {str(e)}")

async def init_database():
    logger.info(f"[*] Connecting to database at {settings.DATABASE_URL}...")
    engine = create_async_engine(settings.DATABASE_URL)
    
    # 1. Create all tables automatically based on SQLAlchemy models (Highly Robust & Idempotent)
    logger.info("[*] Synchronizing database schema with SQLAlchemy models...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("[*] Schema synchronization complete. All tables are up to date.")
        
    # 2. Run data seeding and triggers
    logger.info("[*] Applying triggers and seed data...")
    async with engine.begin() as conn:
        
        # 1. Triggers (now idempotent with DROP TRIGGER IF EXISTS)
        await run_sql_string(conn, TRIGGERS_SQL, "triggers.sql")
        
        # Ensure UUID primary keys have DB-side default (since create_all might have missed it previously)
        await conn.execute(text("ALTER TABLE landing_page_templates ALTER COLUMN id SET DEFAULT gen_random_uuid();"))
        await conn.execute(text("ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();"))
        await conn.execute(text("ALTER TABLE employee_risk_profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();"))
        await conn.execute(text("ALTER TABLE employees ALTER COLUMN id SET DEFAULT gen_random_uuid();"))

        # Add UI position columns if they don't exist (for existing tables)
        try:
            await conn.execute(text("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS ui_position_x FLOAT;"))
            await conn.execute(text("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS ui_position_y FLOAT;"))
            await conn.execute(text("ALTER TABLE departments ADD COLUMN IF NOT EXISTS ui_position_x FLOAT;"))
            await conn.execute(text("ALTER TABLE departments ADD COLUMN IF NOT EXISTS ui_position_y FLOAT;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS canvas_locked BOOLEAN DEFAULT FALSE;"))
        except Exception as e:
            logger.warning(f"[!] Could not add new columns: {e}")

        # No longer seed dummy landing page templates here
        # The script seed_html_templates.py handles seeding the custom HTML templates
            
        # 3. Seed data (only if empty)
        res_users = await conn.execute(text("SELECT COUNT(*) FROM users"))
        if res_users.scalar() == 0:
            await run_sql_string(conn, SEED_SQL, "seed.sql")
            
    # Run HTML seeding outside of the transaction block since it uses its own session
    logger.info("[*] Seeding HTML landing page templates...")
    try:
        await seed_templates()
    except Exception as e:
        logger.error(f"[!] Error seeding HTML templates: {str(e)}")
        
    logger.info("[*] Database initialization fully completed!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_database())
