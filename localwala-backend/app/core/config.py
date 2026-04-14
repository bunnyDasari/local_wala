from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "LocalWala API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    DATABASE_URL: str = "postgresql://neondb_owner:npg_1AkTDJzSI4fB@ep-quiet-firefly-ancsu8bk-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"
    REDIS_URL: str = "redis://localhost:6379"

    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    CORS_ORIGINS: str = "http://localhost:3000"

    
   # Fast2SMS
    FAST2SMS_API_KEY: str = "rZvGp5eXyW4O36jRFEMdmBiILzlQnVThtwcPYuH2oSNbxUgJa8m5yY01uvPzas3Tp6B8dMGDIHExrL7S"          # paste your key in .env
    FAST2SMS_SENDER_ID: str = "FSTSMS" 

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL

        # Strip params asyncpg does not support
        url = url.replace("&channel_binding=require", "")
        url = url.replace("?channel_binding=require", "")

        # Fix scheme
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

        # asyncpg needs ssl=require, not sslmode=require
        url = url.replace("sslmode=require", "ssl=require")

        return url

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()