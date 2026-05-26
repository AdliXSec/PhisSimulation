import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys
import os

# Add current directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app.core.config import settings
    database_url = settings.DATABASE_URL
except ImportError:
    # Fallback to hardcoded if import fails
    database_url = "postgresql+asyncpg://phisim_admin:phisim_secret_2026@localhost:5432/phisimulation"

async def fix_columns():
    print(f"[*] Mencoba menyambung ke database: {database_url}")
    engine = create_async_engine(database_url)
    
    async with engine.begin() as conn:
        print("[*] Menambahkan kolom processed_count dan error_count ke tabel campaigns...")
        try:
            await conn.execute(text("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS processed_count INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0;"))
            print("[+] Berhasil memperbarui tabel campaigns!")
        except Exception as e:
            print(f"[!] Gagal memperbarui tabel: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix_columns())
