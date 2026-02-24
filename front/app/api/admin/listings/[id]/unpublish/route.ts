import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy para PATCH /admin/listings/{id}/unpublish
 */

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const backendUrl = `${BACKEND_URL}/admin/listings/${id}/unpublish`;

  try {
    const res = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "X-Admin-Token": ADMIN_TOKEN,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Error en proxy unpublish:", err);
    return NextResponse.json(
      { error: "Error al despublicar el listado" },
      { status: 500 }
    );
  }
}
