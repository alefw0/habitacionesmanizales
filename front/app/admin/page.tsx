"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@/types";

// All admin calls go through /api/admin/* (Next.js API route) — token is
// injected server-side, never exposed to the browser.

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null); // id del listing en proceso

  async function fetchPending() {
    setLoading(true);
    try {
      console.log("Fetching pending listings from /api/admin/listings?action=pending");
      const res = await fetch("/api/admin/listings?action=pending");
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      
      const data: Listing[] = await res.json();
      console.log("Data received:", data);
      setListings(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error de conexión";
      console.error("Fetch error:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPending();
  }, []);

  async function publish(id: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/listings?id=${id}&action=publish`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setBusy(null);
    }
  }

  async function deleteListing(id: string) {
    if (!confirm("¿Eliminar este anuncio permanentemente?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/listings?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold text-blue-900">
            Admin — Estudia y Vive en Manizales
          </span>
          <a href="/" className="text-sm text-blue-600 hover:underline">
            Ver sitio
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Anuncios pendientes de moderación
          </h1>
          <button
            onClick={fetchPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
          >
            Actualizar
          </button>
        </div>

        {loading && <p className="text-gray-500">Cargando...</p>}
        {!loading && error && (
          <p className="text-red-600">
            {error === "Error 403"
              ? "Token inválido. Revisa ADMIN_TOKEN en variables de entorno"
              : error}
          </p>
        )}
        {!loading && !error && listings.length === 0 && (
          <p className="text-gray-500">No hay anuncios pendientes.</p>
        )}

        <div className="flex flex-col gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-md sm:flex-row sm:items-start"
            >
              {/* Imagen */}
              <div className="h-36 w-full flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:w-48">
                {listing.image_urls?.[0] ? (
                  <img
                    src={listing.image_urls[0]}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                    Pendiente
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {listing.tipo}
                  </span>
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  {listing.title}
                </h2>
                <p className="text-sm text-gray-500">{listing.neighborhood}</p>
                <p className="text-sm font-semibold text-green-600">
                  {formatPrice(listing.price)} / mes
                </p>
                {listing.features?.length > 0 && (
                  <p className="text-xs text-gray-400">
                    {listing.features.join(" · ")}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  WhatsApp: {listing.contact_phone}
                </p>
                <p className="text-xs text-gray-300 mt-1 font-mono">
                  ID: {listing.id}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex flex-row gap-2 sm:flex-col">
                <button
                  onClick={() => publish(listing.id)}
                  disabled={busy === listing.id}
                  className="rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-50"
                >
                  {busy === listing.id ? "..." : "Publicar"}
                </button>
                <button
                  onClick={() => deleteListing(listing.id)}
                  disabled={busy === listing.id}
                  className="rounded-lg bg-red-100 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-200 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
