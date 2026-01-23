"""
Application settings and configuration
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    # Pydantic v2 settings: read from .env and ignore unknown keys
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    # Database settings
    DATABASE_URL: str = "sqlite:///./databases/central_db.db"
    
    # Security settings
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = ["*"]
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "HealthGuard Surveillance Pro"
    
    # Communication settings
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    # Firebase settings
    FIREBASE_CREDENTIALS: Optional[str] = None
    
    # Stripe settings
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    
    # Email settings
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # WhatsApp settings
    WHATSAPP_BUSINESS_TOKEN: Optional[str] = None
    
    # Telegram settings
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    
    # Fax settings
    FAX_SERVICE_API_KEY: Optional[str] = None
    
    # Removed legacy Config to avoid pydantic v2 conflict with model_config

settings = Settings() 