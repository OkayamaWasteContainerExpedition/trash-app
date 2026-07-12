from datetime import datetime
from zoneinfo import ZoneInfo

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator

TOKYO_TIMEZONE = ZoneInfo("Asia/Tokyo")


class WasteContainerCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=100)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    memo: str | None = Field(default=None, max_length=2000)
    image_url: str | None = Field(default=None, max_length=255)

    @field_validator("name", mode="before")
    @classmethod
    def trim_name(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("memo", "image_url", mode="before")
    @classmethod
    def trim_optional_text(cls, value: object) -> object:
        if isinstance(value, str):
            stripped = value.strip()
            return stripped or None
        return value

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: str | None) -> str | None:
        if value is None:
            return None

        prefix = "/uploads/"
        if not value.startswith(prefix):
            raise ValueError("image_url must start with /uploads/.")

        filename = value.removeprefix(prefix)
        if not filename or "/" in filename or "\\" in filename or ".." in filename:
            raise ValueError("image_url must contain a safe upload filename.")

        allowed_suffixes = {".jpg", ".jpeg", ".png", ".webp"}
        if not any(filename.lower().endswith(suffix) for suffix in allowed_suffixes):
            raise ValueError("image_url must point to a supported image file.")

        return value


class WasteContainerResponse(WasteContainerCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("created_at", "updated_at")
    def serialize_tokyo_datetime(self, value: datetime) -> str:
        if value.tzinfo is None:
            value = value.replace(tzinfo=TOKYO_TIMEZONE)
        return value.astimezone(TOKYO_TIMEZONE).isoformat()
