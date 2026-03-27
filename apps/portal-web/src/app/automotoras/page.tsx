import { prisma } from "@autouuy/database";
import { VehicleStatus } from "@autouuy/database";
import type { Metadata } from "next";
import Link from "next/link";
import DealerCard from "@/components/DealerCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Automotoras — Portal Automotriz Uruguay",
  description: "Encontrá las mejores automotoras en Uruguay. Datos de contacto, ubicación y stock de vehículos.",
};

export default async function AutomotorasPage() {
  const dealers = await prisma.dealerProfile.findMany({
    include: {
      _count: {
        select: { 
          vehicles: { 
            where: { status: VehicleStatus.ACTIVE } 
          } 
        },
      },
    },
    orderBy: { businessName: "asc" },
  });

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      {/* ── HERO / HEADER ─────────────────────────────────────────────────── */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary-950 via-primary-900 to-neutral-900 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        <div className="container-page relative z-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-500/20 border border-primary-400/30 px-4 py-1.5 text-sm font-medium text-primary-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary-400" />
            Red de concesionarios oficiales
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            Automotoras en <span className="bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">Uruguay</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-0 leading-relaxed">
            Descubrí las concesionarias líderes del país. Contactalos directamente y explorá su catálogo de vehículos seleccionados.
          </p>
        </div>
      </section>

      {/* ── BREADCRUMB ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-page py-3 flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-800 transition-colors">Inicio</Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-neutral-300">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
          <span className="text-neutral-800 font-medium">Automotoras</span>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <section className="container-page py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
              Concesionarios Activos
            </h2>
            <p className="text-neutral-500 mt-1">
              Mostrando {dealers.length} automotoras verificadas en la plataforma
            </p>
          </div>
        </div>

        {dealers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {dealers.map((dealer) => (
              <DealerCard
                key={dealer.id}
                id={dealer.id}
                businessName={dealer.businessName}
                logoUrl={dealer.logoUrl}
                phone={dealer.phone}
                whatsapp={dealer.whatsapp}
                address={dealer.address}
                city={dealer.city}
                website={dealer.website}
                verified={dealer.verified}
                vehicleCount={dealer._count.vehicles}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-neutral-300">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H22m-11.14 0c0-3.57 2.898-6.5 6.47-6.5h.06c1.32 0 2.54.4 3.56 1.084V6.25c0-1.104-.894-2-1.998-2H4.373a2 2 0 00-1.998 2V21" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">No hay automotoras registradas</h3>
            <p className="text-neutral-500 mt-1 max-w-sm mx-auto">Actualmente no hay automotoras para mostrar. Volvé pronto para conocer a nuestros nuevos socios profesionales.</p>
          </div>
        )}
      </section>
      
      {/* ── CTA BECOME PARTNER ────────────────────────────────────────────── */}
      <section className="container-page pb-24">
        <div className="bg-primary-600 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden group shadow-2xl shadow-primary-900/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/15 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                ¿Tenés una automotora?
              </h2>
              <p className="text-primary-100 text-lg md:text-xl leading-relaxed">
                Sumate a la red más grande de Uruguay y empezá a vender más hoy mismo. Publicá tu stock completo con herramientas para profesionales.
              </p>
            </div>
            <div className="flex shrink-0">
               <Link 
                href="/publicar" 
                className="bg-white text-primary-600 hover:bg-neutral-50 px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-black/10 hover:shadow-black/20 active:scale-[0.98] hover:-translate-y-1"
               >
                 Registrar mi Automotora
               </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
