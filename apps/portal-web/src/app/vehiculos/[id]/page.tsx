import { prisma } from "@autouuy/database";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface VehiclePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: VehiclePageProps): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      images: {
        where: { isCover: true },
        take: 1,
      },
    },
  });

  if (!vehicle) return { title: "Vehículo no encontrado" };

  const priceFormatted = `${vehicle.currency === "USD" ? "U$S" : "$"} ${Number(
    vehicle.price
  ).toLocaleString("es-UY")}`;
  const description = `Venta de ${vehicle.title} en Uruguay. Precio: ${priceFormatted}. Año ${vehicle.year}, ${vehicle.mileage.toLocaleString("es-UY")} km. Encontrá más detalles en AutoUY.`;
  const imageUrl = vehicle.images[0]?.url || "/logo-og.png"; // Fallback to a default OG image

  return {
    title: `${vehicle.title} | AutoUY Uruguay`,
    description,
    openGraph: {
      title: vehicle.title,
      description,
      type: "website",
      url: `https://autouy.com.uy/vehiculos/${id}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: vehicle.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: vehicle.title,
      description,
      images: [imageUrl],
    },
  };
}

const SPECS = [
  { label: "Combustible", value: "Nafta" },
  { label: "Transmisión", value: "MT / AT6" },
  { label: "Motor", value: "1.0 TSI Turbo" },
  { label: "Seguridad", value: "5 Estrellas NCAP" },
  { label: "Potencia", value: "116 CV" },
  { label: "Velocidad máx.", value: "195 km/h" },
];

const DEALERS = [
  { name: "Lestido", badge: "Concesionario Oficial", verified: true },
  { name: "Werba Automotores", badge: "Concesionario", verified: true },
  { name: "Sevel Maldonado", badge: "Revendedor", verified: false },
  { name: "Alfacar Motors", badge: "Revendedor", verified: false },
];

const TECH_SPECS = {
  "Motor y Performance": [
    { label: "Cilindrada", value: "999 cc" },
    { label: "Potencia máxima", value: "116 CV @ 5.000 rpm" },
    { label: "Torque", value: "200 Nm @ 2.000 rpm" },
    { label: "Velocidad máxima", value: "195 km/h" },
    { label: "0-100 km/h", value: "10.2 s" },
    { label: "Consumo mixto", value: "6.8 L/100km" },
  ],
  "Confort y Tecnología": [
    { label: "Pantalla central", value: '10" táctil' },
    { label: "Cámara de reversa", value: "Sí" },
    { label: "Sensores de estacionamiento", value: "Traseros" },
    { label: "Climatizador", value: "Manual / Automático" },
    { label: "Asientos", value: "Tela / Cuero (Highline)" },
    { label: "Conectividad", value: "Apple CarPlay / Android Auto" },
  ],
  Seguridad: [
    { label: "Clasificación NCAP", value: "5 estrellas" },
    { label: "Airbags", value: "6" },
    { label: "ABS + EBD", value: "Sí" },
    { label: "Control de estabilidad (ESC)", value: "Sí" },
    { label: "Asistente de arranque en pendiente", value: "Sí" },
    { label: "Alerta de colisión frontal", value: "Sí (Highline)" },
  ],
  Dimensiones: [
    { label: "Longitud", value: "4.263 mm" },
    { label: "Ancho", value: "1.757 mm" },
    { label: "Alto", value: "1.578 mm" },
    { label: "Distancia entre ejes", value: "2.651 mm" },
    { label: "Capacidad de baúl", value: "373 L" },
    { label: "Peso", value: "1.186 kg" },
  ],
};

const IMAGES = [
  "/placeholder-car-1.jpg",
  "/placeholder-car-2.jpg",
  "/placeholder-car-3.jpg",
  "/placeholder-car-4.jpg"
];

import { auth } from "@/auth";

import VehicleGallery from "@/components/VehicleGallery";
import VehicleContactActions from "@/components/VehicleContactActions";
import RecentViewTracker from "@/components/RecentViewTracker";
import RecentlyViewed from "@/components/RecentlyViewed";

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { id } = await params;
  const session = await auth();

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      brand: true,
      images: {
        orderBy: { position: "asc" }
      },
      dealer: true,
      branch: true,
      owner: true
    }
  });

  if (!vehicle) {
    notFound();
  }

  // Check if this vehicle is favorited by the current user
  const isFavorite = session?.user?.id 
    ? await prisma.favorite.findUnique({
        where: {
          userId_vehicleId: {
            userId: (session.user as any).id,
            vehicleId: id
          }
        }
      })
    : false;

  const specs = [
    { label: "Combustible", value: vehicle.fuelType || "No especificado" },
    { label: "Transmisión", value: vehicle.transmission || "No especificada" },
    { label: "Kilómetros", value: vehicle.mileage === 0 ? "0 km" : `${vehicle.mileage.toLocaleString("es-UY")} km` },
    { label: "Año", value: vehicle.year },
    { label: "Motor", value: vehicle.engineSize || "N/A" },
    { label: "Color", value: vehicle.color || "N/A" }
  ];

  // Logic to determine contact phone number: branch whatsapp > dealer whatsapp > branch phone > dealer phone > owner phone
  const contactPhone = 
    vehicle.branch?.whatsapp || 
    vehicle.dealer?.whatsapp || 
    vehicle.branch?.phone || 
    vehicle.dealer?.phone || 
    vehicle.owner?.phone || "";

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-page py-3.5 flex items-center gap-1.5 text-sm text-neutral-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-neutral-800 transition-colors">Home</Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-neutral-300 shrink-0">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
          <Link href="/buscar" className="hover:text-neutral-800 transition-colors">{vehicle.vehicleType === "AUTO" ? "Autos" : "Otros"}</Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-neutral-300 shrink-0">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
          <span className="text-neutral-800 font-medium">{vehicle.title}</span>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Content (Gallery + Basic Specs) ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Component */}
            <VehicleGallery images={vehicle.images} title={vehicle.title} />

            {/* Main Header Info Area */}
            <div className="rounded-2xl bg-white border border-neutral-200 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold leading-none mb-4 ${
                    vehicle.mileage === 0 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-primary-50 border-primary-200 text-primary-700"
                  }`}>
                    {vehicle.mileage === 0 ? "0 KM — Nuevo" : "Usado"}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black text-neutral-900 mb-2 uppercase tracking-tight">
                    {vehicle.title}
                  </h1>
                  <p className="text-lg text-neutral-500 font-medium">
                    {vehicle.brand.name} • {vehicle.year}
                  </p>
                </div>
                
                {/* Mobile/Tablet Price (visible only on smaller screens) */}
                <div className="lg:hidden">
                   <p className="text-3xl font-black text-primary-600">
                    {vehicle.currency === "USD" ? "U$S" : "$"} {Number(vehicle.price).toLocaleString("es-UY")}
                  </p>
                </div>
              </div>

              {vehicle.description && (
                <div className="mt-8 pt-8 border-t border-neutral-100">
                  <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">Descripción</h3>
                  <p className="text-neutral-600 leading-loose whitespace-pre-wrap">
                    {vehicle.description}
                  </p>
                </div>
              )}

              {/* Specs Grid */}
              <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
                {specs.map(({ label, value }) => (
                  <div key={label} className="rounded-2xl bg-neutral-50 border border-neutral-100 p-5 group hover:bg-neutral-100 transition-colors">
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1.5">{label}</p>
                    <p className="text-base font-bold text-neutral-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Legal Info */}
            <div className="px-6 py-4 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-orange-500 shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-orange-800 leading-relaxed font-medium">
                Las imágenes son meramente ilustrativas. Los precios y el stock son responsabilidad exclusiva de cada vendedor.
                AutoUY recomienda verificar el estado y documentación del vehículo personalmente antes de cualquier transacción.
              </p>
            </div>
          </div>

          {/* ── Right Column: Actions & Seller info ────────────────────────────────────── */}
          <aside className="space-y-6">
            {/* Action Card (Price + Contact) */}
            <div className="rounded-3xl bg-white border border-neutral-200 overflow-hidden shadow-xl sticky top-24">
              <div className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-black px-8 py-7">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-2">
                  Precio final {vehicle.mileage === 0 ? "de lista" : ""}
                </p>
                <p className="text-5xl font-black text-white">
                  <span className="text-2xl font-medium text-neutral-400 mr-2">{vehicle.currency === "USD" ? "U$S" : "$"}</span>
                  {Number(vehicle.price).toLocaleString("es-UY")}
                </p>
              </div>
              
              <div className="px-8 py-7">
                {/* Client Side Contact & Share Actions */}
                <VehicleContactActions 
                  phone={contactPhone} 
                  title={vehicle.title} 
                  vehicleId={vehicle.id}
                  price={Number(vehicle.price)}
                  currency={vehicle.currency}
                  image={vehicle.images.find(img => img.isCover)?.url}
                  initialIsFavorite={!!isFavorite}
                  isLoggedIn={!!session?.user}
                />
              </div>
            </div>

            {/* Seller Info Detailed Card */}
            {vehicle.dealer && (
              <div className="rounded-3xl bg-white border border-neutral-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
                  <h2 className="font-bold text-neutral-900 text-sm uppercase tracking-widest">Vendedor Autorizado</h2>
                </div>
                <div className="p-7 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center mb-4 border border-primary-100 shadow-inner">
                    <span className="text-3xl font-black text-primary-600">
                      {vehicle.dealer.businessName ? vehicle.dealer.businessName[0] : "?"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">{vehicle.dealer.businessName}</h3>
                  {vehicle.branch && (
                    <p className="text-sm font-bold text-primary-600 mt-1">Sucursal: {vehicle.branch.name}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2 text-neutral-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M9.69 18.933l.003.001C10.518 19.467 11.5 18.89 11.5 18v-5.07a3.001 3.001 0 00-2.3-3.793l-.403-1.61a1 1 0 011.815-.658l1.45 2.176c.414.622 1.258.749 1.83.27a1.5 1.5 0 00.32-2.14l-1.3-1.95A10.02 10.02 0 0010 1.25c-5.523 0-10 4.477-10 10 0 2.227.728 4.28 1.96 5.922a1 1 0 001.036.002z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">{vehicle.branch?.city || vehicle.dealer.city || "Uruguay"}</p>
                  </div>
                  
                  {vehicle.branch?.address && (
                    <p className="text-xs text-neutral-400 mt-1 font-medium italic">{vehicle.branch.address}</p>
                  )}
                  
                  <div className="mt-8 pt-6 border-t border-neutral-100 w-full">
                    <Link 
                      href={`/automotoras/${vehicle.dealer.id}`}
                      className="group inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Ver inventario completo
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l4.158-3.92H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Tracker (Invisible) */}
      <RecentViewTracker 
        vehicle={{
          id: vehicle.id,
          title: vehicle.title,
          price: Number(vehicle.price),
          currency: vehicle.currency,
          image: vehicle.images.find(img => img.isCover)?.url || vehicle.images[0]?.url,
          brandName: vehicle.brand.name,
          year: vehicle.year,
          mileage: vehicle.mileage
        }}
      />

      {/* Recently Viewed Section */}
      <div className="mt-12">
        <RecentlyViewed />
      </div>
    </div>
  );
}
