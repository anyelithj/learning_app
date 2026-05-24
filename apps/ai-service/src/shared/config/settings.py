"""Settings centralizados via Pydantic v2 BaseSettings.

[Patrón]: Configuration Object + Singleton (lru_cache).
[Principio]: SSOT — todas las env vars pasan por aquí.
[Paradigma]: POO + Funcional (factory cacheado).
"""
from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración global tipada e inmutable."""

    # [Config]: lee .env, ignora vars no declaradas | [Principio]: ISP
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ===== Server =====
    env: Literal["development", "staging", "production"] = "development"
    host: str = "0.0.0.0"
    port: int = 8000
    api_prefix: str = "/api/v1"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"

    # ===== Database =====
    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/proydemo"
    )

    # ===== Redis =====
    redis_url: str = "redis://localhost:6379/0"

    # ===== Backend NestJS =====
    backend_url: str = "http://localhost:4000"
    backend_api_prefix: str = "/api/v1"

    # ===== JWT (debe coincidir con NestJS access secret) =====
    jwt_access_secret: str = "change-me-access-secret-min-32-chars-long"
    jwt_algorithm: Literal["HS256", "RS256"] = "HS256"

    # ===== Ollama =====
    ollama_url: str = "http://localhost:11434"
    # [Modelo por defecto]: igual al usado por NestJS para consistencia | [Principio]: SSOT
    ollama_model: str = "llama3.2:1b"

    # ===== CORS =====
    cors_origins: str = "http://localhost:7000,http://localhost:4000"

    # ===== Modelos IA =====
    sentence_transformer_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    spacy_model: str = "es_core_news_md"
    faiss_index_path: str = "./data/faiss_index"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parsea string CSV → lista. [Principio]: SRP."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        """Atajo legible para flags condicionales. [Principio]: DRY."""
        return self.env == "production"


# [Factoría cacheada]: una sola instancia por proceso | [Patrón]: Singleton
@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Retorna la instancia única de Settings (lazy)."""
    return Settings()
