import { NextResponse } from "next/server";

/**
 * API route que devuelve la configuración del cliente.
 * Las variables NEXT_PUBLIC_* no se cargan si Vercel no las tiene con ese prefijo.
 */
export async function GET() {
  return NextResponse.json({
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "https://habitacionesmanizales-production.up.railway.app",
    BACKEND_ADMIN_TOKEN: process.env.NEXT_PUBLIC_BACKEND_ADMIN_TOKEN || "",
  });
}
