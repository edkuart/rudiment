"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/use-auth.js";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await register(email, password, displayName).catch(() => null);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Join the Rudiment drum academy
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-white/60" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            placeholder="John Bonham"
          />
        </div>

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
          <label className="block text-sm font-medium text-white/60" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            placeholder="Min. 8 characters"
          />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Must include uppercase letter and number
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--color-brand-500)" }}
        >
          {isLoading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline hover:text-white/60 transition-colors">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-white/60 transition-colors">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="mt-4 text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium hover:text-white transition-colors"
          style={{ color: "var(--color-brand-400)" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
