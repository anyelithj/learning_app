"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { AUTH_ROUTES } from "@/lib/constants";
// [ResetPasswordForm]: lee token de query, envía a /api/auth/reset-password | [Patrón]: Presentational + Container | [Principio]: SRP

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(128, "Máximo 128 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Debe incluir mayúscula, minúscula y dígito",
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormInput = z.infer<typeof schema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      setStatus("error");
      setMessage("Token ausente o inválido");
      return;
    }
    setStatus("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: values.newPassword }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message ?? `HTTP ${res.status}`);
      setStatus("success");
      setMessage("Contraseña actualizada. Redirigiendo a inicio de sesión...");
      setTimeout(() => router.push(AUTH_ROUTES.login), 1500);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error al actualizar contraseña");
    }
  });

  if (!token) {
    return (
      <div className="w-full max-w-[420px] space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Token requerido</h1>
        <p className="text-sm text-muted-foreground">
          El enlace está incompleto. Solicita uno nuevo desde{" "}
          <Link
            href={AUTH_ROUTES.forgotPassword}
            className="font-semibold text-primary hover:text-primary-dark"
          >
            recuperar contraseña
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-[420px] space-y-5"
      noValidate
      aria-label="Formulario de restablecimiento de contraseña"
    >
      <header className="mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Nueva contraseña</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Define una contraseña fuerte (mínimo 8 caracteres, mayúscula, minúscula y dígito).
        </p>
      </header>

      {message && (
        <div
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={
            status === "error"
              ? "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              : "rounded-lg border border-primary/20 bg-gradient-soft px-4 py-3 text-sm text-foreground"
          }
        >
          {message}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <PasswordInput
          id="newPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={!!errors.newPassword}
          aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p id="newPassword-error" role="alert" className="text-xs text-destructive">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={
            errors.confirmPassword ? "confirmPassword-error" : undefined
          }
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p id="confirmPassword-error" role="alert" className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={status === "sending" || status === "success"}
        className="w-full bg-gradient-brand text-white hover:opacity-90 h-11"
      >
        {status === "sending" ? "Actualizando..." : "Actualizar contraseña"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Recuerdas tu contraseña?{" "}
        <Link
          href={AUTH_ROUTES.login}
          className="font-semibold text-primary hover:text-primary-dark"
        >
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
