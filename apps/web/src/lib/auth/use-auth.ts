"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "./auth-client.js";

interface AuthUser {
  id: string;
  email: string;
  role: string;
  displayName: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
}

// Token almacenado en memoria — nunca en localStorage
let memoryToken: string | null = null;

export function getMemoryToken(): string | null {
  return memoryToken;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: false,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const res = await authClient.login({ email, password });
        memoryToken = res.data.accessToken;
        setState({ user: res.data.user, accessToken: res.data.accessToken, isLoading: false });
        router.push("/dashboard");
      } catch (err) {
        setState((s) => ({ ...s, isLoading: false }));
        toast.error(err instanceof Error ? err.message : "Login failed");
        throw err;
      }
    },
    [router],
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const res = await authClient.register({ email, password, displayName });
        memoryToken = res.data.accessToken;
        setState({ user: res.data.user, accessToken: res.data.accessToken, isLoading: false });
        router.push("/dashboard");
      } catch (err) {
        setState((s) => ({ ...s, isLoading: false }));
        toast.error(err instanceof Error ? err.message : "Registration failed");
        throw err;
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    await authClient.logout().catch(() => null);
    memoryToken = null;
    setState({ user: null, accessToken: null, isLoading: false });
    router.push("/login");
  }, [router]);

  return { ...state, login, register, logout };
}
