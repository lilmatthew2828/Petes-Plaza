from pydantic_settings import BaseSettings
import os
from typing import Optional

# Jania Southall - Configuration settings for the application, loaded from environment variables or .env file.
class Settings(BaseSettings):
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost/petes_plaza"
    )
    secret_key: str = os.getenv("SECRET_KEY", "change-in-production")
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = environment == "development"

    # AWS S3 settings - Emmanuella Obidike
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: Optional[str] = None
    aws_s3_bucket: Optional[str] = None

    
    # Cookie settings
    session_cookie_name: str = "session_id"
    session_cookie_secure: bool = environment == "production"
    session_cookie_httponly: bool = True
    session_cookie_samesite: str = "lax"
    
    # CORS
    cors_origins: list = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
    ]
    
    class Config:
       env_file = ".env"

    # model_config = { # Emmanuella Obidike
       # "env_file": ".env", # Emmanuella Obidike
       # "extra": "allow" # Emmanuella Obidike
   #
   #  }


settings = Settings()