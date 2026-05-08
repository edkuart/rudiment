"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { clearAccessToken, setAccessToken } from "@/lib/auth/session";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  displayName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await authClient.login({ email, password });
        setAccessToken(res.data.accessToken, res.data.expiresIn);
        setUser(res.data.user);
        router.push("/dashboard");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Login failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      setIsLoading(true);
      try {
        const res = await authClient.register({ email, password, displayName });
        setAccessToken(res.data.accessToken, res.data.expiresIn);
        setUser(res.data.user);
        router.push("/dashboard");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Registration failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    await authClient.logout().catch(() => null);
    clearAccessToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === "ADMIN",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
