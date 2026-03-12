from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    stripe_api_key: str | None = None
    square_access_token: str | None = None
    square_location_id: str | None = None
    square_api_base: str = "https://connect.squareup.com/v2"
    days_overdue_threshold: int = 42
    offer_timeout_minutes: int = 30
    dry_run: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_prefix="BOT_")

