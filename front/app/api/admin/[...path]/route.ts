import { NextRequest, NextResponse } from "next/server";

/**
 * Ruta de proxy segura para endpoints de administración.
 * El token ADMIN_TOKEN se lee del servidor (nunca se expone al navegador).
 * Todos los requests desde el cliente van aquí, y esta ruta agrega el header
 * X-Admin-Token antes de llamar al backend.
 */

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path;
  const pathStr = path.join("/");
  const url = `${BACKEND_URL}/admin/${pathStr}${request.nextUrl.search}`;

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
    return NextResponse.json(
      { error: "Error proxying request to backend" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path;
  const pathStr = path.join("/");
  const url = `${BACKEND_URL}/admin/${pathStr}${request.nextUrl.search}`;

  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "X-Admin-Token": ADMIN_TOKEN,
        "Content-Type": "application/json",
      },
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Error proxying PATCH request to backend" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path;
  const pathStr = path.join("/");
  const url = `${BACKEND_URL}/admin/${pathStr}${request.nextUrl.search}`;

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
    return NextResponse.json(
      { error: "Error proxying DELETE request to backend" },
      { status: 500 }
    );
  }
}
