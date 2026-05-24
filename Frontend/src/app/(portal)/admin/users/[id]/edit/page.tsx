import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/quiz-api";
import { EditUserForm } from "./EditUserForm";
// [Página editar usuario admin]: SSR fetch + Client form | [Patrón]: Container + Presentational

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
    <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Editar usuario</h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">{user.email}</p>
        </div>
        <Link
          href="/admin/users"
          className="text-sm font-semibold px-3 py-2 rounded-lg border border-border bg-card hover:border-primary"
        >
          ← Volver
        </Link>
      </header>

      <EditUserForm
        userId={user.id}
        initialFirstName={user.firstName}
        initialLastName={user.lastName}
        initialRole={user.role}
      />
    </main>
  );
}
