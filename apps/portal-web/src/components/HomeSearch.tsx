"use client";

import { Brand } from "@autouuy/database";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface HomeSearchProps {
  brands: Brand[];
  cities: string[];
}

export default function HomeSearch({ brands, cities }: HomeSearchProps) {
  const router = useRouter();
  const [tipo, setTipo] = useState("");
  const [marca, setMarca] = useState("");
  const [year, setYear] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (tipo) params.set("tipo", tipo);
    if (marca) params.set("marca", marca);
    if (year) params.set("fromYear", year);
    if (ubicacion) params.set("ubicacion", ubicacion);
    
    router.push(`/buscar?${params.toString()}`);
  };

  const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 max-w-3xl mx-auto shadow-2xl">
      <div className="flex flex-col sm:flex-row gap-2">
        <select 
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="flex-1 rounded-xl bg-white text-neutral-800 px-4 py-3.5 text-sm font-medium border-0 focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer"
        >
          <option value="">Tipo de vehículo</option>
          <option value="AUTO">Auto</option>
          <option value="MOTO">Moto</option>
          <option value="CAMIONETA">Camioneta</option>
          <option value="CAMION">Camión</option>
          <option value="UTILITARIO">Utilitario</option>
        </select>
        
        <select 
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          className="flex-1 rounded-xl bg-white text-neutral-800 px-4 py-3.5 text-sm font-medium border-0 focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer"
        >
          <option value="">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b.id} value={b.name}>{b.name}</option>
          ))}
        </select>

        <select 
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="flex-1 rounded-xl bg-white text-neutral-800 px-4 py-3.5 text-sm font-medium border-0 focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer"
        >
          <option value="">Desde año</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select 
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          className="flex-1 rounded-xl bg-white text-neutral-800 px-4 py-3.5 text-sm font-medium border-0 focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer"
        >
          <option value="">Todo Uruguay</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-8 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-primary-900/40 whitespace-nowrap group hover:scale-[1.02]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          Buscar
        </button>
      </div>
    </div>
  );
}
