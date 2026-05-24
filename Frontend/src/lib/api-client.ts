import { apiUrl } from "./constants";
import { ApiError, type BackendErrorBody } from "./errors";
// [Cliente HTTP universal]: fetch server-side y client-side | [Patrón]: Adapter + Facade | [Principio]: DRY + SSOT | [Paradigma]: Funcional

// [Opciones extendidas]: añadimos auth para inyectar Bearer | [Principio]: ISP
export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  bearer?: string;
}

// [Helper genérico]: parsea envelope { statusCode, data, meta } | [Principio]: SRP
export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, bearer, headers, ...rest } = options;

  // [Headers compuestos]: JSON default + Bearer opcional
  const composedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    ...((headers as Record<string, string>) ?? {}),
  };

  // [Fetch nativo]: no axios para reducir bundle | [Principio]: KISS
  const response = await fetch(apiUrl(path), {
    ...rest,
    headers: composedHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // [Parse JSON tolerante]: backend siempre devuelve JSON, pero defensivo
  const text = await response.text();
  const parsed: unknown = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const errBody = parsed as BackendErrorBody | null;
    const msg = errBody?.message
      ? Array.isArray(errBody.message)
        ? errBody.message.join(", ")
        : errBody.message
      : `HTTP ${response.status}`;
    throw new ApiError(response.status, msg, parsed);
  }

  // [Desempaquetado envelope]: { data } → T. Si no hay envelope, devuelve el body completo
  const envelope = parsed as { data?: T } | null;
  return (envelope?.data ?? (parsed as T)) as T;
}
