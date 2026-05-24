"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_ROUTES } from "@/lib/constants";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 501) throw new Error(body.message ?? `HTTP ${res.status}`);
      setStatus("sent");
      setMessage(
        res.status === 501
          ? "Funcionalidad pendiente de habilitar en backend. Por ahora pide reset manual al admin."
          : "Si el correo existe, recibirás un enlace para restablecer la contraseña.",
      );
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error al enviar enlace");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-[420px] space-y-5"
      noValidate
      aria-label="Formulario de recuperación de contraseña"
    >
      <header className="mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingresa el correo y se enviará un enlace para crear una nueva contraseña.
        </p>
      </header>

      {message && (
        <div
          role="status"
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
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="correo electrónico"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-gradient-brand text-white hover:opacity-90 h-11"
      >
        {status === "sending" ? "Enviando..." : "Enviar enlace"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya recuerdas?{" "}
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
