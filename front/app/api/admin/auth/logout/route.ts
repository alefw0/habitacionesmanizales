import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { success: true, message: "Sesión cerrada" },
    { status: 200 }
  );

  // Clear the admin_session cookie
  response.cookies.set({
    name: "admin_session",
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
