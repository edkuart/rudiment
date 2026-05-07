"use client";

import { apiClient } from "../api-client";
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
    apiClient.post<AuthResponse>("/auth/register", body),

  login: (body: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login", body),

  logout: () =>
    apiClient.post<{ data: { message: string } }>("/auth/logout"),

  refresh: () =>
    apiClient.post<{ data: AuthTokens }>("/auth/refresh"),

  me: (accessToken: string) =>
    apiClient.get<AuthResponse>("/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};
