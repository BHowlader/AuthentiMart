from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./authentimart.db"
    
    # JWT
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days
    
    # bKash
    bkash_app_key: str = ""
    bkash_app_secret: str = ""
    bkash_username: str = ""
    bkash_password: str = ""
    bkash_base_url: str = "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
    
    # Stripe
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    
    # Application
    app_name: str = "AuthentiMart"
    app_url: str = "http://localhost:5173"
    api_url: str = "http://localhost:8000"
    debug: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
