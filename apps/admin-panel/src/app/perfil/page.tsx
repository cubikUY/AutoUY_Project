"use client";

import { useEffect, useState } from "react";
import { Loader2, Store, Save, ShieldAlert, Image as ImageIcon, Link as LinkIcon, MapPin, Phone, MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function PerfilAutomotoraPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    website: "",
    whatsapp: "",
    phone: "",
    city: "",
    address: "",
    logoUrl: "",
    bannerUrl: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/perfil");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            businessName: data.businessName || "",
            description: data.description || "",
            website: data.website || "",
            whatsapp: data.whatsapp || "",
            phone: data.phone || "",
            city: data.city || "",
            address: data.address || "",
            logoUrl: data.logoUrl || "",
            bannerUrl: data.bannerUrl || "",
          });
        }
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (session?.user) {
      loadProfile();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    let finalLogoUrl = formData.logoUrl;
    let finalBannerUrl = formData.bannerUrl;

    try {
      // Subir logo
      if (logoFile) {
        const data = new FormData();
        data.append("file", logoFile);
        data.append("folder", "dealers/logos");
        const res = await fetch("/api/upload", { method: "POST", body: data });
        if (res.ok) {
          const uploadRes = await res.json();
          if (uploadRes.files?.[0]) {
            finalLogoUrl = uploadRes.files[0].url;
          }
        }
      }

      // Subir banner
      if (bannerFile) {
        const data = new FormData();
        data.append("file", bannerFile);
        data.append("folder", "dealers/banners");
        const res = await fetch("/api/upload", { method: "POST", body: data });
        if (res.ok) {
          const uploadRes = await res.json();
          if (uploadRes.files?.[0]) {
            finalBannerUrl = uploadRes.files[0].url;
          }
        }
      }

      // Actualizar perfil
      const payload = {
        ...formData,
        logoUrl: finalLogoUrl,
        bannerUrl: finalBannerUrl,
      };

      const updateRes = await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (updateRes.ok) {
        setSuccess(true);
        setFormData(payload);
        setLogoFile(null);
        setBannerFile(null);
      } else {
        const data = await updateRes.json();
        setError(data.error || "Error al guardar el perfil");
      }
    } catch (err) {
      setError("Error de red al servidor.");
    } finally {
      setSaving(false);
      // Limpiar mensaje de éxito después de 3s
      if (success) setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }

  // Not a dealer warning
  if ((session?.user as any)?.role !== "DEALER") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-red-700">Acceso Restringido</h2>
        <p className="text-red-600 mt-2">Esta sección es exclusiva para perfiles de automotoras.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
          Mi Perfil Automotora
        </h1>
        <p className="text-neutral-500">
          Personalizá tu información pública. Tus clientes lo verán en los detalles de tus vehículos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Aspecto Visual */}
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
          <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-neutral-400" /> Aspecto Visual
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Banner */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Banner de Portada
              </label>
              <div 
                className="relative h-32 w-full rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => document.getElementById('banner-upload')?.click()}
              >
                {bannerFile ? (
                  <img src={URL.createObjectURL(bannerFile)} alt="Banner preview" className="h-full w-full object-cover" />
                ) : formData.bannerUrl ? (
                  <img src={formData.bannerUrl} alt="Banner" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-neutral-400">
                    <ImageIcon className="mx-auto h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">Subir Imagen (1200x300)</span>
                  </div>
                )}
                <input 
                  id="banner-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Logo de la Automotora
              </label>
              <div 
                className="relative h-32 w-32 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                 {logoFile ? (
                  <img src={URL.createObjectURL(logoFile)} alt="Logo preview" className="h-full w-full object-cover" />
                ) : formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-neutral-400">
                    <Store className="mx-auto h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">Subir Logo</span>
                  </div>
                )}
                <input 
                  id="logo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Información General */}
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
          <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Store className="h-5 w-5 text-neutral-400" /> Información General
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                Sobre Nosotros (Descripción)
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve reseña sobre tu automotora para ganar confianza con los clientes..."
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ej. 099 123 456"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5" /> Número de WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Ej. 59899123456 (incluir código pías)"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5" /> Sitio Web Oficial
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://tuautomotora.com"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all"
                  />
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Dirección Física
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Av. Italia 1234, esq. Comercio"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5">
                    Ciudad / Departamento
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Montevideo"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all"
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-primary-200"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Guardar Cambios
          </button>
          
          {error && <span className="text-sm font-medium text-red-600">{error}</span>}
          {success && <span className="text-sm font-bold text-emerald-600">¡Perfil actualizado correctamente!</span>}
        </div>

      </form>
    </div>
  );
}
