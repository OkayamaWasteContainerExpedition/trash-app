from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.waste_container import WasteContainer, tokyo_now
from app.schemas.waste_container import WasteContainerCreate, WasteContainerResponse

router = APIRouter()


@router.get("", response_model=list[WasteContainerResponse])
def list_containers(db: Session = Depends(get_db)) -> list[WasteContainer]:
    statement = select(WasteContainer).order_by(WasteContainer.id.asc())
    return list(db.scalars(statement).all())


@router.get("/{container_id}", response_model=WasteContainerResponse)
def get_container(
    container_id: int = Path(gt=0),
    db: Session = Depends(get_db),
) -> WasteContainer:
    waste_container = db.get(WasteContainer, container_id)
    if waste_container is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Container not found.",
        )
    return waste_container


@router.post(
    "",
    response_model=WasteContainerResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_container(
    payload: WasteContainerCreate,
    db: Session = Depends(get_db),
) -> WasteContainer:
    timestamp = tokyo_now()
    waste_container = WasteContainer(
        name=payload.name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        memo=payload.memo,
        image_url=payload.image_url,
        created_at=timestamp,
        updated_at=timestamp,
    )
    db.add(waste_container)

    try:
        db.commit()
        db.refresh(waste_container)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save container.",
        ) from exc

    return waste_container
