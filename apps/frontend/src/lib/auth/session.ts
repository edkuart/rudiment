"use client";

import { apiOriginPath } from "@/lib/api-base";

let accessToken: string | null = null;
let accessTokenExpiresAt = 0;
let refreshRequest: Promise<string | null> | null = null;

type RefreshResponse = {
  data: {
    accessToken: string;
    expiresIn: number;
  };
};

export function setAccessToken(token: string, expiresInSeconds: number) {
  accessToken = token;
  accessTokenExpiresAt = Date.now() + expiresInSeconds * 1000;
}

export function getAccessToken(): string | null {
  if (!accessToken) return null;
  if (Date.now() >= accessTokenExpiresAt - 5_000) return null;
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
  accessTokenExpiresAt = 0;
}

export async function ensureAccessToken(forceRefresh = false): Promise<string | null> {
  if (typeof window === "undefined") return accessToken;

  if (!forceRefresh) {
    const current = getAccessToken();
    if (current) return current;
  }

  if (!refreshRequest) {
    refreshRequest = fetch(apiOriginPath("/api/v1/auth/refresh"), {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          clearAccessToken();
          return null;
        }

        const body = (await response.json()) as RefreshResponse;
        setAccessToken(body.data.accessToken, body.data.expiresIn);
        return body.data.accessToken;
      })
      .catch(() => {
        clearAccessToken();
        return null;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}
