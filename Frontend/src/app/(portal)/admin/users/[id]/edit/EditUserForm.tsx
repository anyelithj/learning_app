"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// [EditUserForm]: form RHF + Zod controlled | [Patron]: Presentational | [Principio]: SRP

const editUserSchema = z.object({
  firstName: z.string().trim().min(1, "Nombre obligatorio").max(80),
  lastName: z.string().trim().min(1, "Apellido obligatorio").max(80),
  role: z.enum(["USER", "TEACHER", "ADMIN"]),
});

type EditUserForm = z.input<typeof editUserSchema>;

const ROLE_OPTIONS: Array<{ value: EditUserForm["role"]; label: string }> = [
  { value: "USER", label: "Estudiante" },
  { value: "TEACHER", label: "Docente" },
  { value: "ADMIN", label: "Administrador" },
];

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export interface EditUserFormProps {
  userId: string;
  initialFirstName: string;
  initialLastName: string;
  initialRole: "USER" | "TEACHER" | "ADMIN";
}

export function EditUserForm({ userId, initialFirstName, initialLastName, initialRole }: EditUserFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: initialFirstName,
      lastName: initialLastName,
      role: initialRole,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = (await res.json()) as { message?: string };
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-5" noValidate>
      {submitError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {submitError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Nombre *</Label>
          <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Apellido *</Label>
          <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">Rol *</Label>
        <select id="role" className={selectClass} {...register("role")}>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-muted-foreground">
        El email y la contraseña no se editan desde aquí. Para resetear contraseña, usa la función de
        recuperación o crea un usuario nuevo.
      </p>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting || !isDirty}>
          {submitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
