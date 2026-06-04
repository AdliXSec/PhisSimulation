import asyncio
import os
import sys
sys.path.append(os.path.abspath('r:/project/phisimulation/backend'))

from app.core.database import async_session
from sqlalchemy import text

async def delete_dummy():
    async with async_session() as session:
        await session.execute(text("DELETE FROM landing_page_templates WHERE name IN ('Microsoft 365 Login', 'Google Workspace Login', 'Portal Internal Perusahaan', 'Banking Portal')"))
        await session.commit()
        print('Deleted dummy templates.')

asyncio.run(delete_dummy())
