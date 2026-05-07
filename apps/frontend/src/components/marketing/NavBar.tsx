"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav-bar sticky top-0 z-50 ${scrolled ? "scrolled" : ""}`}>
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 h-[72px]">
        {/* Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-[10px] font-[family-name:var(--font-display)] text-[28px] tracking-[0.08em] text-[var(--color-gold-400)]"
        >
          <span className="logo-dot" aria-hidden="true" />
          Rudiment
        </Link>

        {/* Desktop nav links */}
        <nav className="nav-desktop-links flex items-center gap-7 text-sm text-[var(--text-2)]">
          <Link href="/library" className="hover:text-[var(--text-1)] transition-colors">
            Library
          </Link>
          <a href="#how" className="hover:text-[var(--text-1)] transition-colors">
            How it works
          </a>
          <a href="#pricing" className="hover:text-[var(--text-1)] transition-colors">
            Pricing
          </a>
          <a
            href="#manifest"
            className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"
          >
            Manifesto
          </a>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-[10px]">
          <Link href="/login" className="mkt-btn mkt-btn-ghost">
            Sign in
          </Link>
          <Link href="/register" className="mkt-btn mkt-btn-primary nav-primary-cta">
            Start Membership
          </Link>
          <button className="nav-hamburger" aria-label="Open menu">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
