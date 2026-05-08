import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PREFIX = "/admin";
const STUDENT_PREFIXES = ["/dashboard", "/settings"];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("rudiment_access")?.value;

  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
  const isStudentRoute = STUDENT_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isAdminRoute && !isStudentRoute) return NextResponse.next();

  if (!accessToken) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute) {
    const payload = decodeJwtPayload(accessToken);
    if (payload?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/settings/:path*"],
};
