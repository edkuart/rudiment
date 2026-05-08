import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const API_V1 =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1")
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/$/, "") + "/api/v1";

interface MeUser {
  id: string;
  email: string;
  role: string;
  displayName: string;
}

async function verifyAdmin(accessToken: string): Promise<MeUser | null> {
  try {
    const res = await fetch(`${API_V1}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data: MeUser };
    return body.data;
  } catch {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rudiment_access")?.value;

  if (!accessToken) redirect("/login?from=/admin");

  const user = await verifyAdmin(accessToken);

  if (!user) redirect("/login?from=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-0)]">
      <AdminSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--surface-2)] bg-[var(--surface-1)] px-6">
          <div />
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
              Live
            </span>
            <span className="text-xs text-[var(--text-3)]">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
