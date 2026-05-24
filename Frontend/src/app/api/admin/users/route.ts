import { NextResponse } from "next/server";
import { createUser, type CreateUserInput } from "@/lib/quiz-api";
import { ApiError } from "@/lib/errors";
// [Route Handler /api/admin/users POST]: proxy creación usuario (ADMIN) | [Patron]: Proxy | [Principio]: SRP

export async function POST(request: Request): Promise<NextResponse> {
  let body: CreateUserInput;
  try {
    body = (await request.json()) as CreateUserInput;
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }
  try {
    const user = await createUser(body);
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof ApiError ? err.message : "Error creando usuario";
    return NextResponse.json({ message }, { status });
  }
}
