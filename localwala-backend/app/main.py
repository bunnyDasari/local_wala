from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import create_tables, engine
from app.api import api_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 Starting {settings.APP_NAME}")
    logger.info(f"📦 DB host: {settings.async_database_url.split('@')[-1]}")
    try:
        await create_tables()
        logger.info("✅ DB connected and tables ready")
    except Exception as e:
        logger.error(f"❌ DB connection failed: {e}")
    yield
    await engine.dispose()
    logger.info("🛑 Shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/health/db")
async def health_db():
    """Test the database connection directly."""
    from sqlalchemy import text
    from app.core.database import AsyncSessionLocal

    # Show URL with password masked for safety
    raw_url = settings.async_database_url
    try:
        # Mask password: postgresql+asyncpg://user:PASS@host/db → user:***@host/db
        import re
        masked_url = re.sub(r"(:\/\/)([^:]+):([^@]+)(@)", r"\1\2:***\4", raw_url)
    except Exception:
        masked_url = "could not parse"

    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT current_database(), current_user, version()"))
            row = result.fetchone()
            return {
                "status": "connected",
                "db": "ok",
                "connection_url": masked_url,
                "database": row[0],
                "user": row[1],
                "pg_version": row[2].split(",")[0],   # e.g. "PostgreSQL 16.2"
            }
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail={
            "error": "DB connection failed",
            "connection_url": masked_url,
            "reason": str(e),
        })


@app.get("/health/shops-count")
async def health_shops_count():
    """Return total shop count — quick way to verify seed data exists."""
    from sqlalchemy import text, func, select
    from app.core.database import AsyncSessionLocal
    from app.models.shop import Shop
    try:
        async with AsyncSessionLocal() as session:
            count = await session.scalar(select(func.count()).select_from(Shop))
            return {"status": "ok", "total_shops": count}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail=str(e))