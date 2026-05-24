"""OllamaClient — Adapter HTTP a un Ollama local (localhost:11434).

[Patron]: Adapter (Hexagonal).
[Principio]: DIP — implementa LLMClient sin que el dominio sepa de HTTP.
[Paradigma]: POO + asincrono.

[Fallback]: si Ollama no responde, generate() retorna texto canned (no levanta excepcion para no romper UX educativa).
"""
import logging

import httpx

from src.shared.config.settings import get_settings

logger = logging.getLogger("ai-service.ollama")


class OllamaClient:
    """Adapter sobre POST /api/generate de Ollama."""

    def __init__(self) -> None:
        s = get_settings()
        self._url = s.ollama_url.rstrip("/")
        self._model = s.ollama_model
        # [Timeout corto para evitar bloqueo en UI]: si LLM tarda > 30s, fallback
        self._timeout = httpx.Timeout(30.0)

    async def generate(
        self,
        prompt: str,
        *,
        max_tokens: int = 512,
        temperature: float = 0.7,
        system: str | None = None,
    ) -> str:
        payload = {
            "model": self._model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature, "num_predict": max_tokens},
        }
        if system:
            payload["system"] = system

        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                res = await client.post(f"{self._url}/api/generate", json=payload)
                res.raise_for_status()
                data = res.json()
                return str(data.get("response", "")).strip()
        except (httpx.HTTPError, httpx.TimeoutException) as exc:
            # [Fallback graceful]: no romper feedback si Ollama caido
            logger.warning("Ollama unavailable, returning fallback: %s", exc)
            return self._canned_fallback(prompt)

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
                res = await client.get(f"{self._url}/api/tags")
                return res.status_code == 200
        except (httpx.HTTPError, httpx.TimeoutException):
            return False

    @staticmethod
    def _canned_fallback(prompt: str) -> str:
        """Mensaje genérico cuando Ollama no está disponible."""
        return (
            "Revisa el concepto clave de la pregunta. "
            "Intenta descomponer el problema en pasos más pequeños y compara tu respuesta con la información que ya conoces sobre el tema."
        )
