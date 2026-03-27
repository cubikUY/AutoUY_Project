"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCompare } from "@/context/CompareContext";
import { ArrowLeft, Trash2, Car, Calendar, Gauge, Fuel, Settings, Zap, ArrowRightLeft } from "lucide-react";

export default function ComparePage() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      fetchVehicles();
    } else {
      setVehicles([]);
    }
  }, [items.map(i => i.id).join(',')]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      // Fetch details for each selected vehicle
      const detailPromises = items.map(item => 
        fetch(`/api/vehicles/${item.id}`).then(res => res.json())
      );
      const results = await Promise.all(detailPromises);
      setVehicles(results.filter(v => v && !v.error));
    } catch (error) {
      console.error("Error fetching vehicles for comparison", error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-28 pb-12 flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ArrowRightLeft className="w-10 h-10 text-neutral-300" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mb-4">No hay vehículos para comparar</h1>
          <p className="text-neutral-500 mb-8">Seleccioná al menos 2 vehículos en el buscador o en las páginas de detalle para ver sus diferencias.</p>
          <Link 
            href="/buscar"
            className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-8 py-4 text-sm font-black text-white hover:bg-primary-700 transition-all shadow-xl shadow-primary-100"
          >
            Ir al buscador
          </Link>
        </div>
      </div>
    );
  }

  const specs = [
    { label: "Precio", key: "price", format: (v: any) => `${v.currency === 'USD' ? 'U$S' : '$'} ${Number(v.price).toLocaleString('es-UY')}`, icon: Zap },
    { label: "Año", key: "year", icon: Calendar },
    { label: "Kilometraje", key: "mileage", format: (v: any) => `${Number(v.mileage).toLocaleString('es-UY')} km`, icon: Gauge },
    { label: "Combustible", key: "fuelType", icon: Fuel },
    { label: "Transmisión", key: "transmission", icon: Settings },
    { label: "Motor", key: "engineSize", icon: Car },
    { label: "Tipo", key: "vehicleType" },
    { label: "Condición", key: "condition", format: (v: any) => v.condition === 'NEW' ? '0km' : 'Usado' },
    { label: "Vendido por", key: "dealer", format: (v: any) => v.dealer?.businessName || "Particular" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-20">
      <div className="container-page py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div>
            <Link 
              href="/buscar" 
              className="inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-primary-600 transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver al buscador
            </Link>
            <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Comparación Técnica</h1>
            <p className="text-neutral-500 mt-2">Revisá las especificaciones detalladas lado a lado.</p>
          </div>
          
          <button 
            onClick={clearCompare}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-bold text-neutral-600 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar comparación
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent align-[-0.125em]" />
            <p className="mt-4 text-sm font-bold text-neutral-400">Cargando datos técnicos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-neutral-100">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-neutral-50/80 backdrop-blur-md p-8 w-1/4 border-b border-neutral-100 z-10">
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Especificaciones</span>
                  </th>
                  {vehicles.map((v) => (
                    <th key={v.id} className="p-8 border-b border-neutral-100 w-1/4">
                      <div className="relative group mb-6 aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100">
                        {v.images?.find((img: any) => img.isCover)?.url ? (
                          <img 
                            src={v.images.find((img: any) => img.isCover).url} 
                            alt={v.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-12 h-12 text-neutral-300" />
                          </div>
                        )}
                        <button 
                          onClick={() => removeFromCompare(v.id)}
                          className="absolute top-3 right-3 bg-neutral-900/50 backdrop-blur-md text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-lg font-black text-neutral-900 leading-tight mb-2 line-clamp-2">{v.title}</h3>
                      <Link 
                        href={`/vehiculos/${v.id}`}
                        className="text-xs font-bold text-primary-600 hover:underline"
                      >
                        Ver ficha completa
                      </Link>
                    </th>
                  ))}
                  {/* Empty slots placeholders */}
                  {Array.from({ length: 3 - vehicles.length }).map((_, i) => (
                    <th key={`placeholder-${i}`} className="p-8 border-b border-neutral-100 w-1/4 opacity-30 grayscale">
                      <div className="border-2 border-dashed border-neutral-200 rounded-2xl aspect-[4/3] flex flex-col items-center justify-center gap-2 mb-6">
                        <ArrowRightLeft className="w-8 h-8 text-neutral-300" />
                        <span className="text-[10px] font-bold text-neutral-400">ESPACIO VACÍO</span>
                      </div>
                      <div className="h-6 w-3/4 bg-neutral-100 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-neutral-50 rounded"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specs.map((spec, index) => (
                  <tr key={spec.key} className={index % 2 === 0 ? "bg-white" : "bg-neutral-25/30"}>
                    <td className="sticky left-0 bg-neutral-50/80 backdrop-blur-md p-6 font-bold text-neutral-600 border-b border-neutral-100 z-10">
                      <div className="flex items-center gap-3">
                        {spec.icon && <spec.icon className="w-4 h-4 text-neutral-400" />}
                        <span className="text-sm">{spec.label}</span>
                      </div>
                    </td>
                    {vehicles.map((v) => (
                      <td key={`${v.id}-${spec.key}`} className="p-6 text-sm font-medium text-neutral-900 border-b border-neutral-100">
                        {spec.format ? spec.format(v) : (v[spec.key] || "-")}
                      </td>
                    ))}
                    {/* Empty cells */}
                    {Array.from({ length: 3 - vehicles.length }).map((_, i) => (
                      <td key={`empty-cell-${spec.key}-${i}`} className="p-6 border-b border-neutral-100">
                        <span className="text-neutral-200">—</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
