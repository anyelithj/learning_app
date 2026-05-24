// [Stub Sprint 4]: Public profile | [Patrón]: Null Object
export default async function PublicProfilePage(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params;
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-extrabold text-gradient-brand">@{username}</h1>
        <p className="text-sm text-muted-foreground">Perfil público — Sprint 4.</p>
      </div>
    </main>
  );
}
