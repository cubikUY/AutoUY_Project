"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-200/60"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xl font-bold tracking-tight ${
              transparent ? "text-white" : "text-primary-600"
            }`}
          >
            Auto
            <span
              className={transparent ? "text-primary-300" : "text-primary-400"}
            >
              UY
            </span>
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-5 h-5 ${transparent ? "text-primary-300" : "text-primary-500"}`}
          >
            <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
            <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z" />
            <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
          </svg>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/buscar", label: "Comprar" },
            { href: "/publicar", label: "Vender" },
            { href: "/automotoras", label: "Automotoras" },
            ...(session ? [{ href: "/favoritos", label: "Favoritos" }] : []),
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                transparent
                  ? "text-white/90 hover:text-white hover:bg-white/10"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="hidden md:flex items-center gap-3 mr-2">
              <span className={`text-sm font-medium ${transparent ? "text-white/80" : "text-neutral-600"}`}>
                Hola, <span className="font-bold">{session.user?.name?.split(" ")[0]}</span>
              </span>
              <button
                onClick={() => signOut()}
                className={`text-sm font-bold transition-colors ${
                  transparent
                    ? "text-white/80 hover:text-white"
                    : "text-red-500 hover:text-red-700"
                }`}
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`hidden md:block text-sm font-bold transition-colors ${
                transparent
                  ? "text-white/80 hover:text-white"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Ingresar
            </Link>
          )}
          
          <Link
            href="/publicar"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Publicar
          </Link>
          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              transparent
                ? "text-white hover:bg-white/10"
                : "text-neutral-500 hover:bg-neutral-100"
            }`}
            aria-label="Menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 shadow-lg">
          <nav className="container-page flex flex-col py-4 gap-1">
            {[
              { href: "/buscar", label: "Comprar" },
              { href: "/publicar", label: "Vender" },
              { href: "/automotoras", label: "Automotoras" },
              ...(session ? [{ href: "/favoritos", label: "Favoritos" }] : []),
              ...(session ? [] : [{ href: "/login", label: "Ingresar" }]),
              ...(session ? [{ href: "#", label: "Cerrar Sesión", onClick: () => signOut() }] : []),
            ].map((item: any) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  item.label === "Cerrar Sesión" ? "text-red-600" : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
