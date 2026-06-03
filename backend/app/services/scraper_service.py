import asyncio
import re
import sys
import json
import ipaddress
import socket
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

def is_valid_url(url: str) -> bool:
    """
    Check if the URL is valid and points to a public, non-local address (SSRF Protection).
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ["http", "https"]:
            return False
        
        hostname = parsed.hostname
        if not hostname:
            return False
            
        # 1. Block known local hostnames
        if hostname.lower() in ["localhost", "local", "loopback"]:
            return False
            
        # 2. Resolve hostname to IP and check if it's private/local
        try:
            # We use getaddrinfo to handle both IPv4 and IPv6
            addr_info = socket.getaddrinfo(hostname, None)
            for family, _, _, _, sockaddr in addr_info:
                ip_str = sockaddr[0]
                ip = ipaddress.ip_address(ip_str)
                
                if ip.is_loopback or ip.is_private or ip.is_link_local or ip.is_multicast:
                    return False
                
                # Special block for cloud metadata IPs
                if str(ip) == "169.254.169.254":
                    return False
        except socket.gaierror:
            # If we can't resolve it, it might be a malformed hostname
            return False
            
        return True
    except Exception:
        return False

def _sync_scrape(url: str) -> str:
    """
    Enhanced synchronous scraping logic with auto-scroll and metadata extraction.
    """
    if not is_valid_url(url):
        raise ValueError("URL tidak valid atau mengarah ke jaringan lokal (SSRF Protection).")

    with sync_playwright() as p:
        try:
            import os
            # Hanya gunakan path lokal jika dijalankan di server Railway
            if "RAILWAY_ENVIRONMENT_NAME" in os.environ or "RAILWAY_PROJECT_ID" in os.environ:
                os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "0"

            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-web-security",
                    "--disable-features=IsolateOrigins,site-per-process",
                    "--lang=en-US,en"
                ]
            )
        except Exception as launch_error:
            raise ValueError(f"Gagal menjalankan browser: {str(launch_error)}")

        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 1000},
            java_script_enabled=True,
            bypass_csp=True,
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            }
        )
        
        # Add stealth scripts (simple version)
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            window.chrome = { runtime: {} };
            Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});
        """)
        
        page = context.new_page()
        
        try:
            print(f"[*] (Thread) Scraping mendalam: {url}")
            # Use a longer timeout for complex sites
            page.goto(url, wait_until="domcontentloaded", timeout=45000)
            
            # --- Auto Scroll to trigger lazy loading ---
            # Good for social media feeds
            if any(x in url for x in ["instagram.com", "github.com", "linkedin.com", "twitter.com", "x.com"]):
                print("[*] Melakukan auto-scroll untuk memuat konten dinamis...")
                for _ in range(3):
                    page.mouse.wheel(0, 800)
                    page.wait_for_timeout(1000)
            
            # Specific wait for content
            page.wait_for_timeout(5000)
            
            # --- Extract Metadata first ---
            html_content = page.content()
            soup = BeautifulSoup(html_content, "html.parser")
            
            metadata = []
            
            # 1. OpenGraph & Meta tags
            for tag in soup.find_all("meta"):
                prop = tag.get("property", tag.get("name", ""))
                cont = tag.get("content", "")
                if any(x in prop.lower() for x in ["description", "title", "og:image", "keywords", "author"]):
                    metadata.append(f"[{prop}]: {cont}")
            
            # 2. JSON-LD (Rich results - often contains profile details)
            json_ld_data = []
            for script in soup.find_all("script", type="application/ld+json"):
                try:
                    js_data = json.loads(script.string)
                    # Flatten or extract relevant bits
                    if isinstance(js_data, dict):
                        for k, v in js_data.items():
                            if k in ["name", "description", "jobTitle", "address", "email", "telephone"]:
                                json_ld_data.append(f"{k}: {v}")
                except:
                    continue

            # --- Clean up and extract body text ---
            unwanted_tags = ["script", "style", "aside", "form", "iframe", "noscript", "svg", "button", "dialog"]
            # Sites where we want to keep nav/header/footer because they often contain profile bio info
            if not any(x in url for x in ["instagram.com", "github.com", "twitter.com", "x.com"]):
                unwanted_tags.extend(["nav", "footer", "header"])
                
            for element in soup(unwanted_tags):
                element.decompose()
            
            body_text = soup.get_text(separator="\n", strip=True)
            
            # Combine everything
            final_parts = []
            if metadata:
                final_parts.append("--- METADATA ---")
                final_parts.extend(metadata[:10]) # Limit to top 10 meta tags
            
            if json_ld_data:
                final_parts.append("\n--- STRUCTURED DATA ---")
                final_parts.extend(json_ld_data)
                
            final_parts.append("\n--- PAGE CONTENT ---")
            final_parts.append(body_text)
            
            full_text = "\n".join(final_parts)
            
            # Clean up excessive newlines
            clean_text = re.sub(r'\n\s*\n', '\n\n', full_text)
            
            # Limit length to avoid overwhelming AI but keep enough for analysis
            if len(clean_text) > 12000:
                clean_text = clean_text[:12000] + "... [TRUNCATED]"
                
            return clean_text

        except Exception as e:
            print(f"Error scraping {url}: {e}")
            raise ValueError(f"Gagal melakukan scraping mendalam: {str(e)}")
        finally:
            browser.close()

async def scrape_target_url(url: str) -> str:
    """
    Scrape URL with deep extraction logic in a separate thread.
    """
    return await asyncio.to_thread(_sync_scrape, url)
