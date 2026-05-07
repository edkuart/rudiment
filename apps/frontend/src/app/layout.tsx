import type { Metadata } from "next";
import { Bebas_Neue, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import "@/styles/globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        {children}
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}
