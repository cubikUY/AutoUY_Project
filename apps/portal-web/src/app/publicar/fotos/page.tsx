import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Subir Fotos del Vehículo",
  description: "Cargá fotos de tu vehículo para publicar en AutoUY.",
};

/**
 * @stitch-screen  0207b2490b5c41e7a0449ea39885c412
 * @stitch-project 16463981372665945842
 * @stitch-title   Publicar mi Vehículo - Paso 2: Fotos
 */

const STEPS = [
  { n: 1, label: "Datos del vehículo", href: "/publicar" },
  { n: 2, label: "Fotos", href: "/publicar/fotos" },
  { n: 3, label: "Precio y plan", href: "/publicar/precio" },
];

// Placeholder uploaded photos
const MOCK_PHOTOS = [1, 2, 3];

export default function PublicarFotosPage() {
  const currentStep = 2;

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="container-page py-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-neutral-900">Fotos del Vehículo</h1>
          <p className="text-neutral-500 mt-1">Las fotos de calidad aumentan hasta 5x las consultas.</p>
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

        {/* Upload section */}
        <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50">
            <h2 className="font-bold text-neutral-800">Paso 2 — Cargá las fotos</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Mínimo 3 fotos • Máximo 20 • Formatos: JPG, PNG, WEBP</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Tips */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-500 shrink-0">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-amber-700">
                  <strong>Consejos para buenas fotos:</strong>
                  <ul className="mt-1 list-disc list-inside space-y-0.5 text-amber-600">
                    <li>Fotografiá en exteriores con buena luz natural</li>
                    <li>Incluí frente, laterales, trasero e interior</li>
                    <li>Mostrá el tablero, asientos y baúl</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Dropzone */}
            <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50/50 transition-colors cursor-pointer group">
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-neutral-200 group-hover:bg-primary-100 flex items-center justify-center mb-4 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-neutral-400 group-hover:text-primary-500 transition-colors">
                    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.83.83a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-neutral-700 group-hover:text-primary-700 transition-colors">
                  Arrastrá tus fotos aquí
                </p>
                <p className="text-sm text-neutral-400 mt-1">o hacé click para seleccionar archivos</p>
                <button className="mt-4 rounded-lg border border-neutral-300 bg-white hover:border-primary-400 hover:text-primary-600 px-5 py-2 text-sm font-medium text-neutral-600 transition-colors">
                  Seleccionar fotos
                </button>
              </div>
            </div>

            {/* Uploaded photos grid */}
            {MOCK_PHOTOS.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-neutral-700">
                    Fotos cargadas ({MOCK_PHOTOS.length}/20)
                  </h3>
                  <span className="text-xs text-neutral-400">La primera foto será la principal</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {MOCK_PHOTOS.map((_, i) => (
                    <div key={i} className="relative aspect-video rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden group">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-neutral-300">
                          <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.83.83a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {i === 0 && (
                        <div className="absolute top-1.5 left-1.5">
                          <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">Principal</span>
                        </div>
                      )}
                      <button className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-neutral-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
            <Link
              href="/publicar"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-5 py-3 text-sm font-medium text-neutral-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Atrás
            </Link>
            <Link
              href="/publicar/precio"
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
