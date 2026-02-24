import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rutas públicas (libre acceso)
  if (pathname === "/login" || pathname === "/") {
    return NextResponse.next();
  }

  // Proteger /admin y cualquier subruta /admin/*
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const session = request.cookies.get("admin_session");
    if (session?.value === "authenticated") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Cualquier otra ruta pública
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
