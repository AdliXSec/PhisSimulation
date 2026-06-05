import asyncio
from app.core.database import async_session
from app.models.user import User
from sqlalchemy import select
from app.core.security import create_verification_token
import requests

async def verify():
    async with async_session() as db:
        res = await db.execute(select(User).where(User.username == 'testuser_verify'))
        user = res.scalar_one_or_none()
        if not user:
            print("User not found")
            return
            
        token = create_verification_token(str(user.id))
        url = f"http://localhost:8000/api/v1/auth/verify-email?token={token}"
        print(f"Calling {url}")
        
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")

asyncio.run(verify())
