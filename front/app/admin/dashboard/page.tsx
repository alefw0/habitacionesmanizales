"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const router = useRouter();

  async function fetchListings(tabType: "pending" | "all") {
    setLoading(true);
    try {
      const endpoint = tabType === "pending" ? "/admin-api/listings/pending" : "/admin-api/listings/all";
      const res = await fetch(endpoint, {
        headers: { "X-Admin-Token": ADMIN_TOKEN },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: Listing[] = await res.json();
      setListings(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar anuncios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListings(tab);
  }, [tab]);

  async function publish(id: string) {
    setBusy(id);
    try {
      const res = await fetch(`/admin-api/listings/${id}/publish`, {
        method: "PATCH",
        headers: { "X-Admin-Token": ADMIN_TOKEN },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setBusy(null);
    }
  }

  async function reject(id: string) {
    if (!confirm("¿Eliminar este anuncio?")) return;
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

  function handleLogout() {
    document.cookie = "admin_session=; path=/; max-age=0";
    router.push("/login");
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
            onClick={handleLogout}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {tab === "pending" ? "Anuncios pendientes de moderación" : "Todos los anuncios"}
          </h2>
          <p className="mt-2 text-gray-600">
            {listings.length} anuncio{listings.length !== 1 ? "s" : ""}
            {tab === "pending" ? " esperando aprobación" : " publicados y pendientes"}
          </p>

          {/* Tabs */}
          <div className="mt-4 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setTab("pending")}
              className={`px-4 py-2 font-medium transition-colors ${
                tab === "pending"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setTab("all")}
              className={`px-4 py-2 font-medium transition-colors ${
                tab === "all"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Todos
            </button>
          </div>
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
            <p className="text-gray-500">No hay anuncios pendientes por revisar.</p>
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
                       <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                         listing.is_published 
                           ? "bg-green-100 text-green-800"
                           : "bg-yellow-100 text-yellow-800"
                       }`}>
                         {listing.is_published ? "✓ Publicado" : "⊙ Pendiente"}
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
                     {tab === "pending" ? (
                       <>
                         <button
                           onClick={() => publish(listing.id)}
                           disabled={busy === listing.id}
                           className="rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 px-4 transition-colors"
                         >
                           {busy === listing.id ? "..." : "✓ Publicar"}
                         </button>
                         <button
                           onClick={() => reject(listing.id)}
                           disabled={busy === listing.id}
                           className="rounded-lg bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 font-bold py-2 px-4 transition-colors"
                         >
                           {busy === listing.id ? "..." : "✕ Rechazar"}
                         </button>
                       </>
                     ) : (
                       <>
                         {!listing.is_published && (
                           <button
                             onClick={() => publish(listing.id)}
                             disabled={busy === listing.id}
                             className="rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 px-4 transition-colors"
                           >
                             {busy === listing.id ? "..." : "✓ Publicar"}
                           </button>
                         )}
                         {listing.is_published && (
                           <button
                             onClick={() => reject(listing.id)}
                             disabled={busy === listing.id}
                             className="rounded-lg bg-orange-100 hover:bg-orange-200 disabled:opacity-50 text-orange-700 font-bold py-2 px-4 transition-colors"
                           >
                             {busy === listing.id ? "..." : "↺ Despublicar"}
                           </button>
                         )}
                         <button
                           onClick={() => reject(listing.id)}
                           disabled={busy === listing.id}
                           className="rounded-lg bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 font-bold py-2 px-4 transition-colors"
                         >
                           {busy === listing.id ? "..." : "🗑 Eliminar"}
                         </button>
                       </>
                     )}
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
