from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str

    # JWT settings
    secret_key: str = "cbhjbvv7VGhddHvbhd1348##nv"
    access_token_expire_minutes: int = 60 * 8  # 8 hours
    cookie_secure: bool = False
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
