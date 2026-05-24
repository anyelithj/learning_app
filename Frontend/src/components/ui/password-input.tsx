"use client";
import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
// [PasswordInput]: input con toggle ver/ocultar contraseña | [Patrón]: Composite | [Principio]: SRP | [Paradigma]: Funcional + Reactivo

export type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

// [forwardRef]: compatibilidad con react-hook-form `register()` | [Patrón]: forwardRef
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
