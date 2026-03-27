"use client";

import { Search, Bell, User } from "lucide-react";
import { useSession } from "next-auth/react";

export function TopNav() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Usuario";
  const userRole = (session?.user as any)?.role || "N/A";
  const initials = userName.substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white/80 px-8 backdrop-blur-md">
      <div className="flex w-full max-w-xl items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-neutral-400 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
        <Search className="h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar vehículo, cliente, automotora..."
          className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-px bg-neutral-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-neutral-900">{userName}</p>
            <p className="text-[10px] text-neutral-500 uppercase">{userRole}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-primary-700 font-bold uppercase overflow-hidden">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

