from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.db.session import init_db


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_db()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    settings.ensure_local_dirs()

    app = FastAPI(
        title=settings.app_name,
        description="Local-first API for Okayama waste container map data.",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        swagger_ui_parameters={"displayRequestDuration": True},
        openapi_tags=[
            {
                "name": "containers",
                "description": "ごみ箱の一覧取得、詳細取得、新規登録を行います。",
            },
            {
                "name": "container-images",
                "description": "ごみ箱登録に利用する画像をローカルへ保存します。",
            },
        ],
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix=settings.api_v1_prefix)
    app.mount(
        "/uploads",
        StaticFiles(directory=str(settings.local_upload_dir)),
        name="uploads",
    )

    @app.get("/swagger", include_in_schema=False)
    def swagger_ui() -> HTMLResponse:
        return get_swagger_ui_html(
            openapi_url=app.openapi_url or "/openapi.json",
            title=f"{settings.app_name} - Swagger UI",
            swagger_ui_parameters={"displayRequestDuration": True},
        )

    return app


app = create_app()
