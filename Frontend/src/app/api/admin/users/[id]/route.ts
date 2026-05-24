import { NextResponse } from "next/server";
import { deactivateUser, updateUser, type UpdateUserInput } from "@/lib/quiz-api";
import { ApiError } from "@/lib/errors";
// [Route Handler /api/admin/users/[id]]: PATCH edit + DELETE soft-disable | [Patron]: Proxy

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  try {
    await deactivateUser(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof ApiError ? err.message : "Error desactivando usuario";
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  let body: UpdateUserInput;
  try {
    body = (await request.json()) as UpdateUserInput;
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }
  try {
    const user = await updateUser(id, body);
    return NextResponse.json(user);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof ApiError ? err.message : "Error actualizando usuario";
    return NextResponse.json({ message }, { status });
  }
}
