import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
import os

from app.core.config import settings

async def run_migrations():
    # Use the connection string from settings
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    # Read migration files
    migration1_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'migrations', '001_add_landing_page_config.sql')
    migration2_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'migrations', '002_landing_page_templates.sql')
    
    with open(migration1_path, 'r', encoding='utf-8') as f:
        sql1 = f.read()
        
    with open(migration2_path, 'r', encoding='utf-8') as f:
        sql2 = f.read()
        
    async with engine.begin() as conn:
        from sqlalchemy import text
        print("Running migration 001...")
        await conn.execute(text(sql1))
        print("Running migration 002...")
        await conn.execute(text(sql2))
        
    print("Migrations complete!")

if __name__ == "__main__":
    asyncio.run(run_migrations())
