import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def run_migrations():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    sql_create_table = """
    CREATE TABLE IF NOT EXISTS saved_templates (
        id UUID PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        email_subject VARCHAR(500) NOT NULL,
        email_body_html TEXT NOT NULL,
        email_sender_name VARCHAR(200) NOT NULL,
        landing_page_config JSONB DEFAULT '{}'::jsonb,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    sql_alter_campaign = """
    ALTER TABLE campaigns 
    ADD COLUMN IF NOT EXISTS use_qr_code BOOLEAN DEFAULT FALSE;
    """
    
    async with engine.begin() as conn:
        print("Creating saved_templates table...")
        await conn.execute(text(sql_create_table))
        print("Altering campaigns table...")
        await conn.execute(text(sql_alter_campaign))
        
    print("Phase 4 Migrations complete!")

if __name__ == "__main__":
    asyncio.run(run_migrations())
