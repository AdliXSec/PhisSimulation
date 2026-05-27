import asyncio
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.core.limiter import limiter

# Fix for Playwright/Subprocess on Windows:
# Use ProactorEventLoop instead of SelectorEventLoop
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from app.api.v1 import auth, departments, employees, campaigns, tracking, reports, landing_pages, api_keys, receive, intel, osint, saved_templates


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    print(f"[*] {settings.APP_NAME} starting up...")
    yield
    print(f"[*] {settings.APP_NAME} shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Platform Simulasi Phishing untuk Internal Security Awareness",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "*"],  # Allow external sites to POST
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Authentication"])
app.include_router(departments.router, prefix=f"{settings.API_V1_PREFIX}/departments", tags=["Departments"])
app.include_router(employees.router, prefix=f"{settings.API_V1_PREFIX}/employees", tags=["Employees"])
app.include_router(campaigns.router, prefix=f"{settings.API_V1_PREFIX}/campaigns", tags=["Campaigns"])
app.include_router(tracking.router, prefix=f"{settings.API_V1_PREFIX}/track", tags=["Tracking"])
app.include_router(reports.router, prefix=f"{settings.API_V1_PREFIX}/reports", tags=["Reports"])
app.include_router(landing_pages.router, prefix=f"{settings.API_V1_PREFIX}/landing-pages", tags=["Landing Pages"])
app.include_router(api_keys.router, prefix=f"{settings.API_V1_PREFIX}/api-keys", tags=["API Keys"])
app.include_router(receive.router, prefix=f"{settings.API_V1_PREFIX}/receive", tags=["External Receive"])
app.include_router(osint.router, prefix=f"{settings.API_V1_PREFIX}/osint", tags=["OSINT"])
app.include_router(saved_templates.router, prefix=f"{settings.API_V1_PREFIX}/saved-templates", tags=["Saved Templates"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
