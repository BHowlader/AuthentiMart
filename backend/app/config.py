from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database (PostgreSQL)
    database_url: str = "postgresql://postgres:postgres@localhost:5432/authentimart"

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

    # Pathao Courier API (Production uses client_credentials - only need client_id and secret)
    pathao_client_id: str = ""
    pathao_client_secret: str = ""
    pathao_base_url: str = "https://api-hermes.pathao.com"
    pathao_webhook_secret: str = ""  # Optional - set in Pathao dashboard if available

    # Steadfast Courier API
    steadfast_api_key: str = ""
    steadfast_secret_key: str = ""
    steadfast_base_url: str = "https://portal.packzy.com/api/v1"
    steadfast_webhook_secret: str = ""

    # Default courier preference
    default_courier: str = "steadfast"  # "pathao" or "steadfast"

    # Order automation settings
    payment_timeout_hours: int = 24  # Auto-cancel unpaid orders after this time
    status_poll_interval_minutes: int = 30  # Poll courier APIs for status updates
    auto_assign_courier: bool = True  # Auto-assign courier after confirmation

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
