import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || "no configurado";
  const adminToken = process.env.ADMIN_TOKEN ? "configurado (oculto)" : "NO CONFIGURADO";

  return NextResponse.json({
    BACKEND_URL: backendUrl,
    ADMIN_TOKEN: adminToken,
    NODE_ENV: process.env.NODE_ENV,
  });
}
