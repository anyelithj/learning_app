"""Schema chat response.

[Patron]: DTO + Pydantic.
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ChatTurn(BaseModel):
    model_config = ConfigDict(frozen=True)
    role: str  # "user" | "assistant"
    content: str
    timestamp: datetime


class ChatResponse(BaseModel):
    model_config = ConfigDict(frozen=True)
    session_id: str
    reply: str
    history: list[ChatTurn]
