/**
 * Next.js API route that proxies all /api/admin/* requests to the FastAPI
 * backend's /admin/* endpoints, injecting the ADMIN_TOKEN server-side.
 *
 * The token is read from the server-side env var ADMIN_TOKEN (not
 * NEXT_PUBLIC_ADMIN_TOKEN), so it is never sent to the browser.
 */
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params, "GET");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params, "DELETE");
}

async function proxy(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  if (!ADMIN_TOKEN) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN not configured on server" },
      { status: 500 }
    );
  }

  const backendPath = params.path.join("/");
  const url = `${BACKEND_URL}/admin/${backendPath}`;

  const body = method !== "GET" ? await request.text() : undefined;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": ADMIN_TOKEN,
    },
    body: body || undefined,
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
