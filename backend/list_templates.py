import asyncio
import os
import sys

# Add backend dir to path
sys.path.append(os.path.abspath('r:/project/phisimulation/backend'))

from app.core.database import async_session
from sqlalchemy import text

async def list_templates():
    async with async_session() as session:
        result = await session.execute(text("SELECT id, name, is_default FROM landing_page_templates"))
        rows = result.fetchall()
        for r in rows:
            print(f'{r.id} | {r.name} | {r.is_default}')

asyncio.run(list_templates())
