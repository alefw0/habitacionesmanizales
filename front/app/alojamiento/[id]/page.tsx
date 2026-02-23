"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Listing } from "@/types";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

function getWhatsAppUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const withCountry = cleaned.startsWith("57") ? cleaned : `57${cleaned}`;
  return `https://wa.me/${withCountry}`;
}

const TIPO_STYLES: Record<string, string> = {
  "Habitación": "bg-blue-100 text-blue-800",
  "Apartaestudio": "bg-purple-100 text-purple-800",
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    fetch(`/listings/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Alojamiento no encontrado");
        return res.json();
      })
      .then((data: Listing) => {
        setListing(data);
        setError("");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error al cargar");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Cargando detalles...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-red-600 mb-4">{error || "No encontrado"}</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const tipoBadgeStyle = TIPO_STYLES[listing.tipo] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navbar Simple */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 font-medium hover:underline flex items-center gap-2"
          >
            &larr; Volver
          </button>
          <span className="text-lg font-bold text-blue-900 hidden sm:block">
            Estudia&Vive Manizales
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Galería de Fotos */}
          <div className="w-full bg-gray-200 overflow-x-auto flex snap-x snap-mandatory">
            {listing.image_urls && listing.image_urls.length > 0 ? (
              listing.image_urls.map((url, i) => (
                <div key={i} className="flex-none w-full sm:w-[600px] h-[300px] sm:h-[400px] snap-center">
                  <img
                    src={url}
                    alt={`Foto ${i + 1} de ${listing.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center text-gray-400">
                Sin imágenes disponibles
              </div>
            )}
          </div>

          {/* Contenido Principal */}
          <div className="p-6 sm:p-10 flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Detalles (Izquierda) */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tipoBadgeStyle}`}>
                  {listing.tipo}
                </span>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 font-medium">
                  {listing.neighborhood}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {listing.title}
              </h1>
              
              <div className="text-sm text-gray-500 mb-8">
                Publicado el {new Date(listing.created_at).toLocaleDateString("es-CO")}
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Descripción</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {listing.description || "Sin descripción proporcionada."}
                </p>
              </div>

              {listing.features && listing.features.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Características</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {listing.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-500">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sticky Card (Derecha) */}
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="sticky top-24 bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Precio</p>
                <div className="text-3xl font-bold text-green-600 mb-6">
                  {formatPrice(listing.price)}
                  <span className="text-base font-normal text-gray-500 ml-1">/ mes</span>
                </div>

                <a
                  href={getWhatsAppUrl(listing.contact_phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-bold text-white transition-colors hover:bg-green-600 mb-4 shadow-sm shadow-green-200"
                >
                  Contactar Propietario
                </a>
                
                <p className="text-xs text-center text-gray-400">
                  Dile que vienes de Estudia&Vive Manizales
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
