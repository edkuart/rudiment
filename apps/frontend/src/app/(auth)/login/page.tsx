"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/use-auth";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password).catch(() => null);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Sign in to your Rudiment account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-white/60" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-white/60" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs hover:text-white transition-colors"
              style={{ color: "var(--color-brand-400)" }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--color-brand-500)" }}
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium hover:text-white transition-colors"
          style={{ color: "var(--color-brand-400)" }}
        >
          Start learning
        </Link>
      </p>
    </div>
  );
}
