const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const API_ORIGIN = rawApiUrl
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/$/, "");

export const API_V1 = `${API_ORIGIN}/api/v1`;

export function apiOriginPath(path: string): string {
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function apiV1Path(path: string): string {
  return `${API_V1}${path.startsWith("/") ? path : `/${path}`}`;
}
