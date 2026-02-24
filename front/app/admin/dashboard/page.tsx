"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@/types";

// Leer token directamente desde env var (compilado en build time)
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_BACKEND_ADMIN_TOKEN || "";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://habitacionesmanizales-production.up.railway.app";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AdminDashboardPage() {
  // State management — todas las mutaciones pasan por setState
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  // Validar token está configurado
  if (!ADMIN_TOKEN) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="sticky top-0 z-40 bg-white shadow-sm border-b">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-bold text-blue-900">
              Panel de Moderación — Estudia&Vive Manizales
            </h1>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-red-50 border border-red-300 p-6">
            <p className="font-bold text-red-900">❌ Error de Configuración</p>
            <p className="text-red-700 text-sm mt-3 leading-relaxed">
              Token no configurado. Por favor agrega{" "}
              <code className="bg-red-100 px-2 py-1 rounded font-mono">
                NEXT_PUBLIC_BACKEND_ADMIN_TOKEN
              </code>{" "}
              en las variables de entorno de Vercel.
            </p>
            <p className="text-red-600 text-xs mt-2">
              Instrucciones: Ve a Vercel Settings → Environment Variables → Agrega la variable
              con el token del administrador.
            </p>
          </div>
        </main>
      </div>
    );
  }

  /**
   * Fetch published listings from backend
   */
  async function fetchListings() {
    setLoading(true);
    setError("");
    try {
      const url = `${BACKEND_URL}/admin/listings/all`;
      const res = await fetch(url, {
        headers: {
          "X-Admin-Token": ADMIN_TOKEN,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Error ${res.status}: ${text || "No se pudo cargar los anuncios"}`
        );
      }

      const data: Listing[] = await res.json();

      // Filter to only published listings
      const published = (Array.isArray(data) ? data : []).filter(
        (l) => l.is_published
      );

      setListings(published);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error desconocido al cargar";
      setError(message);
      console.error("[Admin Dashboard] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Unpublish a listing
   */
  async function handleUnpublish(id: string) {
    setBusy(id);
    try {
      const url = `${BACKEND_URL}/admin/listings/${id}/unpublish`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "X-Admin-Token": ADMIN_TOKEN,
        },
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status} al despublicar`);
      }

      // Remove from UI
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al despublicar";
      alert(message);
      console.error("[Admin Dashboard] Unpublish error:", err);
    } finally {
      setBusy(null);
    }
  }

  /**
   * Delete a listing
   */
  async function handleDelete(id: string) {
    // Confirm before deleting
    if (!confirm("¿Estás seguro? Esta acción no se puede deshacer.")) {
      return;
    }

    setBusy(id);
    try {
      const url = `${BACKEND_URL}/admin/listings/${id}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "X-Admin-Token": ADMIN_TOKEN,
        },
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status} al eliminar`);
      }

      // Remove from UI
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar";
      alert(message);
      console.error("[Admin Dashboard] Delete error:", err);
    } finally {
      setBusy(null);
    }
  }

  // Load listings on mount
  useEffect(() => {
    fetchListings();
  }, []);

  // ============================================
  // UI RENDERING
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white shadow-sm border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-bold text-blue-900">
            Panel de Moderación — Estudia&Vive Manizales
          </h1>
          <button
            onClick={fetchListings}
            disabled={loading}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 transition-colors"
          >
            {loading ? "Actualizando..." : "🔄 Actualizar"}
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Anuncios Publicados
          </h2>
          <p className="mt-2 text-gray-600">
            {listings.length} anuncio{listings.length !== 1 ? "s" : ""} activo
            {listings.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">Cargando anuncios...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
            <p className="font-bold mb-2">❌ Error:</p>
            <p className="text-sm font-mono">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && listings.length === 0 && (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              No hay anuncios publicados actualmente.
            </p>
          </div>
        )}

        {/* Listings grid */}
        {!loading && !error && listings.length > 0 && (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="grid gap-4 md:grid-cols-4">
                  {/* Image Column */}
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

                  {/* Info Column */}
                  <div className="md:col-span-2 space-y-2">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                        ✓ Publicado
                      </span>
                      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                        {listing.tipo}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900">
                      {listing.title}
                    </h3>

                    {/* Neighborhood */}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Barrio:</span>{" "}
                      {listing.neighborhood}
                    </p>

                    {/* Price */}
                    <p className="text-lg font-bold text-green-600">
                      {formatPrice(listing.price)}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        /mes
                      </span>
                    </p>

                    {/* Description */}
                    {listing.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    {/* Features */}
                    {listing.features?.length > 0 && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Características:</span>{" "}
                        {listing.features.join(", ")}
                      </p>
                    )}

                    {/* Contact */}
                    <p className="text-xs text-gray-400">
                      <span className="font-medium">Contacto:</span>{" "}
                      {listing.contact_phone}
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="md:col-span-1 flex flex-col gap-2 justify-center">
                    <button
                      onClick={() => handleUnpublish(listing.id)}
                      disabled={busy === listing.id}
                      className="rounded-lg bg-orange-100 hover:bg-orange-200 disabled:bg-orange-50 disabled:opacity-50 text-orange-700 font-bold py-2 px-4 transition-colors text-sm"
                    >
                      {busy === listing.id ? "..." : "↺ Despublicar"}
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={busy === listing.id}
                      className="rounded-lg bg-red-100 hover:bg-red-200 disabled:bg-red-50 disabled:opacity-50 text-red-700 font-bold py-2 px-4 transition-colors text-sm"
                    >
                      {busy === listing.id ? "..." : "🗑 Eliminar"}
                    </button>
                  </div>
                </div>

                {/* ID reference */}
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
