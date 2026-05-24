"""Router del modulo Grading.

[Patron]: Controller (MVC) + Facade.
[Principio]: SRP — traduce HTTP a Use Case.
[Paradigma]: Funcional + asincrono.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, status

from src.modules.grading.application.schemas.grading_request import GradingRequest
from src.modules.grading.application.schemas.grading_response import GradingResponse
from src.modules.grading.application.use_cases.batch_grade import BatchGradeUseCase
from src.modules.grading.application.use_cases.grade_answer import GradeAnswerUseCase
from src.modules.grading.infrastructure.models.model_factory import (
    ModelFactory,
    get_model_factory,
)
from src.shared.dependencies.auth_deps import CurrentUserDep

router = APIRouter(prefix="/grading", tags=["grading"])


def get_grade_use_case(
    factory: Annotated[ModelFactory, Depends(get_model_factory)],
) -> GradeAnswerUseCase:
    return GradeAnswerUseCase(factory)


def get_batch_use_case(
    grade_one: Annotated[GradeAnswerUseCase, Depends(get_grade_use_case)],
) -> BatchGradeUseCase:
    return BatchGradeUseCase(grade_one)


@router.get("/health", summary="Module health probe")
async def health() -> dict[str, str]:
    return {"module": "grading", "status": "ready"}


@router.post(
    "/grade",
    status_code=status.HTTP_200_OK,
    response_model=GradingResponse,
    summary="Califica una respuesta segun su tipo (Strategy)",
)
async def grade_answer(
    payload: GradingRequest,
    user: CurrentUserDep,
    use_case: Annotated[GradeAnswerUseCase, Depends(get_grade_use_case)],
) -> GradingResponse:
    return await use_case.execute(payload, user.id)


@router.post(
    "/batch",
    status_code=status.HTTP_200_OK,
    response_model=list[GradingResponse],
    summary="Califica un lote (concurrente)",
)
async def batch_grade(
    payload: list[GradingRequest],
    user: CurrentUserDep,
    use_case: Annotated[BatchGradeUseCase, Depends(get_batch_use_case)],
) -> list[GradingResponse]:
    return await use_case.execute(payload, user.id)
