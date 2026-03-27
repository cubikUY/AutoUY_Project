"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Car } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales incorrectas. Intentá de nuevo.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Error intero al intentar iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-neutral-200 bg-white p-10 shadow-xl shadow-neutral-200/50">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary-200">
            <Car className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-black tracking-tight text-neutral-900">AutoUY Admin</h1>
          <p className="mt-1 text-sm text-neutral-500 font-medium">Panel de gestión para automotoras</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5 ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary-50 focus:outline-none"
                placeholder="admin@autouuy.uy"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5 ml-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary-50 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-center text-xs font-bold text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center text-[10px] uppercase font-bold tracking-widest text-neutral-400">
          AutoUY — Uruguay 2026
        </p>
      </div>
    </div>
  );
}
