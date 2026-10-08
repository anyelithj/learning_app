import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/quiz-api";
import { UserForm } from "../../UserForm"; // [Formulario único]: el mismo del alta, con `initial`
// [Página editar usuario admin]: SSR fetch + formulario compartido | [Patrón]: Container + Presentational | [Principio]: DRY

export const dynamic = "force-dynamic";

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  let user;
  try {
    user = await getUser(id);
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Editar usuario</h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">{user.email}</p>
        </div>
        <Link href="/admin/users" className="btn btn-outline">
          ← Volver
        </Link>
      </header>

      <UserForm initial={{ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, section: user.section }} />
    </div>
  );
}
