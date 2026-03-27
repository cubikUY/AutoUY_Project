"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Car, ArrowLeft } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
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
        setError("Email o contraseña incorrectos.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Error al intentar iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 ml-1">Tu Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary-50 focus:outline-none"
            placeholder="ejemplo@correo.com"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 ml-1">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary-50 focus:outline-none"
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
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 text-sm font-bold text-white shadow-xl shadow-primary-200 transition-all hover:bg-primary-700 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Iniciar Sesión"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-neutral-100 bg-white p-10 shadow-2xl shadow-neutral-200/40">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver al Inicio
        </Link>

        <div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-neutral-900">Bienvenido de nuevo</h1>
          <p className="mt-2 text-sm text-neutral-500 font-medium">Ingresá a tu cuenta para gestionar tus publicaciones y favoritos.</p>
        </div>

        <Suspense fallback={<div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>}>
          <LoginForm />
        </Suspense>

        <div className="text-center">
            <p className="text-sm text-neutral-500 font-medium">
                ¿No tenés cuenta?{" "}
                <Link href="/registro" className="text-primary-600 font-bold hover:underline">
                    Registrate gratis
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}
