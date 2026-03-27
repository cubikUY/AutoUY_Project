import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Publicar Vehículo",
  description: "Publicá tu vehículo en AutoUY en pocos pasos.",
};

/**
 * @stitch-screen  e377449176844b71a01e14a64c8087db
 * @stitch-project 16463981372665945842
 * @stitch-title   Publicar Vehículo - Particulares
 */

const STEPS = [
  { n: 1, label: "Datos del vehículo", href: "/publicar" },
  { n: 2, label: "Fotos", href: "/publicar/fotos" },
  { n: 3, label: "Precio y plan", href: "/publicar/precio" },
];

const BRANDS = ["Volkswagen", "Toyota", "Chevrolet", "Ford", "Fiat", "Renault", "Peugeot", "Honda", "Nissan", "Kia", "Hyundai"];

export default function PublicarPage() {
  const currentStep = 1;

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="container-page py-8 max-w-3xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-neutral-900">Publicar mi Vehículo</h1>
          <p className="text-neutral-500 mt-1">Llegá a miles de compradores en Uruguay de forma rápida y gratuita.</p>
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
                  <span className={`text-xs font-medium ${step.n === currentStep ? "text-primary-600" : "text-neutral-400"} hidden sm:block`}>
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

        {/* Form card */}
        <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50">
            <h2 className="font-bold text-neutral-800">Paso 1 — Datos del vehículo</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Completá la información básica de tu vehículo</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Tipo de vehículo *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: "auto", label: "Auto", icon: "🚗" },
                  { value: "moto", label: "Moto", icon: "🏍️" },
                  { value: "camioneta", label: "Camioneta", icon: "🚚" },
                  { value: "camion", label: "Camión", icon: "🚛" },
                ].map((opt) => (
                  <label key={opt.value} className="cursor-pointer">
                    <input type="radio" name="tipo" value={opt.value} className="sr-only peer" />
                    <div className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-4 peer-checked:border-primary-500 peer-checked:bg-primary-50 hover:border-neutral-300 transition-colors">
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="text-sm font-medium text-neutral-700">{opt.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Estado *</label>
              <div className="flex gap-3">
                {[{ value: "0km", label: "0km — Nuevo" }, { value: "usado", label: "Usado" }].map((opt) => (
                  <label key={opt.value} className="flex-1 cursor-pointer">
                    <input type="radio" name="estado" value={opt.value} className="sr-only peer" defaultChecked={opt.value === "usado"} />
                    <div className="flex items-center justify-center rounded-xl border-2 border-neutral-200 bg-neutral-50 p-3 peer-checked:border-primary-500 peer-checked:bg-primary-50 hover:border-neutral-300 transition-colors">
                      <span className="text-sm font-medium text-neutral-700">{opt.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Marca + Modelo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Marca *</label>
                <select className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none">
                  <option value="">Seleccioná una marca</option>
                  {BRANDS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Modelo *</label>
                <input
                  type="text"
                  placeholder="Ej: T-Cross, Gol Trend..."
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Año + Versión */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Año *</label>
                <select className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none">
                  <option value="">Seleccioná el año</option>
                  {Array.from({ length: 15 }, (_, i) => 2024 - i).map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Versión</label>
                <input
                  type="text"
                  placeholder="Ej: Highline AT6"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Km */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Kilómetros *</label>
              <input
                type="number"
                placeholder="Ej: 45000"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
              />
              <p className="text-xs text-neutral-400 mt-1">Ingresá 0 si es 0km</p>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Descripción adicional</label>
              <textarea
                rows={4}
                placeholder="Contá detalles sobre el estado, equipamiento, historial de mantenimiento..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
            <p className="text-xs text-neutral-400">* Campos obligatorios</p>
            <Link
              href="/publicar/fotos"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 px-6 py-3 text-sm font-bold text-white transition-colors"
            >
              Siguiente
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
