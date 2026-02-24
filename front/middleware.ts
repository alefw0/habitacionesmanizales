import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow /admin/login without authentication
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }
  
  // Check auth for /admin page and other /admin/* routes (except /admin/login)
  if (pathname === "/admin" || (pathname.startsWith("/admin/") && pathname !== "/admin/login")) {
    const session = request.cookies.get("admin_session");
    if (!session || session.value !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
