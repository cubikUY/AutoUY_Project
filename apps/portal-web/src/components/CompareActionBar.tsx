"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCompare } from "@/context/CompareContext";
import { X, ArrowRightLeft, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompareActionBar() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const [isExpanded, setIsExpanded] = useState(true);
  const [show, setShow] = useState(false);

  // Avoid SSR hydration mismatch and only show if we have items
  useEffect(() => {
    setShow(items.length > 0);
  }, [items.length]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header/Toggle Mobile */}
        <div className="flex items-center justify-between p-4 bg-neutral-50 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="bg-primary-100 p-1.5 rounded-lg">
              <ArrowRightLeft className="w-4 h-4 text-primary-600" />
            </div>
            <span className="font-bold text-neutral-900">Comparar ({items.length}/3)</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
            <button 
              onClick={clearCompare}
              className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
              title="Limpiar todo"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-6 items-center">
            {/* Selected items */}
            <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
              {items.map((vehicle) => (
                <div 
                  key={vehicle.id} 
                  className="relative group flex-shrink-0 w-16 sm:w-20"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 ring-2 ring-transparent group-hover:ring-primary-500 transition-all duration-300">
                    {vehicle.image ? (
                      <img 
                        src={vehicle.image} 
                        alt={vehicle.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                         <ArrowRightLeft className="w-6 h-6 text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => removeFromCompare(vehicle.id)}
                    className="absolute -top-2 -right-2 bg-neutral-900 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95 z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="mt-1.5 text-[10px] sm:text-xs font-bold text-neutral-700 truncate text-center">
                    {vehicle.title.split(' ')[0]} {vehicle.title.split(' ')[1]}
                  </p>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 3 - items.length }).map((_, i) => (
                <div 
                  key={`empty-${i}`} 
                  className="flex-shrink-0 w-16 sm:w-20 border-2 border-dashed border-neutral-100 rounded-xl aspect-[4/3] flex flex-col items-center justify-center"
                >
                   <span className="text-neutral-300 text-[10px] font-bold">+</span>
                </div>
              ))}
            </div>

            {/* Action button */}
            <Link
              href="/comparar"
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-black text-white transition-all shadow-xl active:scale-95",
                items.length >= 2 
                  ? "bg-primary-600 hover:bg-primary-700 shadow-primary-200" 
                  : "bg-neutral-300 cursor-not-allowed grayscale pointer-events-none"
              )}
            >
              Comparar ahora
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
