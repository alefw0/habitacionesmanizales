import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy unificado para operaciones admin en listings:
 * - GET /api/admin/listings?action=pending → GET /admin/listings/pending
 * - PATCH /api/admin/listings?id={id}&action=publish → PATCH /admin/listings/{id}/publish
 * - PATCH /api/admin/listings?id={id}&action=unpublish → PATCH /admin/listings/{id}/unpublish
 * - DELETE /api/admin/listings?id={id} → DELETE /admin/listings/{id}
 */

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

if (!ADMIN_TOKEN) {
  console.warn("⚠️  ADMIN_TOKEN no está configurado");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  // GET /api/admin/listings?action=pending
  if (action === "pending") {
    return handleGetPending();
  }

  return NextResponse.json(
    { error: "Acción no reconocida. Use ?action=pending" },
    { status: 400 }
  );
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");

  if (!id) {
    return NextResponse.json(
      { error: "Falta parámetro: id" },
      { status: 400 }
    );
  }

  if (action === "publish") {
    return handlePublish(id);
  } else if (action === "unpublish") {
    return handleUnpublish(id);
  }

  return NextResponse.json(
    { error: "Acción no reconocida. Use ?action=publish o ?action=unpublish" },
    { status: 400 }
  );
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Falta parámetro: id" },
      { status: 400 }
    );
  }

  return handleDelete(id);
}

async function handleGetPending() {
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

async function handlePublish(id: string) {
  const url = `${BACKEND_URL}/admin/listings/${id}/publish`;

  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "X-Admin-Token": ADMIN_TOKEN,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Error en proxy publish:", err);
    return NextResponse.json(
      { error: "Error al publicar anuncio" },
      { status: 500 }
    );
  }
}

async function handleUnpublish(id: string) {
  const url = `${BACKEND_URL}/admin/listings/${id}/unpublish`;

  try {
    const res = await fetch(url, {
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
      { error: "Error al despublicar anuncio" },
      { status: 500 }
    );
  }
}

async function handleDelete(id: string) {
  const url = `${BACKEND_URL}/admin/listings/${id}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "X-Admin-Token": ADMIN_TOKEN,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Error en proxy delete:", err);
    return NextResponse.json(
      { error: "Error al eliminar anuncio" },
      { status: 500 }
    );
  }
}
