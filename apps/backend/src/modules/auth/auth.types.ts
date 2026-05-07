import type { users } from "../../shared/db/schema/index.js";

export type User = typeof users.$inferSelect;

export interface JwtAccessPayload {
  sub: string;      // userId
  email: string;
  role: string;
  displayName?: string | undefined;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number; // segundos
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  displayName: string;
}
