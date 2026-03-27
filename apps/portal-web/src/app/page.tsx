import { prisma, VehicleStatus } from "@autouuy/database";
import type { Metadata } from "next";
import Link from "next/link";
import VehicleCard from "@/components/VehicleCard";
import HomeSearch from "@/components/HomeSearch";
import RecentlyViewed from "@/components/RecentlyViewed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home — Portal Automotriz Uruguay",
  description:
    "Encontrá tu próximo vehículo en AutoUY. Autos, motos y camiones de automotoras y particulares.",
};

export default async function HomePage() {
  // Fetch real data
  const brands = await prisma.brand.findMany({
    where: { 
      isActive: true,
    },
    take: 16, // Show more brands if available
    orderBy: [
      { isFeatured: "desc" },
      { name: "asc" }
    ],
  });

  const promotedVehicles = await prisma.vehicle.findMany({
    where: { 
      isFeatured: true, 
      status: VehicleStatus.ACTIVE 
    },
    take: 4,
    // When Prisma client regenerates, isFeatured will be recognized.
    orderBy: { createdAt: "desc" },
    include: {
      brand: true,
      images: {
        take: 1,
        orderBy: { isCover: "desc" }
      }
    }
  });

  const recentUsed = await prisma.vehicle.findMany({
    where: { 
      mileage: { gt: 0 }, 
      status: VehicleStatus.ACTIVE 
    },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      brand: true,
      images: {
        take: 1,
        orderBy: { isCover: "desc" }
      }
    }
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

  const brandsForDisplay = brands.map(b => ({
    name: b.name,
    slug: b.name.toLowerCase(),
    initial: b.name.substring(0, 1).toUpperCase(),
    logoUrl: b.logoUrl
  }));
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[72vh] flex-col items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-neutral-900" />
        {/* Decorative blobs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl" />

        <div className="relative container-page pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-500/20 border border-primary-400/30 px-4 py-1.5 text-sm font-medium text-primary-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            +12.000 vehículos publicados
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Encontrá tu próximo<br />
            <span className="bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
              vehículo en Uruguay
            </span>
          </h1>
          <p className="text-xl text-neutral-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Autos, motos y camiones de las mejores automotoras y particulares, al mejor precio.
          </p>

          {/* Search bar */}
          <HomeSearch brands={brands} cities={cities} />

          {/* Quick filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              { label: "Autos usados", href: "/buscar?tipo=AUTO&km=30000" },
              { label: "0km", href: "/buscar?km=0" },
              { label: "SUVs", href: "/buscar?tipo=CAMIONETA" },
              { label: "Motos", href: "/buscar?tipo=MOTO" },
              { label: "Menos de U$S 10.000", href: "/buscar?maxPrice=10000" },
              { label: "Alta Gama", href: "/buscar?minPrice=40000" },
            ].map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-1.5 text-sm text-white/80 hover:text-white transition-colors"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative w-full border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="container-page py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { value: "12.000+", label: "Vehículos" },
              { value: "450+", label: "Automotoras" },
              { value: "19", label: "Departamentos" },
              { value: "100%", label: "Seguro" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-neutral-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS ──────────────────────────────────────────────────────────── */}
      {brandsForDisplay.length > 0 && (
        <section className="py-14 bg-white">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Marcas destacadas</h2>
            <Link href="/buscar" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Ver todas
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {brandsForDisplay.map((brand) => (
              <Link
                key={brand.slug}
                href={`/buscar?marca=${brand.slug}`}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-2xl border-2 border-neutral-100 bg-neutral-50 flex items-center justify-center text-lg font-bold text-neutral-500 group-hover:border-primary-200 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all overflow-hidden p-2">
                  {brand.logoUrl ? (
                    <img 
                      src={brand.logoUrl} 
                      alt={brand.name} 
                      className="w-full h-full object-contain filter group-hover:brightness-110 transition-all"
                    />
                  ) : (
                    brand.initial
                  )}
                </div>
                <span className="text-xs text-neutral-600 group-hover:text-primary-600 font-medium transition-colors text-center">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── VEHÍCULOS PROMOCIONADOS ──────────────────────────────────────────────────── */}
      {promotedVehicles.length > 0 && (
        <section className="py-14 bg-amber-50/50">
          <div className="container-page">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-500">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                  Vehículos Promocionados
                </h2>
                <p className="text-neutral-500 text-sm mt-1">Oportunidades únicas de nuestras automotoras de confianza</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {promotedVehicles.map((v) => (
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
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── USADOS RECIENTES ─────────────────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Usados Recientes</h2>
              <p className="text-neutral-500 text-sm mt-1">Publicaciones recientes de particulares y automotoras</p>
            </div>
            <Link href="/buscar" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Ver todos
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentUsed.map((v) => (
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
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA VENDER ───────────────────────────────────────────────────────── */}
      <section className="py-14 bg-gradient-to-br from-primary-950 via-primary-900 to-neutral-900">
        <div className="container-page">
          <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm p-10 md:p-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Querés vender tu auto?
            </h2>
            <p className="text-lg text-neutral-300 mb-8 leading-relaxed">
              Publicá tu vehículo gratis y llegá a miles de compradores en Uruguay. Rápido, fácil y seguro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/publicar"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 px-8 py-4 text-base font-bold text-white transition-colors shadow-lg shadow-primary-900/40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Publicar gratis
              </Link>
              <Link
                href="/buscar"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-8 py-4 text-base font-medium text-white transition-colors"
              >
                Ver planes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── RECIENTEMENTE VISTOS ─────────────────────────────────────────────── */}
      <RecentlyViewed />
    </>
  );
}
