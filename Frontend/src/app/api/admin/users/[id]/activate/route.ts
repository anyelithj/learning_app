import { NextResponse } from "next/server";
import { reactivateUser } from "@/lib/quiz-api";
import { ApiError } from "@/lib/errors";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  try {
    await reactivateUser(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof ApiError ? err.message : "Error reactivando usuario";
    return NextResponse.json({ message }, { status });
  }
}
