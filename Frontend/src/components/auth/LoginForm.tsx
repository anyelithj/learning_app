"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { AUTH_ROUTES } from "@/lib/constants";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
// [LoginForm]: form controlado RHF + Zod | [Patrón]: Presentational + Container | [Principio]: SRP + DRY | [Paradigma]: Funcional + Reactivo + Declarativo

export function LoginForm() {
  // [useAuth]: estado + dispatch login | [Patrón]: Custom Hook
  const { login, isLoading, error } = useAuth();

  // [useForm]: registra el form + Zod resolver | [Patrón]: Form State
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false } as LoginInput,
  });

  // [onSubmit]: ya validado por Zod, llama useAuth.login | [Principio]: SRP
  const onSubmit = handleSubmit(async (values) => {
    await login({ email: values.email, password: values.password });
  });

  return (
    <div className="w-full max-w-[420px] space-y-5">
      <header className="mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accede a la cuenta NeuroEdu IA.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}


      <form
        onSubmit={onSubmit}
        className="space-y-5"
        noValidate
        aria-label="Formulario de inicio de sesión"
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" role="alert" className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              className="size-4 rounded border-input accent-primary"
              {...register("remember")}
            />
            Recordarme
          </label>
          <Link
            href={AUTH_ROUTES.forgotPassword}
            className="font-semibold text-primary hover:text-primary-dark"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-brand text-white hover:opacity-90 h-11"
        >
          {isLoading ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground my-5">
        <span className="flex-1 h-px bg-border" />
        o continúa con
        <span className="flex-1 h-px bg-border" />
      </div>

      <OAuthButtons />

      <p className="text-center text-sm text-muted-foreground mt-6">
        ¿No tienes cuenta?{" "}
        <Link
          href={AUTH_ROUTES.register}
          className="font-semibold text-primary hover:text-primary-dark"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
