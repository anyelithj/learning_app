"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// [DeactivateUserButton]: toggle activate/deactivate usuario | [Patrón]: Presentational | [Principio]: SRP

export interface DeactivateUserButtonProps {
  userId: string;
  userName: string;
  isActive: boolean;
}

export function DeactivateUserButton({ userId, userName, isActive }: DeactivateUserButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    const action = isActive ? "desactivar" : "habilitar";
    if (!confirm(`¿${action.charAt(0).toUpperCase()}${action.slice(1)} a ${userName}?`)) return;
    setBusy(true);
    setError(null);
    try {
      const url = isActive
        ? `/api/admin/users/${userId}`
        : `/api/admin/users/${userId}/activate`;
      const method = isActive ? "DELETE" : "POST";
      const res = await fetch(url, {
        method,
        headers: isActive ? undefined : { "Content-Type": "application/json" },
        body: isActive ? undefined : "{}",
      });
      if (!res.ok && res.status !== 204) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={
          isActive
            ? "text-xs font-semibold px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 disabled:opacity-50"
            : "text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-400 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        }
      >
        {busy ? "..." : isActive ? "Desactivar" : "Habilitar"}
      </button>
      {error && <span className="text-[10px] text-destructive">{error}</span>}
    </div>
  );
}
