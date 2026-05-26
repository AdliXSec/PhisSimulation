import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
import os
import sys

# Add current directory to sys.path to import app
sys.path.append(os.getcwd())

from app.core.config import settings

async def run_single_migration(file_path):
    print(f"Connecting to database at {settings.DATABASE_URL}...")
    # Replace localhost with 127.0.0.1 if needed or keep as is from settings
    # The error message showed password failure, so settings must be correct but maybe db is not reachable via localhost
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        sql = f.read()
        
    async with engine.begin() as conn:
        from sqlalchemy import text
        print(f"Running migration from {file_path}...")
        # Split by semicolon and execute one by one
        commands = sql.split(';')
        for cmd in commands:
            cmd = cmd.strip()
            if cmd:
                await conn.execute(text(cmd))
        
    print("Migration complete!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python backend/apply_migration.py <path_to_sql_file>")
        sys.exit(1)
    
    asyncio.run(run_single_migration(sys.argv[1]))
