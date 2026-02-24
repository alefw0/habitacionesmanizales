import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy para operaciones en listados individuales:
 * PATCH /admin/listings/{id}/publish
 * PATCH /admin/listings/{id}/unpublish
 * DELETE /admin/listings/{id}
 */

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const action = url.pathname.split("/").pop(); // "publish" o "unpublish"
  
  const backendUrl = `${BACKEND_URL}/admin/listings/${id}/${action}`;

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
    console.error(`Error en proxy PATCH ${action}:`, err);
    return NextResponse.json(
      { error: `Error al ${action} el listado` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const backendUrl = `${BACKEND_URL}/admin/listings/${id}`;

  try {
    const res = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        "X-Admin-Token": ADMIN_TOKEN,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Error en proxy DELETE:", err);
    return NextResponse.json(
      { error: "Error al eliminar el listado" },
      { status: 500 }
    );
  }
}
