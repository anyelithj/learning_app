import { NextResponse } from "next/server";
import { deleteQuiz, patchQuiz } from "@/lib/quiz-api";
import { ApiError } from "@/lib/errors";
// [Route Handler /api/quiz/[id]]: PATCH parcial + DELETE | [Patron]: Proxy

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  let body: Partial<{ title: string; description: string; isPublished: boolean; timePerQuestionSeconds: number }>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }
  try {
    const quiz = await patchQuiz(id, body);
    return NextResponse.json(quiz);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof ApiError ? err.message : "Error actualizando quiz";
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  try {
    await deleteQuiz(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof ApiError ? err.message : "Error eliminando quiz";
    return NextResponse.json({ message }, { status });
  }
}
