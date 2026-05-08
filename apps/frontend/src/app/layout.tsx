import type { Metadata } from "next";
import { Bebas_Neue, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import { AuthProvider, type AuthUser } from "@/components/auth/AuthProvider";
import "@/styles/globals.css";

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = Buffer.from(
      part.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    const p = JSON.parse(json) as Record<string, unknown>;
    if (!p.sub || !p.email || !p.role) return null;
    return {
      id: p.sub as string,
      email: p.email as string,
      role: p.role as string,
      displayName: (p.displayName as string | undefined) ?? "",
    };
  } catch {
    return null;
  }
}

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rudiment — Premium Drum Academy",
    template: "%s | Rudiment",
  },
  description:
    "Master the drums with the official premium academy. Courses, masterclasses, and lessons from a world-class drummer.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Rudiment",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rudiment_access")?.value ?? null;
  const initialUser = accessToken ? decodeJwtPayload(accessToken) : null;

  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <AuthProvider initialUser={initialUser}>
          {children}
          <Toaster position="top-right" theme="dark" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
