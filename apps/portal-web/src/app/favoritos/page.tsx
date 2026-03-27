import { prisma } from "@autouuy/database";
import { auth } from "@/auth";
import type { Metadata } from "next";
import Link from "next/link";
import VehicleCard from "@/components/VehicleCard";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mis Favoritos | AutoUY",
  description: "Tus vehículos guardados en AutoUY.",
};

export default async function FavoritosPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/favoritos");
  }

  const userId = (session.user as any).id;

  // Fetch favorited vehicles
  const favorites = await prisma.favorite.findMany({
    where: {
      userId: userId,
    },
    include: {
      vehicle: {
        include: {
          brand: true,
          model: true,
          images: {
            where: { isCover: true },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const vehicles = favorites.map(f => f.vehicle);

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
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
          <span className="text-neutral-800 font-medium">Favoritos</span>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-neutral-900 uppercase tracking-tight">
            Mis Favoritos
          </h1>
          <p className="text-neutral-500 font-medium mt-1">
            {vehicles.length === 0 
              ? "Aún no has guardado ningún vehículo." 
              : `Tenés ${vehicles.length} ${vehicles.length === 1 ? 'vehículo guardado' : 'vehículos guardados'}.`}
          </p>
        </div>

        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-neutral-300 shadow-sm">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-800">No hay favoritos todavía</h2>
            <p className="text-neutral-500 mt-2 max-w-sm mx-auto">
              Explora nuestro catálogo y guarda los vehículos que más te gusten para verlos más tarde.
            </p>
            <Link
              href="/buscar"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary-600 px-8 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-all transform active:scale-95 shadow-lg shadow-primary-200"
            >
              Explorar vehículos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
