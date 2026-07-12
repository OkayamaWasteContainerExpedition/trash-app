from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile, status

from app.core.config import get_settings

CHUNK_SIZE = 1024 * 1024
HEADER_BYTES = 16


@dataclass(frozen=True)
class ImageSpec:
    extension: str
    matches: Callable[[bytes], bool]


class ImageStorageError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


def _matches_jpeg(header: bytes) -> bool:
    return header.startswith(b"\xff\xd8\xff")


def _matches_png(header: bytes) -> bool:
    return header.startswith(b"\x89PNG\r\n\x1a\n")


def _matches_webp(header: bytes) -> bool:
    return len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP"


IMAGE_TYPES: dict[str, ImageSpec] = {
    "image/jpeg": ImageSpec(extension=".jpg", matches=_matches_jpeg),
    "image/png": ImageSpec(extension=".png", matches=_matches_png),
    "image/webp": ImageSpec(extension=".webp", matches=_matches_webp),
}


async def save_container_image(file: UploadFile) -> str:
    content_type = (file.content_type or "").split(";", maxsplit=1)[0].strip().lower()
    image_spec = IMAGE_TYPES.get(content_type)
    if image_spec is None:
        raise ImageStorageError(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported image type.",
        )

    settings = get_settings()
    upload_dir = settings.local_upload_dir
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4()}{image_spec.extension}"
    final_path = upload_dir / filename
    temp_path = upload_dir / f".{filename}.part"

    total_size = 0
    header = bytearray()

    try:
        with temp_path.open("xb") as destination:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break

                if len(header) < HEADER_BYTES:
                    header.extend(chunk[: HEADER_BYTES - len(header)])

                total_size += len(chunk)
                if total_size > settings.max_upload_bytes:
                    raise ImageStorageError(
                        status_code=413,
                        detail="Uploaded image is too large.",
                    )

                destination.write(chunk)

        if total_size == 0 or not image_spec.matches(bytes(header)):
            raise ImageStorageError(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Unsupported image content.",
            )

        temp_path.replace(final_path)
    except ImageStorageError:
        _unlink_if_exists(temp_path)
        raise
    except OSError as exc:
        _unlink_if_exists(temp_path)
        raise ImageStorageError(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save image.",
        ) from exc
    finally:
        await file.close()

    return f"/uploads/{filename}"


def _unlink_if_exists(path: Path) -> None:
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass
