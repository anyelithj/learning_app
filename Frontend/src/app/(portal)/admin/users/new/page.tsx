"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// [Página crear usuario admin]: form RHF + Zod | [Patron]: Container | [Principio]: SRP

const createUserSchema = z.object({
  firstName: z.string().trim().min(1, "Nombre obligatorio").max(80),
  lastName: z.string().trim().min(1, "Apellido obligatorio").max(80),
  email: z.string().trim().email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Debe incluir mayúscula, minúscula y dígito",
    ),
  role: z.enum(["USER", "TEACHER", "ADMIN"]),
});

type CreateUserForm = z.input<typeof createUserSchema>;

const ROLE_OPTIONS: Array<{ value: CreateUserForm["role"]; label: string }> = [
  { value: "USER", label: "Estudiante" },
  { value: "TEACHER", label: "Docente" },
  { value: "ADMIN", label: "Administrador" },
];

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function NewUserPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
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
    <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Crear usuario</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Alta directa de usuario por administrador.
          </p>
        </div>
        <Link
          href="/admin/users"
          className="text-sm font-semibold px-3 py-2 rounded-lg border border-border bg-card hover:border-primary"
        >
          ← Volver
        </Link>
      </header>

      {submitError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {submitError}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-5" noValidate>
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
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña *</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creando..." : "Crear usuario"}
          </Button>
        </div>
      </form>
    </main>
  );
}
