import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def run():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.execute(text('''
            CREATE TABLE IF NOT EXISTS osint_profiles (
                id UUID PRIMARY KEY,
                target_name VARCHAR(255) NOT NULL,
                target_role VARCHAR(255),
                public_data TEXT NOT NULL,
                risk_level VARCHAR(50) NOT NULL,
                vulnerability_summary TEXT NOT NULL,
                attack_vectors JSONB NOT NULL,
                example_phishing_email JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
            )
        '''))
    print("Table created.")

if __name__ == "__main__":
    asyncio.run(run())
