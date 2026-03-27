import { prisma, VehicleStatus, Prisma, VehicleType } from "@autouuy/database";
import type { Metadata } from "next";
import Link from "next/link";
import VehicleCard from "@/components/VehicleCard";
import SearchFilters from "./_components/SearchFilters";
import SearchSort from "./_components/SearchSort";
import SearchPagination from "./_components/SearchPagination";

export const metadata: Metadata = {
  title: "Buscar Vehículos | AutoUY",
  description:
    "Buscá y filtrá autos, motos y camiones en AutoUY. Filtros avanzados por marca, modelo, año, precio y más.",
};

interface BuscarPageProps {
  searchParams: Promise<{
    q?: string;
    marca?: string; // Multiple brands separated by comma
    modelo?: string; // Multiple models separated by comma
    tipo?: string;
    minPrice?: string;
    maxPrice?: string;
    fromYear?: string;
    toYear?: string;
    ubicacion?: string;
    minKm?: string;
    maxKm?: string;
    km?: string; // Standard mileage filter
    transmission?: string;
    fuel?: string;
    sort?: string;
    page?: string;
    automotora?: string;
  }>;
}

const ITEMS_PER_PAGE = 12;

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Selected brands and models as arrays
  const selectedBrands = params.marca ? params.marca.split(",") : [];
  const selectedModels = params.modelo ? params.modelo.split(",") : [];

  // Fetch brands with counts for the sidebar
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { 
          vehicles: { 
            where: { status: VehicleStatus.ACTIVE } 
          } 
        }
      }
    },
    orderBy: {
      vehicles: {
        _count: "desc"
      }
    }
  });

  // Fetch models for the selected brands (or top models overall if no brand selected)
  const models = await prisma.model.findMany({
    where: selectedBrands.length > 0 
      ? { brand: { name: { in: selectedBrands } } }
      : {},
    include: {
        _count: {
          select: { 
            vehicles: { 
              where: { status: VehicleStatus.ACTIVE } 
            } 
          }
        }
      },
    orderBy: {
      vehicles: {
        _count: "desc"
      }
    },
    take: selectedBrands.length > 0 ? 100 : 20, // Limit models if no brands selected
  });

  // Fetch active cities (from branches and dealers)
  const [branchCities, dealerCities] = await Promise.all([
    prisma.branch.findMany({
      where: { isActive: true, vehicles: { some: { status: VehicleStatus.ACTIVE } } },
      select: { city: true },
      distinct: ["city"],
    }),
    prisma.dealerProfile.findMany({
      where: { vehicles: { some: { status: VehicleStatus.ACTIVE, branchId: null } } },
      select: { city: true },
      distinct: ["city"],
    })
  ]);
  
  const cities = Array.from(new Set([
    ...branchCities.map(c => c.city),
    ...dealerCities.map(c => c.city)
  ])).filter(Boolean).sort() as string[];

  // Build filters
  const where: Prisma.VehicleWhereInput = {
    status: VehicleStatus.ACTIVE,
  };

  // Text search
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
      { brand: { name: { contains: params.q, mode: "insensitive" } } },
      { model: { name: { contains: params.q, mode: "insensitive" } } },
    ];
  }

  // Multi-select filters
  if (selectedBrands.length > 0) {
    where.brand = { name: { in: selectedBrands } };
  }

  if (selectedModels.length > 0) {
    where.model = { name: { in: selectedModels } };
  }

  if (params.tipo) {
    where.vehicleType = params.tipo.toUpperCase() as VehicleType;
  }

  if (params.automotora) {
    where.dealerId = params.automotora;
  }

  if (params.ubicacion) {
    where.OR = [
      ...(where.OR as any[] || []),
      { branch: { city: { equals: params.ubicacion, mode: "insensitive" } } },
      { 
        AND: [
          { branchId: null },
          { dealer: { city: { equals: params.ubicacion, mode: "insensitive" } } }
        ]
      }
    ];
  }

  // Price range
  const pMin = params.minPrice ? Number(params.minPrice) : null;
  const pMax = params.maxPrice ? Number(params.maxPrice) : null;
  if (pMin !== null || pMax !== null) {
    where.price = {
      ...(pMin !== null && !isNaN(pMin) && { gte: pMin }),
      ...(pMax !== null && !isNaN(pMax) && { lte: pMax }),
    };
  }

  // Year range
  const yFrom = params.fromYear ? Number(params.fromYear) : null;
  const yTo = params.toYear ? Number(params.toYear) : null;
  if (yFrom !== null || yTo !== null) {
    where.year = {
      ...(yFrom !== null && !isNaN(yFrom) && { gte: yFrom }),
      ...(yTo !== null && !isNaN(yTo) && { lte: yTo }),
    };
  }

  // Mileage
  const kMin = params.minKm ? Number(params.minKm) : null;
  const kMax = params.maxKm ? Number(params.maxKm) : null;
  if (kMin !== null || kMax !== null) {
    where.mileage = {
      ...(kMin !== null && !isNaN(kMin) && { gte: kMin }),
      ...(kMax !== null && !isNaN(kMax) && { lte: kMax }),
    };
  } else if (params.km && params.km !== "") {
    const kmVal = Number(params.km);
    if (!isNaN(kmVal)) {
      if (kmVal === 0) {
        where.mileage = 0;
        where.condition = "NEW";
      } else if (kmVal === 100001) {
        where.mileage = { gt: 100000 };
      } else {
        where.mileage = { lte: kmVal };
      }
    }
  }

  // Transmission & Fuel
  if (params.transmission) {
    where.transmission = { equals: params.transmission, mode: "insensitive" };
  }
  if (params.fuel) {
    where.fuelType = { equals: params.fuel, mode: "insensitive" };
  }

  // Sorting
  let orderBy: Prisma.VehicleOrderByWithRelationInput | Prisma.VehicleOrderByWithRelationInput[] = [
    { isFeatured: "desc" },
    { createdAt: "desc" }
  ];
  if (params.sort === "price_asc") orderBy = [{ isFeatured: "desc" }, { price: "asc" }];
  if (params.sort === "price_desc") orderBy = [{ isFeatured: "desc" }, { price: "desc" }];
  if (params.sort === "km_asc") orderBy = [{ isFeatured: "desc" }, { mileage: "asc" }];

  // Fetch vehicles with count
  const [vehicles, totalCount] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        brand: true,
        model: true,
        images: {
          where: { isCover: true },
          take: 1,
        },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Helper for active filter chips
  const filterLabelMap: Record<string, string> = {
    q: "Búsqueda", marca: "Marca", modelo: "Modelo", tipo: "Tipo",
    minPrice: "Precio mín", maxPrice: "Precio máx",
    fromYear: "Año desde", toYear: "Año hasta",
    minKm: "Km desde", maxKm: "Km hasta",
    km: "Recorrido", transmission: "Transmisión", fuel: "Combustible",
    ubicacion: "Ubicación",
  };

  const activeFilters = Object.entries(params)
    .filter(([key, value]) => value && !["sort", "page", "automotora"].includes(key))
    .map(([key, value]) => {
      let displayValue = value;
      if (key === "km") {
        if (value === "0") displayValue = "0km / Nuevo";
        else if (value === "100001") displayValue = "> 100.000km";
        else displayValue = `< ${Number(value).toLocaleString()}km`;
      }
      return { key, label: filterLabelMap[key] || key, value: displayValue };
    });

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-page py-3 flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-800 transition-colors">
            Inicio
          </Link>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-neutral-300"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-neutral-800 font-medium">Autos</span>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Pro tip banner */}
        <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 mb-6 flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-primary-500 shrink-0 mt-0.5"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-primary-700">
            <strong>Pro Tip:</strong> Usá el buscador para encontrar exactamente lo que necesitás.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar filters ──────────────────────────────────────────────── */}
          <SearchFilters brands={brands} models={models} cities={cities} />

          {/* ── Results ─────────────────────────────────────────────────────── */}
          <section className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {params.q ? `Resultados para "${params.q}"` : "Vehículos en Uruguay"}
                </h1>
                <p className="text-neutral-500 text-sm mt-0.5">
                  Mostrando {vehicles.length} de {totalCount} vehículos encontrados
                </p>
              </div>
              <div className="hidden sm:block">
                <SearchSort />
              </div>
            </div>

            {/* Active filters chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {activeFilters.map((f) => (
                    <span
                      key={f.key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-xs font-medium text-primary-700"
                    >
                      <span className="opacity-60">{f.label}:</span> {f.value}
                      <Link
                        href={`/buscar?${new URLSearchParams(
                          Object.fromEntries(
                            Object.entries(params).filter(([k]) => k !== f.key)
                          ) as any
                        ).toString()}`}
                        className="ml-0.5 hover:text-primary-900 transition-colors"
                      >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </Link>
                  </span>
                ))}
                <Link
                  href="/buscar"
                  className="text-xs text-neutral-500 hover:text-primary-600 self-center ml-2"
                >
                  Limpiar todo
                </Link>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  id={v.id}
                  title={v.title}
                  price={Number(v.price)}
                  currency={v.currency as any}
                  km={v.mileage}
                  imageUrl={v.images[0]?.url}
                  fuel={v.fuelType || ""}
                  transmission={v.transmission || ""}
                  isFeatured={v.isFeatured}
                />
              ))}
              {vehicles.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-neutral-300">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8 text-neutral-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196 7.5 7.5 0 0010.607 10.607Z"
                      />
                    </svg>
                  </div>
                  <p className="text-neutral-500 font-medium">
                    No se encontraron vehículos con esos filtros.
                  </p>
                  <p className="text-neutral-400 text-sm mt-1">
                    Intentá removiendo algunos filtros o buscando algo más general.
                  </p>
                  <Link
                    href="/buscar"
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
                  >
                    Borrar filtros
                  </Link>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && <SearchPagination totalPages={totalPages} />}
          </section>
        </div>
      </div>
    </div>
  );
}

