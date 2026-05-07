"use client";

import { apiOriginPath, apiV1Path } from "@/lib/api-base";
import {
  clearAccessToken,
  ensureAccessToken,
  getAccessToken,
} from "@/lib/auth/session";

type ApiAuthMode = "none" | "optional" | "required";
type ApiBase = "origin" | "v1";

type ApiFetchOptions = RequestInit & {
  auth?: ApiAuthMode;
  base?: ApiBase;
};

function resolveUrl(path: string, base: ApiBase) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return base === "origin" ? apiOriginPath(path) : apiV1Path(path);
}

function withJsonHeaders(headers: Headers, body: BodyInit | null | undefined) {
  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
}

export async function fetchApi(
  path: string,
  { auth = "optional", base = "v1", ...init }: ApiFetchOptions = {},
) {
  const url = resolveUrl(path, base);
  const headers = new Headers(init.headers);
  withJsonHeaders(headers, init.body);

  if (auth === "required") {
    const token = await ensureAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  } else if (auth === "optional") {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && auth !== "none") {
    clearAccessToken();
    const freshToken = await ensureAccessToken(true);
    if (freshToken) {
      headers.set("Authorization", `Bearer ${freshToken}`);
      response = await fetch(url, {
        ...init,
        headers,
        credentials: "include",
      });
    }
  }

  return response;
}

export async function fetchApiJson<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const response = await fetchApi(path, options);
  const body = (await response.json().catch(() => ({}))) as
    | T
    | { error?: { message?: string }; detail?: string };

  if (!response.ok) {
    const message =
      (body as { error?: { message?: string } }).error?.message ??
      (body as { detail?: string }).detail ??
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

export async function fetchApiData<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const body = await fetchApiJson<{ data: T }>(path, options);
  return body.data;
}
