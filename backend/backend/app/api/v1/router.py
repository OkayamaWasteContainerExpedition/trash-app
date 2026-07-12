from fastapi import APIRouter

from app.api.v1.endpoints import container_images, containers

api_router = APIRouter()
api_router.include_router(containers.router, prefix="/containers", tags=["containers"])
api_router.include_router(
    container_images.router,
    prefix="/container-images",
    tags=["container-images"],
)
