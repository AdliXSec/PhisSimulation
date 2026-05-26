from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncio
from app.services.scraper_service import scrape_target_url

app = FastAPI()

@app.get("/test")
async def test_scrape():
    try:
        text = await scrape_target_url("https://example.com")
        return {"text": text[:100]}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
