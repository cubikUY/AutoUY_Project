import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-1.5 mb-3">
              <span className="text-xl font-bold text-white">
                Auto<span className="text-primary-400">UY</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              El marketplace de vehículos más completo de Uruguay.
            </p>
          </div>

          {/* Comprar */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
              Comprar
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/buscar" className="hover:text-white transition-colors">Buscar vehículos</Link></li>
              <li><Link href="/buscar?tipo=auto" className="hover:text-white transition-colors">Autos usados</Link></li>
              <li><Link href="/buscar?km=0" className="hover:text-white transition-colors">0km</Link></li>
              <li><Link href="/automotoras" className="hover:text-white transition-colors">Automotoras</Link></li>
            </ul>
          </div>

          {/* Vender */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
              Vender
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/publicar" className="hover:text-white transition-colors">Publicar mi vehículo</Link></li>
              <li><Link href="/publicar" className="hover:text-white transition-colors">Planes de publicación</Link></li>
              <li><Link href="/cuenta" className="hover:text-white transition-colors">Mi cuenta</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li><Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/mapa-del-sitio" className="hover:text-white transition-colors">Mapa del sitio</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© {new Date().getFullYear()} AutoUY — Marketplace de Vehículos Uruguay</p>
          <p className="text-neutral-600">
            Las imágenes son meramente ilustrativas. Los precios y stock son responsabilidad de cada vendedor.
          </p>
        </div>
      </div>
    </footer>
  );
}
