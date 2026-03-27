import { prisma } from "@autouuy/database";
import { VehicleStatus } from "@autouuy/database";
import { notFound } from "next/navigation";
import Link from "next/link";
import VehicleCard from "@/components/VehicleCard";
import { Globe, MapPin, Phone, MessageSquare, ShieldCheck, Mail, Calendar, Info } from "lucide-react";
import type { Metadata } from "next";

interface DealerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DealerPageProps): Promise<Metadata> {
  const { id } = await params;
  const dealer = await prisma.dealerProfile.findUnique({
    where: { id },
  });

  if (!dealer) return { title: "Automotora no encontrada" };

  return {
    title: `${dealer.businessName} — AutoUY`,
    description: dealer.description || `Conocé el stock de vehículos de ${dealer.businessName} en AutoUY.`,
  };
}

export default async function DealerDetailPage({ params }: DealerPageProps) {
  const { id } = await params;

  const dealer = await prisma.dealerProfile.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          email: true,
          createdAt: true,
        },
      },
      vehicles: {
        where: { status: VehicleStatus.ACTIVE },
        orderBy: { createdAt: "desc" },
        include: {
          brand: true,
          images: {
            where: { isCover: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!dealer) {
    notFound();
  }

  const stockCount = dealer.vehicles.length;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* ── BANNER ─────────────────────────────────────────────────────────── */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        {dealer.bannerUrl ? (
          <img
            src={dealer.bannerUrl}
            alt={dealer.businessName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary-950 via-primary-900 to-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent" />
      </div>

      {/* ── PROFILE HEADER ──────────────────────────────────────────────────── */}
      <div className="container-page relative -mt-24 md:-mt-32 z-10">
        <div className="bg-white rounded-[2.5rem] border border-neutral-200 shadow-2xl p-6 md:p-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo */}
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl bg-white border-4 border-white shadow-xl flex items-center justify-center shrink-0 overflow-hidden relative -mt-16 md:-mt-24">
              {dealer.logoUrl ? (
                <img
                  src={dealer.logoUrl}
                  alt={dealer.businessName}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <span className="text-4xl md:text-5xl font-black text-neutral-200">
                  {dealer.businessName.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
                  {dealer.businessName}
                </h1>
                {dealer.verified && (
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-blue-100">
                    <ShieldCheck className="h-4 w-4" />
                    Verificado
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                {dealer.city && (
                  <div className="flex items-center gap-3 text-neutral-600">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Ubicación</p>
                      <p className="font-bold text-sm tracking-tight">{dealer.address || dealer.city}</p>
                    </div>
                  </div>
                )}

                {dealer.phone && (
                  <div className="flex items-center gap-3 text-neutral-600">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Teléfono</p>
                      <p className="font-bold text-sm tracking-tight">{dealer.phone}</p>
                    </div>
                  </div>
                )}

                {dealer.website && (
                  <div className="flex items-center gap-3 text-neutral-600">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Sitio Web</p>
                      <a 
                        href={dealer.website.startsWith('http') ? dealer.website : `https://${dealer.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-bold text-sm tracking-tight text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        {dealer.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-neutral-600">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Miembro desde</p>
                    <p className="font-bold text-sm tracking-tight">
                      {new Date(dealer.createdAt).toLocaleDateString("es-UY", { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-neutral-600">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Stock Actual</p>
                    <p className="font-bold text-sm tracking-tight">{stockCount} vehículos publicados</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                {dealer.whatsapp && (
                  <a
                    href={`https://wa.me/598${dealer.whatsapp.replace(/\s/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all shadow-lg shadow-green-200 active:scale-95"
                  >
                    <MessageSquare className="h-5 w-5 fill-current" />
                    Contactar por WhatsApp
                  </a>
                )}
                <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold transition-all shadow-lg shadow-neutral-200 active:scale-95">
                  <Mail className="h-5 w-5" />
                  Enviar Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT GRID ───────────────────────────────────────────────────── */}
      <div className="container-page mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar / About */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-neutral-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary-600" />
              Sobre nosotros
            </h3>
            {dealer.description ? (
              <p className="text-neutral-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {dealer.description}
              </p>
            ) : (
              <p className="text-neutral-400 italic">
                {dealer.businessName} aún no ha agregado una descripción detallada de su empresa.
              </p>
            )}

            <div className="mt-8 pt-8 border-t border-neutral-100">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4">Departamentos de cobertura</h4>
               <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-bold">{dealer.city || "Uruguay"}</span>
               </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-[2.5rem] border border-neutral-200 overflow-hidden shadow-sm">
            <div className="p-8 pb-4">
              <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-600" />
                Ubicación
              </h3>
            </div>
            <div className="h-64 bg-neutral-100 relative group overflow-hidden">
               {/* Decorative map elements */}
               <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-34.9011,-56.1645&zoom=13&size=600x300&scale=2&style=feature:all|element:labels|visibility:off&style=feature:road|element:geometry|color:0xffffff&style=feature:water|element:geometry|color:0xcedce0&style=feature:landscape|element:geometry|color:0xf5f5f5')] bg-cover opacity-50 grayscale" />
               <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-transparent" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-primary-600/20 rounded-full animate-ping" />
                    <MapPin className="h-10 w-10 text-primary-600 relative fill-white stroke-[2.5px]" />
                  </div>
               </div>
               <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <p className="text-sm font-bold text-neutral-900">{dealer.address}</p>
                  <p className="text-xs text-neutral-500">{dealer.city}, Uruguay</p>
               </div>
            </div>
          </div>
        </div>

        {/* Main Content / Stock */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">
              Nuestro Stock <span className="text-primary-600">({stockCount})</span>
            </h2>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-neutral-400">
               ORDENAR POR:
               <select className="bg-transparent border-none focus:ring-0 text-neutral-900 cursor-pointer">
                  <option>Recientes</option>
                  <option>Menor precio</option>
                  <option>Mayor precio</option>
               </select>
            </div>
          </div>

          {dealer.vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {dealer.vehicles.map((v) => (
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
          ) : (
            <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-neutral-300">
              <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <ShieldCheck className="h-10 w-10 text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 uppercase tracking-tight">Sin stock disponible</h3>
              <p className="text-neutral-500 mt-2 max-w-xs mx-auto text-sm font-medium">
                Esta automotora no tiene vehículos publicados actualmente. Volvé a visitarnos pronto.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
