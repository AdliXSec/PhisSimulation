from fastapi import FastAPI
import asyncio
from playwright.async_api import async_playwright

app = FastAPI()

@app.get("/test")
async def test_scrape():
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            await page.goto("https://github.com/AdliXSec/")
            html = await page.content()
            await browser.close()
            return {"html": html[:100]}
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002)
