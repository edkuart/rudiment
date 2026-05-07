import { fetchApiJson } from "@/lib/api-fetch";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...rest } = options;
  const payload =
    body === undefined || body === null || typeof body === "string" || body instanceof FormData
      ? body
      : JSON.stringify(body);

  const requestOptions = {
    ...rest,
    base: "v1",
    auth: "optional",
    ...(payload !== undefined ? { body: payload as BodyInit | null } : {}),
  } as const;

  return fetchApiJson<T>(path, requestOptions);
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
