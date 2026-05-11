import { logger } from "@/lib/logger";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

type ApiFormRequestOptions = {
  method?: "POST" | "PUT" | "PATCH";
  formData: FormData;
  signal?: AbortSignal;
};

async function parseApiResponse<T>(response: Response) {
  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as
    | { error?: string; message?: string }
    | T
    | null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && payload.error
        ? payload.error
        : payload && typeof payload === "object" && "message" in payload && payload.message
          ? payload.message
          : "Request failed.";

    throw new Error(message);
  }

  return payload as T;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const method = options.method || "GET";

  logger.debug("api.request.started", {
    requestId,
    method,
    path,
    hasBody: Boolean(options.body),
  });

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      signal: options.signal,
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const payload = await parseApiResponse<T>(response);
    logger.info("api.request.completed", {
      requestId,
      method,
      path,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    return payload;
  } catch (error) {
    logger.error("api.request.failed", {
      requestId,
      method,
      path,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function apiFormRequest<T>(path: string, options: ApiFormRequestOptions) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const method = options.method || "POST";

  logger.debug("api.form_request.started", {
    requestId,
    method,
    path,
    formKeys: Array.from(options.formData.keys()),
  });

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      signal: options.signal,
      body: options.formData,
    });

    const payload = await parseApiResponse<T>(response);
    logger.info("api.form_request.completed", {
      requestId,
      method,
      path,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    return payload;
  } catch (error) {
    logger.error("api.form_request.failed", {
      requestId,
      method,
      path,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
