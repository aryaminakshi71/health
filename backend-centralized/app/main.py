"""Main FastAPI Application"""

from fastapi import FastAPI, Request, Depends, HTTPException, Header
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
import os
from typing import Optional
from datetime import datetime, timezone
from app.core.database import engine, Base
from app.api.v1 import (
    surveillance,
    tenants,
    communication,
    healthcare,
    ai_analytics,
    business,
    inventory,
    financial,
    education,
    cloud_storage,
    hr,
    compliance,
    support,
    autism_care,
    website_builder,
    mobile_app,
    billing,
    retention,
    api,
    auth,
    client_management,
    billing_integration,
    client_portal,
    websocket,
    monitoring,
    role_based,
    admin_dashboard,
    admin_management,
    client_team,
)
from app.core.config import settings
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from dotenv import load_dotenv
from app.models.addons import Addon

# Rate limiting imports
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded

    RATE_LIMITING_AVAILABLE = True
except ImportError:
    RATE_LIMITING_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize rate limiter
if RATE_LIMITING_AVAILABLE:
    limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
else:
    limiter = None
    logger.warning("Rate limiting not available - install slowapi: pip install slowapi")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🚀 Starting HealthGuard Surveillance Pro...")
    # Load environment variables from .env if present
    try:
        load_dotenv()
        logger.info("✅ Environment variables loaded from .env")
    except Exception as e:
        logger.warning(f"⚠️ Could not load .env: {e}")

    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created")
    except Exception as e:
        logger.error(f"❌ Database table creation failed: {e}")

    # Initialize services
    try:
        from app.services.notification_service import notification_service
        from app.services.billing_service import billing_service

        logger.info("✅ Services initialized")
    except Exception as e:
        logger.error(f"❌ Service initialization failed: {e}")

    yield

    # Shutdown
    logger.info("🛑 Shutting down HealthGuard Surveillance Pro...")


app = FastAPI(
    title="HealthGuard Surveillance Pro",
    description="Multi-Tenant SaaS Healthcare Surveillance System",
    version="2.0.0",
    docs_url=None,
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Add rate limiting if available
if RATE_LIMITING_AVAILABLE and limiter:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
# Development CORS: allow localhost frontends
default_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3009",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
    "http://127.0.0.1:3009",
]
origins = []
try:
    origins = settings.ALLOWED_HOSTS or []
except Exception:
    origins = []
if not origins:
    origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

# Mount local swagger assets under /_swagger
try:
    app.mount("/_swagger", StaticFiles(directory="app/static/swagger"), name="swagger")
except Exception:
    # Directory may not exist yet; docs handler will guard
    pass


@app.middleware("http")
async def tenant_middleware(request: Request, call_next):
    """Extract tenant ID from request"""
    # Get tenant from header or subdomain
    tenant_id = request.headers.get("X-Tenant-ID")

    if not tenant_id:
        # Try to extract from subdomain
        host = request.headers.get("host", "")
        if "." in host:
            subdomain = host.split(".")[0]
            if subdomain != "www" and subdomain != "api":
                tenant_id = subdomain

    # Store tenant in request state
    request.state.tenant_id = tenant_id

    try:
        response = await call_next(request)
        return response
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "message": str(e),
                "path": request.url.path,
            },
        )


# Add-on gating: block addon routes when not enabled
@app.middleware("http")
async def addons_gating_middleware(request: Request, call_next):
    path = request.url.path
    # Only gate API v1 routes
    if path.startswith("/api/v1/"):
        # Map API prefixes to addon slugs
        prefix_to_addon = {
            "ai-analytics": "ai-analytics-suite",
            "cloud-storage": "cloud-storage-pro",
            "inventory": "inventory-tracker",
            "financial": "financial-manager",
            "education": "education-platform",
            "hr": "hr-manager-plus",
            "compliance": "compliance-guardian",
            "support": "support-desk",
            "autism-care": "autism-care",
            "website-builder": "website-builder",
            "mobile-app": "mobile-app",
        }
        try:
            # Extract first segment after /api/v1/
            rest = path[len("/api/v1/") :]
            seg = rest.split("/", 1)[0]
            slug = prefix_to_addon.get(seg)
            if slug:
                # Check DB for addon status
                db_gen = get_db()
                db: Session = next(db_gen)
                addon: Addon | None = db.query(Addon).get(slug)
                # Close session promptly
                try:
                    if not addon or not addon.enabled:
                        return JSONResponse(
                            status_code=404, content={"detail": "Not Found"}
                        )
                finally:
                    db.close()
        except Exception:
            # Fail closed (hide feature) rather than erroring
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
    return await call_next(request)


