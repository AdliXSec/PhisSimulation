import asyncio
from app.core.database import async_session
from app.models.user import User
from sqlalchemy import select

async def check():
    async with async_session() as db:
        res = await db.execute(select(User).where(User.username == 'testuser_verify'))
        user = res.scalar_one_or_none()
        print(f'User: {user.username}, is_active: {user.is_active}')

asyncio.run(check())
