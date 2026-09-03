from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str

    # JWT settings — add these to your .env file
    secret_key: str = "change-me-in-production-use-a-long-random-string"
    access_token_expire_minutes: int = 60 * 8  # 8 hours

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
