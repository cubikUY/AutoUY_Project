"use client";

import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import VehicleCard from "@/components/VehicleCard";
import { Clock, Trash2 } from "lucide-react";

export default function RecentlyViewed() {
  const { recentItems, clearHistory } = useRecentlyViewed();

  if (recentItems.length === 0) return null;

  return (
    <section className="py-16 bg-neutral-50/50 border-t border-neutral-100">
      <div className="container-page">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary-50 p-2 rounded-xl text-primary-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Vistos recientemente</h2>
              <p className="text-sm text-neutral-500 font-medium">Tus últimas búsquedas y vehículos consultados</p>
            </div>
          </div>
          <button 
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-widest pl-4"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar historial
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentItems.map((v) => (
            <VehicleCard
              key={v.id}
              id={v.id}
              title={v.title}
              price={v.price}
              currency={v.currency as any}
              imageUrl={v.image}
              km={v.mileage}
              subtitle={v.brandName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
