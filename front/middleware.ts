import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow /login without authentication
  if (pathname === "/login") {
    return NextResponse.next();
  }
  
  // Allow /admin (login page) without authentication
  if (pathname === "/admin") {
    return NextResponse.next();
  }

  // Check auth for /admin/dashboard and other protected routes
  if (pathname.startsWith("/admin/")) {
    const session = request.cookies.get("admin_session");
    if (session && session.value === "authenticated") {
      return NextResponse.next();
    }
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/admin", request.url));
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
