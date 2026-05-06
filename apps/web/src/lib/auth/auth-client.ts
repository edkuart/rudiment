"use client";

import { apiClient } from "../api-client.js";
import type { AuthTokens, LoginRequest, RegisterRequest } from "@rudiment/types";

interface AuthResponse {
  data: {
    user: { id: string; email: string; role: string; displayName: string };
    accessToken: string;
    expiresIn: number;
  };
}

export const authClient = {
  register: (body: RegisterRequest) =>
    apiClient.post<AuthResponse>("/api/v1/auth/register", body),

  login: (body: LoginRequest) =>
    apiClient.post<AuthResponse>("/api/v1/auth/login", body),

  logout: () =>
    apiClient.post<{ data: { message: string } }>("/api/v1/auth/logout"),

  refresh: () =>
    apiClient.post<{ data: AuthTokens }>("/api/v1/auth/refresh"),

  me: (accessToken: string) =>
    apiClient.get<AuthResponse>("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};
