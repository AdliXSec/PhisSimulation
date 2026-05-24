import asyncio
import os
from sqlalchemy import text
from app.core.database import engine

async def run_migration():
    migration_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database", "migrations", "005_drop_unique_constraints.sql")
    
    with open(migration_path, "r") as f:
        sql_content = f.read()

    print(f"Running migration from {migration_path}...")
    
    statements = [s.strip() for s in sql_content.split(';') if s.strip()]
    
    async with engine.begin() as conn:
        for stmt in statements:
            if stmt:
                await conn.execute(text(stmt))
        
    print("Migration completed successfully.")

if __name__ == "__main__":
    asyncio.run(run_migration())
