import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow /admin/login without authentication
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }
  
  // Check auth for /admin and other /admin/* routes
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const session = request.cookies.get("admin_session");
    if (!session || session.value !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
