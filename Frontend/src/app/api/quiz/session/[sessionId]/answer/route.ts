import { NextResponse } from "next/server";
import { submitAnswer } from "@/lib/quiz-api";
import { ApiError } from "@/lib/errors";

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
): Promise<NextResponse> {
  const { sessionId } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON invalido" }, { status: 400 });
  }
  try {
    const result = await submitAnswer(sessionId, body as never);
    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message =
      err instanceof ApiError ? err.message : "Error inesperado";
    return NextResponse.json({ message }, { status });
  }
}
