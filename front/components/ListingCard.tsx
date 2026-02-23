"use client";

import Link from "next/link";
import type { Listing } from "@/types";

interface ListingCardProps {
  listing: Listing;
}

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

export default function ListingCard({ listing }: ListingCardProps) {
  const hasImage =
    Array.isArray(listing.image_urls) && listing.image_urls.length > 0;
  const firstImage = hasImage ? listing.image_urls[0] : null;
  const displayFeatures = (listing.features ?? []).slice(0, 3);
  const tipoBadgeStyle = TIPO_STYLES[listing.tipo] ?? "bg-gray-100 text-gray-700";

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg group flex flex-col h-full">
      <Link href={`/alojamiento/${listing.id}`} className="block flex-1 cursor-pointer">
        {/* Imagen */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          {firstImage ? (
            <img
              src={firstImage}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
              Sin imagen
            </div>
          )}
          {/* Badge tipo sobre la imagen */}
          <span
            className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ${tipoBadgeStyle}`}
          >
            {listing.tipo}
          </span>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          {/* Barrio */}
          <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 w-fit">
            {listing.neighborhood}
          </span>

          {/* Título */}
          <h2 className="mt-2 text-lg font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
            {listing.title}
          </h2>

          {/* Precio */}
          <p className="mt-1 text-xl font-bold text-green-600">
            {formatPrice(listing.price)}
            <span className="ml-1 text-sm font-normal text-gray-400">/ mes</span>
          </p>

          {/* Características */}
          {displayFeatures.length > 0 && (
            <p className="mt-2 text-sm text-gray-500 flex-1">
              {displayFeatures.join(" · ")}
            </p>
          )}
        </div>
      </Link>

      {/* Botón WhatsApp separado del Link para no interferir */}
      <div className="px-4 pb-4 mt-auto">
        <a
          href={getWhatsAppUrl(listing.contact_phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-bold text-white transition-colors hover:bg-green-600"
          onClick={(e) => e.stopPropagation()}
        >
          Contactar por WhatsApp
        </a>
      </div>
    </article>
  );
}
