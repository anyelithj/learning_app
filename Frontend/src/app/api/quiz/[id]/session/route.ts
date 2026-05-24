import { NextResponse } from "next/server";
import { startSession } from "@/lib/quiz-api";
import { ApiError } from "@/lib/errors";
// [Route Handler]: BFF para iniciar sesion de quiz | [Patron]: BFF + Facade

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  try {
    const session = await startSession(id);
    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message =
      err instanceof ApiError ? err.message : "Error inesperado";
    return NextResponse.json({ message }, { status });
  }
}
