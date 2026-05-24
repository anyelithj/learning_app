import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAMES } from "./lib/constants";
// [Proxy Next.js 16]: protege rutas (portal)/* y redirige auth si ya hay sesión | [Patrón]: Chain of Responsibility | [Principio]: SRP | [Paradigma]: Funcional + AOP
// [Nota]: en Next.js 16 el archivo `middleware.ts` fue deprecado y renombrado a `proxy.ts`.

// [Rutas portal]: requieren sesión. Si el usuario no tiene access cookie → /login
const PORTAL_PREFIXES = ["/dashboard", "/quiz", "/leaderboard", "/profile", "/assistant"];

// [Rutas auth]: si ya hay sesión → /dashboard (evita login si ya autenticado)
const AUTH_PREFIXES = ["/login", "/register"];

export function proxy(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;
  // [Cookie access]: solo verificamos presencia. Validación de firma ocurre en backend
  const hasSession = request.cookies.has(COOKIE_NAMES.access);

  // [Portal sin sesión → /login]: append `?from=…` para volver tras login
  if (PORTAL_PREFIXES.some((p) => pathname.startsWith(p)) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // [Auth con sesión → /dashboard]: evita doble-login UX
  if (AUTH_PREFIXES.some((p) => pathname.startsWith(p)) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // [Sin match → continuar normal]: NextResponse.next() implícito al no retornar
  return undefined;
}

// [Matcher]: excluye assets, api, _next | [Buena práctica]: no procesar requests estáticos
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js)$).*)",
  ],
};
