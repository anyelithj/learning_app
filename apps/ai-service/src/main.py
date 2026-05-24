"""Entry point del servicio FastAPI.

[Patrón]: Builder — compone la app antes de exponerla.
[Principio]: SRP — main solo orquesta, no lleva lógica de negocio.
[Paradigma]: Funcional + asíncrono.
"""
import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI

from src.routers import register_routers
from src.shared.config.settings import get_settings
from src.shared.exceptions.handlers import register_exception_handlers
from src.shared.middleware.cors_middleware import setup_cors
from src.shared.middleware.logging_middleware import setup_logging_middleware


def _setup_logging(level: str) -> None:
    """Configura logging root + libs ruidosas. [Principio]: SRP."""
    logging.basicConfig(
        level=getattr(logging, level),
        format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    # [Silencia ruido]: sqlalchemy logging verbose por default
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Hook startup/shutdown — limpieza de recursos al cerrar. [Patrón]: Lifecycle."""
    logger = logging.getLogger("ai-service")
    logger.info("Lifespan: startup")
    # [Sprint 3]: aquí precargar modelos sentence-transformers / spaCy si se desea warmup
    yield
    logger.info("Lifespan: shutdown")


def create_app() -> FastAPI:
    """Factoría de la aplicación FastAPI.

    [Patrón]: Factory + Builder — testeable porque crea apps independientes.
    """
    settings = get_settings()
    _setup_logging(settings.log_level)

    app = FastAPI(
        title="NeuroEdu IA — AI Service",
        description="Calificación, feedback pedagógico y agente tutor con IA",
        version="0.1.0",
        # [Docs solo no-prod]: evita exposición de schemas en producción
        docs_url=f"{settings.api_prefix}/docs" if not settings.is_production else None,
        redoc_url=f"{settings.api_prefix}/redoc" if not settings.is_production else None,
        openapi_url=(
            f"{settings.api_prefix}/openapi.json" if not settings.is_production else None
        ),
        lifespan=lifespan,
    )

    # [Wire middlewares]: orden importa — logging después de CORS para que logs incluyan headers normalizados
    setup_cors(app)
    setup_logging_middleware(app)

    # [Handlers globales]: forma uniforme de errores
    register_exception_handlers(app)

    # [Routers de módulos]
    register_routers(app, prefix=settings.api_prefix)

    # [Health endpoint]: usado por orquestadores (k8s readiness/liveness)
    @app.get("/health", tags=["meta"], include_in_schema=False)
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


# [Instancia]: uvicorn la importa via "src.main:app"
app = create_app()
