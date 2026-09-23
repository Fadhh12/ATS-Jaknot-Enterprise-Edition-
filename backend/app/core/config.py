from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://user:password@localhost:5432/jaknot_ats"
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    storage_bucket_url: str = ""
    storage_access_key: str = ""
    storage_secret_key: str = ""
    seed_admin_name: str = "Admin"
    seed_admin_email: str = "admin@jaknot.local"
    seed_admin_password: str = "change-me-please"


settings = Settings()
