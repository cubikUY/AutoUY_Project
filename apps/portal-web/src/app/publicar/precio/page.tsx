import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Precio y Plan de Publicación",
  description: "Elegí el plan de publicación para tu vehículo en AutoUY.",
};

/**
 * @stitch-screen  bba614253119429f970c3c86be35137e
 * @stitch-project 16463981372665945842
 * @stitch-title   Publicar Vehículo - Paso 3: Precio y Planes
 */

const STEPS = [
  { n: 1, label: "Datos del vehículo", href: "/publicar" },
  { n: 2, label: "Fotos", href: "/publicar/fotos" },
  { n: 3, label: "Precio y plan", href: "/publicar/precio" },
];

const PLANS = [
  {
    id: "basico",
    name: "Básico",
    price: "Gratis",
    priceNote: "Para siempre",
    color: "neutral",
    features: ["7 días de publicación", "3 fotos", "Aparece en búsquedas", "Contacto por email"],
    notIncluded: ["Destacado en resultados", "WhatsApp directo", "Estadísticas premium"],
    cta: "Elegir Básico",
  },
  {
    id: "destacado",
    name: "Destacado",
    price: "U$S 9",
    priceNote: "por publicación",
    color: "primary",
    popular: true,
    features: ["30 días de publicación", "20 fotos", "Destacado en resultados", "WhatsApp directo", "Estadísticas básicas"],
    notIncluded: ["Posición premium", "Renovación automática"],
    cta: "Elegir Destacado",
  },
  {
    id: "premium",
    name: "Premium",
    price: "U$S 19",
    priceNote: "por publicación",
    color: "gradient",
    features: ["60 días de publicación", "20 fotos", "Posición premium", "WhatsApp directo", "Estadísticas completas", "Renovación automática", "Soporte prioritario"],
    notIncluded: [],
    cta: "Elegir Premium",
  },
];

export default function PublicarPrecioPage() {
  const currentStep = 3;

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="container-page py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-neutral-900">Precio y Plan de Publicación</h1>
          <p className="text-neutral-500 mt-1">Elegí cómo querés publicar tu vehículo</p>
        </div>

        {/* Stepper */}
        <div className="rounded-2xl bg-white border border-neutral-200 p-5 mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step.n} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    step.n === currentStep
                      ? "border-primary-600 bg-primary-600 text-white"
                      : step.n < currentStep
                      ? "border-primary-600 bg-primary-50 text-primary-600"
                      : "border-neutral-300 bg-white text-neutral-400"
                  }`}>
                    {step.n < currentStep ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    ) : step.n}
                  </div>
                  <span className={`text-xs font-medium ${step.n === currentStep ? "text-primary-600" : step.n < currentStep ? "text-primary-500" : "text-neutral-400"} hidden sm:block`}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded-full transition-colors ${
                    step.n < currentStep ? "bg-primary-400" : "bg-neutral-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Price + Plans */}
          <div className="lg:col-span-2 space-y-5">
            {/* Price input */}
            <div className="rounded-2xl bg-white border border-neutral-200 p-6">
              <h2 className="font-bold text-neutral-800 mb-4">Precio del vehículo</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden flex-1 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
                  <span className="px-4 py-3 bg-neutral-100 border-r border-neutral-200 text-sm font-semibold text-neutral-600">U$S</span>
                  <input
                    type="number"
                    placeholder="29.990"
                    className="flex-1 px-4 py-3 text-sm text-neutral-800 bg-transparent border-0 focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
                <select className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none">
                  <option>USD</option>
                  <option>UYU</option>
                </select>
              </div>
              <label className="flex items-center gap-2.5 mt-3 cursor-pointer">
                <input type="checkbox" className="rounded accent-primary-600 w-4 h-4" />
                <span className="text-sm text-neutral-600">Precio negociable</span>
              </label>
            </div>

            {/* Plans */}
            <div className="rounded-2xl bg-white border border-neutral-200 p-6">
              <h2 className="font-bold text-neutral-800 mb-5">Elegí tu plan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <label key={plan.id} className="cursor-pointer relative">
                    <input type="radio" name="plan" value={plan.id} className="sr-only peer" defaultChecked={plan.id === "destacado"} />
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-0.5 text-[10px] font-bold text-white z-10 whitespace-nowrap">
                        MÁS POPULAR
                      </span>
                    )}
                    <div className={`rounded-2xl border-2 p-5 h-full transition-all peer-checked:border-primary-500 peer-checked:shadow-md peer-checked:shadow-primary-100 hover:border-neutral-300 ${
                      plan.popular ? "border-primary-300 bg-primary-50/50" : "border-neutral-200 bg-white"
                    } ${plan.color === "gradient" ? "relative overflow-hidden" : ""}`}>
                      <p className="font-bold text-neutral-800 text-base">{plan.name}</p>
                      <p className="text-2xl font-extrabold text-neutral-900 mt-1">{plan.price}</p>
                      <p className="text-xs text-neutral-400">{plan.priceNote}</p>
                      <div className="mt-4 space-y-2">
                        {plan.features.map((f) => (
                          <div key={f} className="flex items-start gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-neutral-600">{f}</span>
                          </div>
                        ))}
                        {plan.notIncluded.map((f) => (
                          <div key={f} className="flex items-start gap-1.5 opacity-40">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5">
                              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                            <span className="text-xs text-neutral-500">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <aside className="space-y-5">
            <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden sticky top-24">
              <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50">
                <h2 className="font-bold text-neutral-800 text-sm">Resumen de publicación</h2>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Vehículo</span>
                  <span className="font-semibold text-neutral-800">VW T-Cross 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Año</span>
                  <span className="font-semibold text-neutral-800">2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Estado</span>
                  <span className="font-semibold text-neutral-800">0km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Fotos</span>
                  <span className="font-semibold text-neutral-800">3 fotos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Plan</span>
                  <span className="font-semibold text-primary-600">Destacado</span>
                </div>
                <div className="border-t border-neutral-100 pt-3 flex justify-between">
                  <span className="font-semibold text-neutral-800">Precio vehículo</span>
                  <span className="font-bold text-neutral-900">U$S —</span>
                </div>
              </div>
              <div className="px-5 pb-5 space-y-3">
                <button className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 px-4 py-4 text-sm font-bold text-white transition-colors shadow-md shadow-primary-200">
                  ✓ Publicar mi vehículo
                </button>
                <Link
                  href="/publicar/fotos"
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 py-3 text-sm font-medium text-neutral-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                  </svg>
                  Volver a fotos
                </Link>
                <p className="text-xs text-neutral-400 text-center leading-relaxed">
                  Al publicar aceptás los{" "}
                  <Link href="/terminos" className="text-primary-600 hover:text-primary-700">Términos y Condiciones</Link>{" "}
                  de AutoUY.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
