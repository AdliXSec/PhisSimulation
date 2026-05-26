import asyncio
import sys
import os

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from app.services.scraper_service import scrape_target_url

async def main():
    urls = [
        "https://github.com/AdliXSec/",
        "https://www.instagram.com/cwcoffee.id/"
    ]
    
    for url in urls:
        print(f"\nTesting URL: {url}")
        try:
            text = await scrape_target_url(url)
            print(f"Scrape successful! Length: {len(text)}")
            print("First 200 characters of text:")
            print(text[:200])
            
            if len(text.strip()) < 50:
                 print("WARNING: Text is too short!")
                 
        except Exception as e:
            print(f"Scrape failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
