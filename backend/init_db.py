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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_sql_file(conn, file_path):
    if not os.path.exists(file_path):
        logger.warning(f"[!] File {file_path} not found. Skipping.")
        return
        
    logger.info(f"[*] Executing {os.path.basename(file_path)}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        sql = f.read()
        
    # We execute the file as a single block using the raw asyncpg connection.
    try:
        raw_conn = await conn.get_raw_connection()
        await raw_conn.driver_connection.execute(sql)
        logger.info(f"[*] Successfully executed {os.path.basename(file_path)}")
    except Exception as e:
        logger.error(f"[!] Error executing {os.path.basename(file_path)}: {str(e)}")
        # We don't re-raise here to allow the initialization to continue as best effort.

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
        base_dir = os.path.join(os.path.dirname(__file__), '..', 'database')
        
        # files to execute:
        # 1. Triggers (now idempotent with DROP TRIGGER IF EXISTS)
        await run_sql_file(conn, os.path.join(base_dir, 'triggers.sql'))
        
        # 2. Default landing page templates (only if empty)
        res_lp = await conn.execute(text("SELECT COUNT(*) FROM landing_page_templates"))
        if res_lp.scalar() == 0:
            await run_sql_file(conn, os.path.join(base_dir, 'migrations', '002_landing_page_templates.sql'))
            
        # 3. Seed data (only if empty)
        res_users = await conn.execute(text("SELECT COUNT(*) FROM users"))
        if res_users.scalar() == 0:
            await run_sql_file(conn, os.path.join(base_dir, 'seed.sql'))
            
    logger.info("[*] Database initialization fully completed!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_database())
