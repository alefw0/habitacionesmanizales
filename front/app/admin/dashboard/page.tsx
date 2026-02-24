"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import type { Listing } from "@/types";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_BACKEND_ADMIN_TOKEN || "";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function fetchListings() {
    setLoading(true);
    try {
      const res = await fetch("/admin-api/listings/all", {
        headers: { "X-Admin-Token": ADMIN_TOKEN },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: Listing[] = await res.json();
      // Filter to only published listings
      const published = (Array.isArray(data) ? data : []).filter((l) => l.is_published);
      setListings(published);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar anuncios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListings();
  }, []);

  async function unpublish(id: string) {
    setBusy(id);
    try {
      const res = await fetch(`/admin-api/listings/${id}/unpublish`, {
        method: "PATCH",
        headers: { "X-Admin-Token": ADMIN_TOKEN },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al despublicar");
    } finally {
      setBusy(null);
    }
  }

  async function deleteListing(id: string) {
    if (!confirm("¿Eliminar este anuncio permanentemente?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/admin-api/listings/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Token": ADMIN_TOKEN },
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
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-bold text-blue-900">
            Panel de Moderación — Estudia&Vive Manizales
          </h1>
          <button
            onClick={fetchListings}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Anuncios Publicados
          </h2>
          <p className="mt-2 text-gray-600">
            {listings.length} anuncio{listings.length !== 1 ? "s" : ""} activo{listings.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading && (
          <div className="rounded-lg bg-white p-8 text-center">
            <p className="text-gray-500">Cargando anuncios...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="rounded-lg bg-white p-8 text-center">
            <p className="text-gray-500">
              No hay anuncios publicados actualmente.
            </p>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="grid gap-4 md:grid-cols-4">
                  {/* Imagen */}
                  <div className="md:col-span-1">
                    {listing.image_urls?.[0] ? (
                      <img
                        src={listing.image_urls[0]}
                        alt={listing.title}
                        className="h-32 w-full object-cover rounded-lg bg-gray-100"
                      />
                    ) : (
                      <div className="h-32 w-full rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {/* Info */}
                   <div className="md:col-span-2 space-y-2">
                     <div className="flex items-center gap-2 flex-wrap">
                       <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                         ✓ Publicado
                       </span>
                       <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                         {listing.tipo}
                       </span>
                     </div>

                    <h3 className="text-lg font-bold text-gray-900">
                      {listing.title}
                    </h3>

                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Barrio:</span> {listing.neighborhood}
                    </p>

                    <p className="text-lg font-bold text-green-600">
                      {formatPrice(listing.price)} <span className="text-xs text-gray-400">/mes</span>
                    </p>

                    {listing.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    {listing.features?.length > 0 && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Características:</span> {listing.features.join(", ")}
                      </p>
                    )}

                    <p className="text-xs text-gray-400">
                      <span className="font-medium">Contacto:</span> {listing.contact_phone}
                    </p>
                  </div>

                   {/* Actions */}
                    <div className="md:col-span-1 flex flex-col gap-2 justify-center">
                      <button
                        onClick={() => unpublish(listing.id)}
                        disabled={busy === listing.id}
                        className="rounded-lg bg-orange-100 hover:bg-orange-200 disabled:opacity-50 text-orange-700 font-bold py-2 px-4 transition-colors"
                      >
                        {busy === listing.id ? "..." : "↺ Despublicar"}
                      </button>
                      <button
                        onClick={() => deleteListing(listing.id)}
                        disabled={busy === listing.id}
                        className="rounded-lg bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 font-bold py-2 px-4 transition-colors"
                      >
                        {busy === listing.id ? "..." : "🗑 Eliminar"}
                      </button>
                    </div>
                </div>

                {/* ID para referencia */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400 font-mono">
                    ID: {listing.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
