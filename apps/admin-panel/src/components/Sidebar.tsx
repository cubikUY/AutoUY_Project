"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Tag,
  Users,
  MessageSquare,
  Settings,
  ChevronRight,
  LogOut,
  Building2,
  Box,
  Store,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "DEALER"] },
  { label: "Mi Perfil", href: "/perfil", icon: Store, roles: ["DEALER"] },
  { label: "Inventario", href: "/inventario", icon: Car, roles: ["ADMIN", "DEALER"] },
  { label: "Marcas", href: "/marcas", icon: Tag, roles: ["ADMIN"] },
  { label: "Modelos", href: "/modelos", icon: Box, roles: ["ADMIN"] },
  { label: "Consultas (Leads)", href: "/consultas", icon: MessageSquare, roles: ["ADMIN", "DEALER"] },
  { label: "Sucursales", href: "/sucursales", icon: MapPin, roles: ["ADMIN", "DEALER"] },
  { label: "Mi Equipo", href: "/equipo", icon: Users, roles: ["DEALER"] },
  { label: "Automotoras", href: "/automotoras", icon: Building2, roles: ["ADMIN"] },
  { label: "Usuarios", href: "/usuarios", icon: Users, roles: ["ADMIN"] },
  { label: "Auditoría", href: "/auditoria", icon: ShieldCheck, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 font-bold text-white">
              A
            </div>
            <span className="text-xl font-extrabold tracking-tight text-neutral-900">
              AutoUY<span className="text-primary-600">.</span>
            </span>
            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500 uppercase">
              {userRole === "DEALER" ? "Dealer" : "Admin"}
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(userRole)).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/50"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600",
                    )}
                  />
                  {item.label}
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-primary-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-100 p-4 space-y-2">
          {session?.user && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 font-bold text-neutral-600 text-xs">
                {session.user.name?.[0].toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-xs font-bold text-neutral-900">{session.user.name}</p>
                <p className="truncate text-[10px] text-neutral-500">{(session.user as any).role}</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
