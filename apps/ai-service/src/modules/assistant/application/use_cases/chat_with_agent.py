"""ChatWithAgentUseCase — orquesta repo + agent.

[Patron]: Command + Use Case.
[Principio]: SRP + DIP.
[Paradigma]: POO + asincrono.
"""
import uuid

from src.modules.assistant.application.schemas.chat_request import ChatRequest
from src.modules.assistant.application.schemas.chat_response import (
    ChatResponse,
    ChatTurn,
)
from src.modules.assistant.domain.entities.conversation import Conversation
from src.modules.assistant.domain.value_objects.message import Message
from src.modules.assistant.infrastructure.agents.tutor_agent import TutorAgent
from src.modules.assistant.infrastructure.repositories.conversation_repo import (
    InMemoryConversationRepository,
)


class ChatWithAgentUseCase:
    """Mantiene la conversacion + invoca el TutorAgent."""

    def __init__(
        self,
        repo: InMemoryConversationRepository,
        agent: TutorAgent,
    ) -> None:
        self._repo = repo
        self._agent = agent

    async def execute(self, request: ChatRequest, user_id: str) -> ChatResponse:
        # [Cargar o crear conversacion]
        conv: Conversation | None = (
            await self._repo.find(request.session_id) if request.session_id else None
        )
        if conv is None:
            conv = Conversation(id=str(uuid.uuid4()), user_id=user_id)

        # [Append user turn + generar respuesta + append assistant turn]
        conv.append(Message.user(request.message))
        reply = await self._agent.reply(conv, request.message)
        conv.append(Message.assistant(reply))
        await self._repo.save(conv)

        return ChatResponse(
            session_id=conv.id,
            reply=reply,
            history=[
                ChatTurn(role=m.role, content=m.content, timestamp=m.timestamp)
                for m in conv.messages
            ],
        )
