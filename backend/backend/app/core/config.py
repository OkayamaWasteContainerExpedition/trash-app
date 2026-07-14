from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "OkayamaWasteContainerExpedition API"
    api_v1_prefix: str = "/api/v1"
    app_host: str = "127.0.0.1"
    app_port: int = Field(default=8000, ge=1, le=65535)
    database_url: str = "sqlite:///./data/okayama_waste_containers.db"
    upload_dir: Path = Path("./data/uploads")
    max_upload_bytes: int = Field(default=10 * 1024 * 1024, gt=0)
    cors_origins: str = (
        "http://127.0.0.1:3000,http://localhost:3000,"
        "http://127.0.0.1:5173,http://localhost:5173,"
        "http://127.0.0.1:8081,http://localhost:8081,"
        "http://127.0.0.1:19006,http://localhost:19006"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def local_upload_dir(self) -> Path:
        if self.upload_dir.is_absolute():
            return self.upload_dir
        return (PROJECT_ROOT / self.upload_dir).resolve()

    @property
    def local_database_path(self) -> Path | None:
        if self.database_url == "sqlite:///:memory:":
            return None

        sqlite_prefix = "sqlite:///"
        if not self.database_url.startswith(sqlite_prefix):
            return None

        raw_path = self.database_url.removeprefix(sqlite_prefix)
        database_path = Path(raw_path)
        if database_path.is_absolute():
            return database_path
        return (PROJECT_ROOT / database_path).resolve()

    @property
    def resolved_database_url(self) -> str:
        database_path = self.local_database_path
        if database_path is None:
            return self.database_url
        return f"sqlite:///{database_path.as_posix()}"

    def ensure_local_dirs(self) -> None:
        database_path = self.local_database_path
        if database_path is not None:
            database_path.parent.mkdir(parents=True, exist_ok=True)
        self.local_upload_dir.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()
