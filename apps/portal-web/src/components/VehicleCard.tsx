"use client";

import Link from "next/link";
import { useCompare } from "@/context/CompareContext";
import { ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  currency?: "USD" | "UYU";
  priceLabel?: string;
  type?: string;
  transmission?: string;
  fuel?: string;
  km?: number;
  imageUrl?: string;
  badge?: string;
  isFeatured?: boolean;
  href?: string;
}

function formatPrice(price: number, currency: "USD" | "UYU" = "USD") {
  const symbol = currency === "USD" ? "U$S" : "$";
  return `${symbol} ${price.toLocaleString("es-UY")}`;
}

export default function VehicleCard({
  id,
  title,
  subtitle,
  price,
  currency = "USD",
  priceLabel,
  type,
  transmission,
  fuel,
  km,
  imageUrl,
  badge,
  isFeatured,
  href,
}: VehicleCardProps) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const linkHref = href ?? `/vehiculos/${id}`;
  const isSelected = isInCompare(id);

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelected) {
      removeFromCompare(id);
    } else {
      addToCompare({ id, title, image: imageUrl, price, currency });
    }
  };

  return (
    <Link
      href={linkHref}
      className="group flex flex-col rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-16 h-16 text-neutral-300"
            >
              <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
              <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z" />
              <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
            </svg>
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-2">
          {isFeatured && (
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
              </svg>
              DESTACADO
            </span>
          )}
          {badge && (
            <span className="rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
              {badge}
            </span>
          )}
          {(!badge && km === 0) && (
            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
              0 KM
            </span>
          )}
        </div>

        {/* Compare Toggle Button */}
        <button
          onClick={toggleCompare}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10",
            isSelected 
              ? "bg-primary-600 text-white shadow-lg scale-110" 
              : "bg-white/80 text-neutral-500 hover:bg-white hover:text-primary-600 shadow-sm"
          )}
          title={isSelected ? "Quitar de comparación" : "Comparar este vehículo"}
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Badges */}
        {(type || transmission || fuel) && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {type && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                {type}
              </span>
            )}
            {transmission && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                {transmission}
              </span>
            )}
            {fuel && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                {fuel}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
        )}
        {km != null && km > 0 && (
          <p className="text-xs text-neutral-400 mt-1">
            {km.toLocaleString("es-UY")} km
          </p>
        )}

        {/* Price */}
        <div className="mt-auto pt-3">
          <p className="text-xl font-bold text-neutral-900">
            {formatPrice(price, currency)}
          </p>
          {priceLabel && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-600 mt-0.5">
              {priceLabel}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