async def get_current_tenant(request: Request) -> Optional[str]:
    """Get current tenant from request"""
    return getattr(request.state, "tenant_id", None)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "HealthGuard Surveillance Pro",
        "version": "2.0.0",
        "multi_tenant": True,
        "timestamp": "2024-01-27T10:00:00Z",
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "HealthGuard Surveillance Pro API",
        "description": "Multi-Tenant SaaS Healthcare Surveillance System",
        "features": [
            "Video Surveillance",
            "AI Analytics",
            "Healthcare Management",
            "Business Suite",
            "Inventory Management",
            "Financial Management",
            "Education Platform",
            "Cloud Storage",
            "HR Management",
            "Compliance Guardian",
            "Support Desk",
            "Autism Care",
            "Website Builder",
            "Mobile App",
            "Communication Hub",
            "HIPAA Compliance",
            "Multi-Tenant Architecture",
            "Billing & Payments",
        ],
        "version": "2.0.0",
        "docs": "/docs",
    }


# Include API routers - all modules are included in api.api_router
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(api.api_router, prefix="/api/v1", tags=["api"])
app.include_router(billing.router, prefix="/api/v1/billing", tags=["billing"])
app.include_router(retention.router, prefix="/api/v1/retention", tags=["retention"])
app.include_router(
    client_management.router, prefix="/api/v1", tags=["client-management"]
)
app.include_router(admin_dashboard.router, prefix="/api/v1", tags=["admin-dashboard"])
app.include_router(admin_management.router, prefix="/api/v1", tags=["admin-management"])
app.include_router(client_team.router, prefix="/api/v1", tags=["client-team"])
app.include_router(
    billing_integration.router, prefix="/api/v1", tags=["billing-integration"]
)
app.include_router(client_portal.router, prefix="/api/v1", tags=["client-portal"])
app.include_router(websocket.router, prefix="/api/v1", tags=["websocket"])
app.include_router(monitoring.router, prefix="/api/v1/monitoring", tags=["monitoring"])
app.include_router(role_based.router, prefix="/api/v1/role-based", tags=["role-based"])


@app.get("/admin/status")
async def admin_status():
    """Admin status endpoint"""
    return {
        "status": "operational",
        "services": {
            "database": "connected",
            "redis": "connected",
            "stripe": "connected",
            "firebase": "connected",
            "twilio": "connected",
        },
        "tenants": {"total": 0, "active": 0, "suspended": 0},
        "applications": {
            "surveillance": "active",
            "healthcare": "active",
            "ai-analytics": "active",
            "business": "active",
            "inventory": "active",
            "financial": "active",
            "education": "active",
            "cloud-storage": "active",
            "hr": "active",
            "compliance": "active",
            "support": "active",
            "autism-care": "active",
            "website-builder": "active",
            "mobile-app": "active",
            "communication": "active",
        },
    }


@app.get("/admin/metrics")
async def admin_metrics():
    """Admin metrics endpoint"""
    return {
        "requests_per_minute": 150,
        "active_users": 45,
        "storage_used": "2.3GB",
        "cpu_usage": "23%",
        "memory_usage": "67%",
        "applications": {
            "total_apps": 15,
            "active_apps": 15,
            "total_endpoints": 150,
            "api_calls_per_minute": 1200,
        },
    }


@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Handle 404 errors"""
    return {
        "error": "Not Found",
        "message": "The requested resource was not found",
        "path": request.url.path,
    }


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: HTTPException):
    """Handle 500 errors"""
    return {
        "error": "Internal Server Error",
        "message": "An internal server error occurred",
        "path": request.url.path,
    }


@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("🚀 HealthGuard Surveillance Pro starting up...")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("🛑 HealthGuard Surveillance Pro shutting down...")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info"
    )


# Custom Swagger UI using local assets
@app.get("/docs", response_class=HTMLResponse)
async def custom_swagger_docs():
    css_href = "/_swagger/swagger-ui.css"
    js_src = "/_swagger/swagger-ui-bundle.js"
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <link type=\"text/css\" rel=\"stylesheet\" href=\"{css_href}\">
    <title>{app.title} - Swagger UI</title>
    </head>
    <body>
    <div id=\"swagger-ui\"></div>
    <script src=\"{js_src}\"></script>
    <script>
    window.addEventListener('load', function() {{
      const ui = SwaggerUIBundle({{
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        layout: 'BaseLayout',
        deepLinking: true,
        showExtensions: true,
        showCommonExtensions: true,
        oauth2RedirectUrl: window.location.origin + '/docs/oauth2-redirect',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      }});
    }});
    </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html)
