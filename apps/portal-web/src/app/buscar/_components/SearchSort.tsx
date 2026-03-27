"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SearchSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "newest";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/buscar?${params.toString()}`);
  };

  return (
    <select 
      value={sort}
      onChange={(e) => handleSortChange(e.target.value)}
      className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none w-full sm:w-auto cursor-pointer"
    >
      <option value="newest">Ordenar: Más recientes</option>
      <option value="price_asc">Precio: menor a mayor</option>
      <option value="price_desc">Precio: mayor a menor</option>
      <option value="km_asc">Menos kilómetros</option>
    </select>
  );
}
