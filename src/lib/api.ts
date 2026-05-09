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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    credentials: "include",
    signal: options.signal,
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return parseApiResponse<T>(response);
}

export async function apiFormRequest<T>(path: string, options: ApiFormRequestOptions) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "POST",
    credentials: "include",
    signal: options.signal,
    body: options.formData,
  });

  return parseApiResponse<T>(response);
}
