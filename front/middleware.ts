import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Only check auth for /admin page (not /admin/login)
  if (request.nextUrl.pathname === "/admin") {
    const session = request.cookies.get("admin_session");
    if (!session || session.value !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
