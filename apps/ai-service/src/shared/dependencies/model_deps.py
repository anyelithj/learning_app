"""Dependencies para inyectar modelos IA (carga perezosa + caché).

[Patrón]: Singleton (lru_cache) + Factory + Lazy Loading.
[Principio]: SRP + KISS — carga el modelo solo en primer uso.
[Paradigma]: Funcional.

[Nota Sprint 1.3]: stubs sin carga real. Sprint 3 los implementa contra
sentence-transformers, spaCy y Ollama.
"""
from functools import lru_cache
from typing import Annotated

from fastapi import Depends

from src.shared.config.settings import Settings, get_settings


@lru_cache(maxsize=1)
def _load_sentence_transformer():
    """Carga del modelo sentence-transformers (placeholder Sprint 3).

    [Patrón]: Lazy Loading — solo se carga al primer Depends().
    """
    # [Sprint 3]: descomentar cuando el modelo esté disponible localmente.
    # from sentence_transformers import SentenceTransformer
    # settings = get_settings()
    # return SentenceTransformer(settings.sentence_transformer_model)
    return None


@lru_cache(maxsize=1)
def _load_spacy_pipeline():
    """Carga del pipeline spaCy (placeholder Sprint 3)."""
    # [Sprint 3]: descomentar
    # import spacy
    # settings = get_settings()
    # return spacy.load(settings.spacy_model)
    return None


def get_sentence_transformer():
    """Dependency que devuelve el modelo cacheado."""
    return _load_sentence_transformer()


def get_spacy_pipeline():
    """Dependency que devuelve el pipeline cacheado."""
    return _load_spacy_pipeline()


# [Settings shortcut]: para endpoints que solo necesitan config
SettingsDep = Annotated[Settings, Depends(get_settings)]
