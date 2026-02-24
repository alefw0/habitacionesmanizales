"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import type { Listing } from "@/types";

function SuccessBanner() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  if (success !== "true") return null;

  return (
    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
      <p className="text-green-900 font-medium">
        ¡Gracias! Tu anuncio ha sido enviado con éxito. Nuestro equipo lo
        revisará y será publicado en breve.
      </p>
    </div>
  );
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Filters state
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<"Todos" | "Habitación" | "Apartaestudio">("Todos");
  const [maxPrice, setMaxPrice] = useState<string>("");

  useEffect(() => {
    fetch("/listings/")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar las habitaciones");
        return res.json();
      })
      .then((data: Listing[]) => {
        setListings(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error de conexión");
        setListings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute filtered listings
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // 1. Text search (Title or Neighborhood)
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.neighborhood.toLowerCase().includes(searchTerm);

      // 2. Type filter
      const matchesTipo = tipo === "Todos" || listing.tipo === tipo;

      // 3. Price filter
      const matchesPrice = !maxPrice || listing.price <= parseInt(maxPrice, 10);

      return matchesSearch && matchesTipo && matchesPrice;
    });
  }, [listings, search, tipo, maxPrice]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-lg font-bold text-blue-900 sm:text-xl">
            Estudia&Vive Manizales
          </span>
          <a
            href="https://tally.so/r/MebgPM"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 sm:px-6 inline-block"
          >
            Publicar Habitación
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
            Encuentra tu espacio ideal para estudiar en Manizales
          </h1>
          <h2 className="mt-4 text-base text-gray-600 sm:text-lg md:mt-6 md:text-xl">
            Conectamos estudiantes con las mejores habitaciones y apartaestudios
            cerca a la Nacional, la de Caldas, la Autónoma y más.
          </h2>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              placeholder="Ej: Palermo, El Cable..."
              className="w-full rounded-lg border-gray-300 border px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="tipo"
              className="w-full rounded-lg border-gray-300 border px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 bg-white"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
            >
              <option value="Todos">Todos</option>
              <option value="Habitación">Habitación</option>
              <option value="Apartaestudio">Apartaestudio</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Precio Máximo
            </label>
            <select
              id="price"
              className="w-full rounded-lg border-gray-300 border px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 bg-white"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            >
              <option value="">Sin límite</option>
              <option value="500000">Hasta $500.000</option>
              <option value="800000">Hasta $800.000</option>
              <option value="1200000">Hasta $1.200.000</option>
              <option value="2000000">Hasta $2.000.000</option>
            </select>
          </div>
        </div>
      </section>

      {/* Sección de Habitaciones */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <SuccessBanner />
        </Suspense>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Alojamientos Disponibles
          </h2>
          {!loading && !error && (
            <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
              {filteredListings.length} {filteredListings.length === 1 ? 'resultado' : 'resultados'}
            </span>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <p className="text-gray-500 animate-pulse">Buscando alojamientos...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600" role="alert">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-600 text-lg">
              Aún no hay alojamientos publicados. ¡Sé el primero en publicar uno!
            </p>
          </div>
        )}

        {!loading && !error && listings.length > 0 && filteredListings.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-600 text-lg">
              No encontramos alojamientos con esos filtros.
            </p>
            <button 
              onClick={() => { setSearch(""); setTipo("Todos"); setMaxPrice(""); }}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {!loading && !error && filteredListings.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 text-center text-gray-400 mt-12">
        <p className="px-4 text-sm sm:text-base">
          © 2026 Estudia&Vive Manizales. Hecho para la comunidad universitaria.
        </p>
      </footer>
    </div>
  );
}
