"""Registro central de routers de la app.

[Patron]: Facade — un unico punto desde main.py para registrar todos los routers.
[Principio]: SSOT + OCP.
[Paradigma]: Funcional.
"""
from fastapi import FastAPI

from src.modules.assistant.presentation.assistant_router import (
    router as assistant_router,
)
from src.modules.feedback.presentation.feedback_router import router as feedback_router
from src.modules.grading.presentation.grading_router import router as grading_router


def register_routers(app: FastAPI, prefix: str = "/api/v1") -> None:
    """Engancha todos los routers de modulos bajo el prefix global."""
    app.include_router(grading_router, prefix=prefix)
    app.include_router(feedback_router, prefix=prefix)
    app.include_router(assistant_router, prefix=prefix)
