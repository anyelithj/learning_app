"""Router del modulo Assistant.

[Patron]: Controller (MVC) + Facade.
[Principio]: SRP.
[Paradigma]: Funcional + asincrono.
"""
import asyncio
import json
from functools import lru_cache
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from src.modules.assistant.application.schemas.chat_request import ChatRequest
from src.modules.assistant.application.schemas.chat_response import ChatResponse
from src.modules.assistant.application.use_cases.chat_with_agent import (
    ChatWithAgentUseCase,
)
from src.modules.assistant.application.use_cases.get_conversation import (
    GetConversationUseCase,
)
from src.modules.assistant.infrastructure.agents.tutor_agent import TutorAgent
from src.modules.assistant.infrastructure.repositories.conversation_repo import (
    InMemoryConversationRepository,
)
from src.modules.feedback.infrastructure.clients.ollama_client import OllamaClient
from src.modules.feedback.infrastructure.clients.rag_retriever import RAGRetriever
from src.shared.dependencies.auth_deps import CurrentUserDep

router = APIRouter(prefix="/assistant", tags=["assistant"])


@lru_cache(maxsize=1)
def _get_repo() -> InMemoryConversationRepository:
    return InMemoryConversationRepository()


@lru_cache(maxsize=1)
def _get_ollama() -> OllamaClient:
    return OllamaClient()


@lru_cache(maxsize=1)
def _get_retriever() -> RAGRetriever:
    return RAGRetriever()


@lru_cache(maxsize=1)
def _get_agent() -> TutorAgent:
    return TutorAgent(_get_ollama(), _get_retriever())


def get_chat_use_case() -> ChatWithAgentUseCase:
    return ChatWithAgentUseCase(_get_repo(), _get_agent())


def get_conversation_use_case() -> GetConversationUseCase:
    return GetConversationUseCase(_get_repo())


@router.get("/health")
async def health() -> dict[str, str]:
    return {"module": "assistant", "status": "ready"}


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Conversa con el tutor IA (JSON simple)",
)
async def chat(
    payload: ChatRequest,
    user: CurrentUserDep,
    use_case: Annotated[ChatWithAgentUseCase, Depends(get_chat_use_case)],
) -> ChatResponse:
    return await use_case.execute(payload, user.id)


@router.post(
    "/chat/stream",
    summary="Conversa con el tutor IA (SSE streaming)",
)
async def chat_stream(
    payload: ChatRequest,
    user: CurrentUserDep,
    use_case: Annotated[ChatWithAgentUseCase, Depends(get_chat_use_case)],
) -> StreamingResponse:
    # [SSE]: por ahora envia respuesta completa palabra-a-palabra (pseudo-streaming).
    # Real streaming desde Ollama llega en Sprint 4.
    async def event_generator():
        response = await use_case.execute(payload, user.id)
        # [Header sesion]: el cliente lo necesita en el primer evento
        yield f"event: session\ndata: {json.dumps({'session_id': response.session_id})}\n\n"
        for token in response.reply.split():
            yield f"event: token\ndata: {json.dumps({'text': token + ' '})}\n\n"
            await asyncio.sleep(0.02)
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/conversation/{session_id}", summary="Lee la conversacion completa")
async def get_conversation(
    session_id: str,
    _user: CurrentUserDep,
    use_case: Annotated[GetConversationUseCase, Depends(get_conversation_use_case)],
) -> dict:
    conv = await use_case.execute(session_id)
    return {
        "id": conv.id,
        "user_id": conv.user_id,
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "timestamp": m.timestamp.isoformat(),
            }
            for m in conv.messages
        ],
        "created_at": conv.created_at.isoformat(),
    }
