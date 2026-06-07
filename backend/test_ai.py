import asyncio
import sys
from app.services.ai_service import generate_campaign_analysis

async def test():
    print("Starting AI test...")
    try:
        res = await generate_campaign_analysis("Stats summary dummy", "id")
        print("Success:")
        print(res)
    except Exception as e:
        print("Error:")
        print(type(e).__name__)
        print(str(e))

if __name__ == "__main__":
    asyncio.run(test())
