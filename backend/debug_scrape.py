import asyncio
import sys
import os

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from app.services.scraper_service import scrape_target_url
from playwright.async_api import async_playwright

async def debug_scrape(url, name):
    print(f"\nDebugging URL: {url}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage"
            ]
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800},
            java_script_enabled=True,
            bypass_csp=True
        )
        
        page = await context.new_page()
        
        try:
            print(f"Navigating to {url}...")
            response = await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            print(f"Response status: {response.status}")
            
            await page.wait_for_timeout(5000) # Wait more for Instagram
            
            html = await page.content()
            with open(f"debug_{name}.html", "w", encoding="utf-8") as f:
                f.write(html)
            print(f"Saved HTML to debug_{name}.html")
            
            # Check for common bot blocks
            if "login" in page.url.lower() and "instagram" in url:
                print("DETECTED: Redirected to login page!")
            
            if response.status >= 400:
                print(f"DETECTED: HTTP Error {response.status}")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

async def main():
    await debug_scrape("https://github.com/AdliXSec/", "github")
    await debug_scrape("https://www.instagram.com/cwcoffee.id/", "instagram")

if __name__ == "__main__":
    asyncio.run(main())
