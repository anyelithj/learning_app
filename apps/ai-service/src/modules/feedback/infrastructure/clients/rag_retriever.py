"""RAGRetriever — busca contexto educativo via FAISS vector store.

[Patron]: Adapter (FAISS) + Strategy.
[Principio]: SRP — solo recupera, no genera.
[Paradigma]: POO.

[Sprint 3.2]: implementacion in-memory minima. Sprint 3.3 conecta FAISS persistente.
"""
import logging

logger = logging.getLogger("ai-service.rag")


class RAGRetriever:
    """Vector retrieval simplificado. Stub funcional sin FAISS instalado."""

    # [Corpus minimo]: textos educativos pre-cargados | [Patron]: Seed Data
    _CORPUS: list[dict[str, str]] = [
        {
            "topic": "geography",
            "snippet": "Las capitales son centros politicos y administrativos de un pais.",
        },
        {
            "topic": "math",
            "snippet": "El area de un rectangulo es base por altura.",
        },
        {
            "topic": "science",
            "snippet": "El metodo cientifico incluye hipotesis, experimento y conclusion.",
        },
        {
            "topic": "history",
            "snippet": "Los eventos historicos se ubican en lineas temporales con causas y consecuencias.",
        },
    ]

    async def retrieve(self, query: str, *, top_k: int = 3) -> list[str]:
        """Devuelve snippets relevantes — token overlap simple (Sprint 3.2 stub)."""
        q_tokens = {t.lower() for t in query.split() if len(t) > 3}
        scored: list[tuple[int, str]] = []
        for doc in self._CORPUS:
            d_tokens = {t.lower() for t in (doc["topic"] + " " + doc["snippet"]).split()}
            overlap = len(q_tokens & d_tokens)
            if overlap > 0:
                scored.append((overlap, doc["snippet"]))
        scored.sort(reverse=True)
        return [s for _, s in scored[:top_k]]
