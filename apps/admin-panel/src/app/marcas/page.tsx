"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, Edit2, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MarcasPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({ name: "", isActive: true, isFeatured: false });

  useEffect(() => {
    setIsMounted(true);
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brands");
      if (res.ok) {
        setBrands(await res.json());
      }
    } catch (error) {
      console.error("Error fetching brands", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    setIsSubmitting(true);
    setError("");

    let finalLogoUrl = editingBrand?.logoUrl || null;

    // Handle Logo Upload
    if (logoFile) {
      const uploadData = new FormData();
      uploadData.append("file", logoFile);
      uploadData.append("folder", "brands");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (uploadRes.ok) {
        const result = await uploadRes.json();
        if (result.files && result.files.length > 0) {
          finalLogoUrl = result.files[0].url;
        }
      } else {
        setError("Error al subir el logo");
        setIsSubmitting(false);
        return;
      }
    }

    const method = editingBrand ? "PUT" : "POST";
    const url = editingBrand ? `/api/brands/${editingBrand.id}` : "/api/brands";

    const payload = {
      ...formData,
      ...(finalLogoUrl && { logoUrl: finalLogoUrl }),
    };

    const res = await fetch(url, {
      method,
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setFormData({ name: "", isActive: true, isFeatured: false });
      setLogoFile(null);
      setEditingBrand(null);
      setIsModalOpen(false);
      fetchBrands();
    } else {
      const data = await res.json();
      setError(data.error || "Ocurrió un error");
    }
    setIsSubmitting(false);
  };

  const handleDeleteBrand = async (brand: any) => {
    const msg = (brand._count?.models > 0 || brand._count?.vehicles > 0)
      ? `La marca "${brand.name}" tiene modelos o vehículos asociados. Se DESACTIVARÁ de la vista del público (borrado lógico). ¿Continuar?`
      : `¿Estás seguro de eliminar permanentemente la marca "${brand.name}"?`;
      
    if (!confirm(msg)) return;
    
    const res = await fetch(`/api/brands/${brand.id}`, { method: "DELETE" });
    if (res.ok) fetchBrands();
  };

  const openEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({ 
      name: brand.name, 
      isActive: brand.isActive !== false,
      isFeatured: brand.isFeatured === true
    });
    setLogoFile(null);
    setIsModalOpen(true);
  };

  if (!isMounted) return null;

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
            Gestión de Marcas
          </h1>
          <p className="text-neutral-500">
            Administrá las marcas de vehículos disponibles en el sitio.
          </p>
        </div>
        <button
          onClick={() => { 
            setEditingBrand(null); 
            setFormData({ name: "", isActive: true, isFeatured: false }); 
            setLogoFile(null); 
            setIsModalOpen(true); 
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" /> Nueva Marca
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm shadow-neutral-100">
        <div className="border-b border-neutral-100 p-4 bg-neutral-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Filtrar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-100">
              <tr>
                 <th className="px-6 py-4 font-bold">Marca</th>
                 <th className="px-6 py-4 font-bold">Estado</th>
                 <th className="px-6 py-4 font-bold">Destacada</th>
                 <th className="px-6 py-4 font-bold">Modelos</th>
                 <th className="px-6 py-4 font-bold">Vehículos</th>
                 <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-400" />
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-neutral-400">
                    No se encontraron marcas.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => {
                  const brandIsActive = brand.isActive !== false;
                  return (
                    <tr key={brand.id} className={cn("hover:bg-neutral-50 group transition-colors", !brandIsActive && "bg-neutral-50/50 opacity-60")}>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 font-black text-neutral-400 uppercase">
                          {brand.logoUrl ? (
                            <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
                          ) : (
                            brand.name.substring(0, 1)
                          )}
                        </div>
                        <span className={cn("font-bold text-neutral-900", !brandIsActive && "line-through")}>
                          {brand.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border",
                          brandIsActive 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-red-50 text-red-700 border-red-100"
                        )}>
                          {brandIsActive ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border",
                          brand.isFeatured 
                            ? "bg-blue-50 text-blue-700 border-blue-100" 
                            : "bg-neutral-50 text-neutral-500 border-neutral-100"
                        )}>
                          {brand.isFeatured ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 font-medium">{brand._count?.models || 0}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          (brand._count?.vehicles || 0) > 0 ? "bg-emerald-50 text-emerald-700 font-black" : "bg-neutral-100 text-neutral-500"
                        )}>
                          {brand._count?.vehicles || 0} Activos
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => openEdit(brand)}
                            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand)}
                            className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-black text-neutral-900">
              {editingBrand ? "Modificar Marca" : "Nueva Marca"}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              {editingBrand ? "Editá los detalles de la marca." : "Ingresá el nombre de la nueva marca."}
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 pl-1">
                    Nombre de la marca
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all shadow-inner"
                    placeholder="Ej: Tesla, BYD..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 pl-1">
                    Imagen de la Marca
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-2 py-2 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                  <div>
                    <p className="text-sm font-bold text-neutral-800">Activa</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={cn(
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      formData.isActive ? "bg-primary-600" : "bg-neutral-200"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      formData.isActive ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                  <div>
                    <p className="text-sm font-bold text-neutral-800">Destacada</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                    className={cn(
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      formData.isFeatured ? "bg-blue-600" : "bg-neutral-200"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      formData.isFeatured ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-neutral-100 bg-white py-3 text-sm font-bold text-neutral-500 hover:bg-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingBrand ? "Guardar Cambios" : "Crear Marca"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
