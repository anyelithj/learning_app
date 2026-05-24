"""ExactMatchModel — Strategy para multiple_choice y true_false.

[Patron]: Strategy + Adapter.
[Principio]: SRP — solo compara strings normalizadas.
[Paradigma]: POO + Funcional.
"""
from src.modules.grading.application.schemas.grading_request import GradingRequest


class ExactMatchModel:
    """Comparacion case+space insensible. Score binario (0 o 1)."""

    name: str = "exact_match"

    async def grade(
        self, request: GradingRequest
    ) -> tuple[float, bool, float]:
        normalize = lambda s: s.strip().lower()
        is_correct = normalize(request.user_answer) == normalize(request.correct_answer)
        score = 1.0 if is_correct else 0.0
        # [Confianza]: maxima para exact match — la regla es deterministica
        return score, is_correct, 1.0
