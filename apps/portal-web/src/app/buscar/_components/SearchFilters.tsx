"use client";

import { Brand, Model } from "@autouuy/database";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Modal from "@/components/Modal";

type FilterBrand = Brand & { _count: { vehicles: number } };
type FilterModel = Model & { _count: { vehicles: number } };

interface SearchFiltersProps {
  brands: FilterBrand[];
  models: FilterModel[];
  cities: string[];
}

export default function SearchFilters({ brands, models, cities }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for filters
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    marca: searchParams.get("marca") || "",
    modelo: searchParams.get("modelo") || "",
    tipo: searchParams.get("tipo") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    fromYear: searchParams.get("fromYear") || "",
    toYear: searchParams.get("toYear") || "",
    minKm: searchParams.get("minKm") || "",
    maxKm: searchParams.get("maxKm") || "",
    km: searchParams.get("km") || "",
    transmission: searchParams.get("transmission") || "",
    fuel: searchParams.get("fuel") || "",
    ubicacion: searchParams.get("ubicacion") || "",
    sort: searchParams.get("sort") || "newest",
  });

  // Sync internal state with URL params
  useEffect(() => {
    setFilters({
      q: searchParams.get("q") || "",
      marca: searchParams.get("marca") || "",
      modelo: searchParams.get("modelo") || "",
      tipo: searchParams.get("tipo") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      fromYear: searchParams.get("fromYear") || "",
      toYear: searchParams.get("toYear") || "",
      minKm: searchParams.get("minKm") || "",
      maxKm: searchParams.get("maxKm") || "",
      km: searchParams.get("km") || "",
      transmission: searchParams.get("transmission") || "",
      fuel: searchParams.get("fuel") || "",
      ubicacion: searchParams.get("ubicacion") || "",
      sort: searchParams.get("sort") || "newest",
    });
  }, [searchParams]);

  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState("");

  const selectedBrands = useMemo(() => filters.marca ? filters.marca.split(",") : [], [filters.marca]);
  const selectedModels = useMemo(() => filters.modelo ? filters.modelo.split(",") : [], [filters.modelo]);

  const topTenBrands = brands.slice(0, 10);
  const topTenModels = models.slice(0, 10);

  const YEARS = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

  // Count active filters (excluding sort and page)
  const appliedFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "sort" || key === "page") return false;
      return !!value;
    }).length;
  }, [filters]);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const applyFilters = (overrides: Partial<typeof filters> = {}) => {
    const currentFilters = { ...filters, ...overrides };
    const params = new URLSearchParams(searchParams.toString());
    
    params.set("page", "1");

    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    router.push(`/buscar?${params.toString()}`);
  };

  const toggleBrand = (brandName: string) => {
    let newBrands: string[];
    if (selectedBrands.includes(brandName)) {
      newBrands = selectedBrands.filter(b => b !== brandName);
    } else {
      newBrands = [...selectedBrands, brandName];
    }
    const brandString = newBrands.join(",");
    updateFilters({ marca: brandString, modelo: "" }); 
    applyFilters({ marca: brandString, modelo: "" });
  };

  const toggleModel = (modelName: string) => {
    let newModels: string[];
    if (selectedModels.includes(modelName)) {
      newModels = selectedModels.filter(m => m !== modelName);
    } else {
      newModels = [...selectedModels, modelName];
    }
    const modelString = newModels.join(",");
    updateFilters({ modelo: modelString });
    applyFilters({ modelo: modelString });
  };

  const clearFilters = () => {
    const freshState = {
      q: "",
      marca: "",
      modelo: "",
      tipo: "",
      minPrice: "",
      maxPrice: "",
      fromYear: "",
      toYear: "",
      minKm: "",
      maxKm: "",
      km: "",
      transmission: "",
      fuel: "",
      ubicacion: "",
      sort: filters.sort,
    };
    setFilters(freshState);
    router.push("/buscar");
    setMobilePanelOpen(false);
  };

  const filteredBrandsForModal = brands.filter(b => 
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredModelsForModal = models.filter(m => 
    m.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const FilterContent = ({ isMobile = false }) => (
    <div className="divide-y divide-neutral-100 flex flex-col">
       {/* Ordenar en Mobile */}
       {isMobile && (
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Ordenar por</h3>
          <select 
            value={filters.sort}
            onChange={(e) => {
              updateFilters({ sort: e.target.value });
              applyFilters({ sort: e.target.value });
            }}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none cursor-pointer"
          >
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="km_asc">Menos kilómetros</option>
          </select>
        </div>
      )}

      {/* Búsqueda rápida */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Búsqueda rápida</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Marca, modelo, palabras..."
            value={filters.q}
            onChange={(e) => updateFilters({ q: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 pl-9 text-sm text-neutral-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
          />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Ubicación */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Ubicación / Ciudad</h3>
        <select 
          value={filters.ubicacion}
          onChange={(e) => {
            updateFilters({ ubicacion: e.target.value });
            applyFilters({ ubicacion: e.target.value });
          }}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none cursor-pointer"
        >
          <option value="">Todo Uruguay</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Tipo de vehículo */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Tipo de vehículo</h3>
        <div className="flex flex-wrap gap-2">
          {["AUTO", "MOTO", "CAMIONETA", "CAMION", "UTILITARIO"].map((t) => (
            <button
              key={t}
              onClick={() => {
                const newTipo = filters.tipo === t ? "" : t;
                updateFilters({ tipo: newTipo });
                applyFilters({ tipo: newTipo });
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.tipo === t
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Marca */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Marcas</h3>
        <div className="flex flex-wrap gap-2">
          {topTenBrands.map((b) => (
            <button
              key={b.id}
              onClick={() => toggleBrand(b.name)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedBrands.includes(b.name)
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              {b.name} <span className="text-[10px] opacity-60 ml-1">({b._count.vehicles})</span>
            </button>
          ))}
          {brands.length > 10 && (
            <button 
              onClick={() => setBrandModalOpen(true)}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-50 transition-colors"
            >
              Mostrar más...
            </button>
          )}
        </div>
      </div>

      {/* Modelo */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Modelos</h3>
        <div className="flex flex-wrap gap-2">
          {topTenModels.map((m) => (
            <button
              key={m.id}
              onClick={() => toggleModel(m.name)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedModels.includes(m.name)
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              {m.name} <span className="text-[10px] opacity-60 ml-1">({m._count.vehicles})</span>
            </button>
          ))}
          {models.length > 10 && (
            <button 
              onClick={() => setModelModalOpen(true)}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-50 transition-colors"
            >
              {selectedBrands.length > 0 ? "Más modelos..." : "Ver todos los modelos..."}
            </button>
          )}
          {models.length === 0 && selectedBrands.length > 0 && (
            <span className="text-xs text-neutral-400 italic">No hay modelos disponibles</span>
          )}
        </div>
      </div>

      {/* Precio */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Precio (U$S)</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Mínimo"
            value={filters.minPrice}
            onChange={(e) => updateFilters({ minPrice: e.target.value })}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 focus:border-primary-400 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Máximo"
            value={filters.maxPrice}
            onChange={(e) => updateFilters({ maxPrice: e.target.value })}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 focus:border-primary-400 focus:outline-none"
          />
          <button 
            onClick={() => applyFilters()}
            className="shrink-0 p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Año */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Año</h3>
        <div className="flex gap-2 items-center">
          <select 
            value={filters.fromYear}
            onChange={(e) => updateFilters({ fromYear: e.target.value })}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-2 text-sm text-neutral-700 focus:border-primary-400 focus:outline-none"
          >
            <option value="">Desde</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select 
            value={filters.toYear}
            onChange={(e) => updateFilters({ toYear: e.target.value })}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-2 text-sm text-neutral-700 focus:border-primary-400 focus:outline-none"
          >
            <option value="">Hasta</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button 
            onClick={() => applyFilters()}
            className="shrink-0 p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Kilómetros */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Kilómetros</h3>
        <div className="flex gap-2 items-center mb-4">
          <input
            type="number"
            placeholder="Desde"
            value={filters.minKm}
            onChange={(e) => updateFilters({ minKm: e.target.value })}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 focus:border-primary-400 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Hasta"
            value={filters.maxKm}
            onChange={(e) => updateFilters({ maxKm: e.target.value })}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 focus:border-primary-400 focus:outline-none"
          />
          <button 
            onClick={() => applyFilters({ km: "" })}
            className="shrink-0 p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {[
            { label: "Todo", value: "" },
            { label: "0km", value: "0" },
            { label: "Hasta 30.000 km", value: "30000" },
            { label: "Hasta 60.000 km", value: "60000" },
            { label: "Hasta 100.000 km", value: "100000" },
            { label: "Más de 100.000 km", value: "100001" },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2.5 cursor-pointer group">
              <input 
                type="radio" 
                name="km" 
                value={opt.value}
                checked={filters.km === opt.value && !filters.minKm && !filters.maxKm}
                onChange={(e) => {
                   updateFilters({ km: e.target.value, minKm: "", maxKm: "" });
                   applyFilters({ km: e.target.value, minKm: "", maxKm: "" });
                }}
                className="accent-primary-600 w-4 h-4 cursor-pointer" 
              />
              <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Transmisión & Combustible (Desktop only / included in mobile panel) */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Transmisión</h3>
        <div className="flex gap-2">
          {["Manual", "Automática", "CVT"].map((t) => (
            <button 
              key={t}
              onClick={() => {
                const newT = filters.transmission === t ? "" : t;
                updateFilters({ transmission: newT });
                applyFilters({ transmission: newT });
              }}
              className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                filters.transmission === t
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Combustible</h3>
        <div className="flex flex-wrap gap-2">
          {["Nafta", "Diesel", "Eléctrico", "Híbrido", "GNC"].map((f) => (
            <button 
              key={f}
              onClick={() => {
                const newF = filters.fuel === f ? "" : f;
                updateFilters({ fuel: newF });
                applyFilters({ fuel: newF });
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.fuel === f
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden sticky top-24">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-800">Filtros Avanzados</h2>
            <button 
              onClick={clearFilters}
              className="text-xs text-primary-600 font-medium hover:text-primary-700"
            >
              Limpiar todo
            </button>
          </div>
          <FilterContent isMobile={false} />
        </div>
      </aside>

      {/* ── Mobile Trigger ────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => setMobilePanelOpen(true)}
          className="flex items-center gap-2.5 rounded-full bg-neutral-900 px-6 py-3.5 text-white shadow-xl hover:scale-105 active:scale-95 transition-all outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55a.75.75 0 01-1.219-.585V11.71a2.25 2.25 0 00-.659-1.59l-4.682-4.683a2.25 2.25 0 01-.659-1.59V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" />
          </svg>
          <span className="font-bold text-sm">Filtros</span>
          {appliedFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[11px] font-bold">
              {appliedFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile Panel (Drawer) ─────────────────────────────────────────── */}
      {mobilePanelOpen && (
        <div className="lg:hidden fixed inset-0 z-[120] flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity animate-in fade-in" 
            onClick={() => setMobilePanelOpen(false)} 
          />
          
          {/* Panel */}
          <div className="relative w-full h-[75vh] bg-white rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-extrabold text-neutral-900">Filtros</h3>
                <span className="text-sm text-neutral-400 font-medium">({appliedFiltersCount} aplicados)</span>
              </div>
              <button 
                onClick={() => setMobilePanelOpen(false)}
                className="p-2 -mr-2 rounded-full bg-neutral-50 text-neutral-500 hover:text-neutral-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto pb-24">
              <FilterContent isMobile={true} />
            </div>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-100 flex gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.05)]">
              <button 
                onClick={clearFilters}
                className="flex-1 py-4 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Limpiar todo
              </button>
              <button 
                onClick={() => setMobilePanelOpen(false)}
                className="flex-[2] py-4 rounded-2xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20 active:scale-[0.98]"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      <Modal 
        isOpen={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        title="Buscar Marcas"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Escribí una marca..."
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {filteredBrandsForModal.map(b => (
              <button
                key={b.id}
                onClick={() => toggleBrand(b.name)}
                className={`flex items-center justify-between text-left rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  selectedBrands.includes(b.name)
                    ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm shadow-primary-100"
                    : "border-neutral-100 bg-white text-neutral-700 hover:border-primary-200 hover:bg-primary-50/30"
                }`}
              >
                <span>{b.name}</span>
                <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-md min-w-[24px] text-center">
                  {b._count.vehicles}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Model Modal */}
      <Modal 
        isOpen={modelModalOpen}
        onClose={() => setModelModalOpen(false)}
        title="Buscar Modelos"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Escribí un modelo..."
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {filteredModelsForModal.map(m => (
              <button
                key={m.id}
                onClick={() => toggleModel(m.name)}
                className={`flex items-center justify-between text-left rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  selectedModels.includes(m.name)
                    ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm shadow-primary-100"
                    : "border-neutral-100 bg-white text-neutral-700 hover:border-primary-200 hover:bg-primary-50/30"
                }`}
              >
                <span>{m.name}</span>
                <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-md min-w-[24px] text-center">
                  {m._count.vehicles}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
