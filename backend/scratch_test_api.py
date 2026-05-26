import asyncio
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.core.security import create_access_token

async def get_test_token():
    return create_access_token({"sub": "test@test.com"})

async def test_api():
    token = await get_test_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    async with httpx.AsyncClient() as client:
        # Test valid URL
        resp = await client.post("http://localhost:8000/api/v1/osint/scrape", json={"url": "example.com"}, headers=headers, timeout=30.0)
        print("Status:", resp.status_code)
        print("Response:", resp.text)

if __name__ == "__main__":
    asyncio.run(test_api())
