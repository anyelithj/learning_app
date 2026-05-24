"""TutorAgent — agente conversacional con RAG ligero + LLM.

[Patron]: Adapter (LangChain-like simplificado) + Strategy.
[Principio]: SRP + DIP.
[Paradigma]: POO + asincrono.

[Sprint 3.3]: implementacion directa sin LangChain (mas controlable, menos deps).
Sprint posterior puede sustituir por LangChain ReAct agent si se requiere tool-use.
"""
from src.modules.assistant.domain.entities.conversation import Conversation
from src.modules.feedback.domain.interfaces.llm_client import LLMClient
from src.modules.feedback.infrastructure.clients.rag_retriever import RAGRetriever


_SYSTEM_PROMPT = (
    "Eres un tutor pedagogico de NeuroEdu IA. Respondes en espanol, en tono claro y "
    "motivador. Cuando el estudiante pregunta sobre un tema, explica con ejemplos "
    "concretos y propone un siguiente paso de estudio. Maximo 5 oraciones por respuesta."
)


class TutorAgent:
    """Agente que combina RAG + LLM."""

    def __init__(self, llm: LLMClient, retriever: RAGRetriever) -> None:
        self._llm = llm
        self._retriever = retriever

    async def reply(self, conversation: Conversation, user_input: str) -> str:
        # [Recupera contexto]: RAG sobre la ultima pregunta del usuario
        snippets = await self._retriever.retrieve(user_input, top_k=2)
        context_block = (
            "\n".join(f"- {s}" for s in snippets) if snippets else "(sin contexto)"
        )

        # [Historial corto]: ultimos 6 turnos | [Patron]: Sliding Window
        history_lines: list[str] = []
        for msg in conversation.last_n(6):
            speaker = "Estudiante" if msg.role == "user" else "Tutor"
            history_lines.append(f"{speaker}: {msg.content}")

        history_block = "\n".join(history_lines)
        prompt = (
            f"Contexto educativo:\n{context_block}\n\n"
            f"Conversacion previa:\n{history_block}\n\n"
            f"Estudiante: {user_input}\n"
            f"Tutor:"
        )

        return await self._llm.generate(
            prompt, system=_SYSTEM_PROMPT, max_tokens=350, temperature=0.7
        )
