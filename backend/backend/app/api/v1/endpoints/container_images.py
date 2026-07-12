from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.schemas.container_image import ContainerImageResponse
from app.services.image_storage import ImageStorageError, save_container_image

router = APIRouter()


@router.post(
    "",
    response_model=ContainerImageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_container_image(file: UploadFile = File(...)) -> ContainerImageResponse:
    try:
        image_url = await save_container_image(file)
    except ImageStorageError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

    return ContainerImageResponse(image_url=image_url)
