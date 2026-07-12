from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


TOKYO_TIMEZONE = ZoneInfo("Asia/Tokyo")


def tokyo_now() -> datetime:
    return datetime.now(TOKYO_TIMEZONE)


class WasteContainer(Base):
    __tablename__ = "waste_containers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    memo: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=tokyo_now,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=tokyo_now,
        onupdate=tokyo_now,
    )
