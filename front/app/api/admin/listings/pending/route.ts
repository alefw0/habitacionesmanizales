import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy para GET /admin/listings/pending
 * Lista anuncios pendientes de moderación
 */

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

export async function GET(request: NextRequest) {
  const url = `${BACKEND_URL}/admin/listings/pending`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Admin-Token": ADMIN_TOKEN,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Error en proxy pending:", err);
    return NextResponse.json(
      { error: "Error al obtener listados pendientes" },
      { status: 500 }
    );
  }
}
