"""Schema chat request.

[Patron]: DTO + Pydantic.
[Principio]: SRP + ISP.
"""
from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    """Mensaje del usuario al asistente tutor."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    session_id: str | None = None  # null = nueva conversacion
    message: str = Field(..., min_length=1, max_length=2000)
    # [Contexto opcional]: el frontend puede pasar topic / quiz_id para enfocar al tutor
    topic: str | None = None
