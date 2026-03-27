"use client";

import { useEffect, useState } from "react";
import { Building2, Search, CheckCircle2, ShieldCheck, ShieldAlert, Loader2, Mail, Phone, Plus, X, Eye, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalMode = "create" | "edit" | "view";

export default function AutomotorasPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    rut: "",
    phone: "",
    email: "",
    name: "",
    password: "",
    city: "",
    address: "",
    verified: true,
  });

  const fetchDealers = async () => {
    setLoading(true);
    const res = await fetch("/api/dealers");
    if (res.ok) {
      setDealers(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const handleOpenCreate = () => {
    setModalMode("create");
    setFormData({
      businessName: "",
      rut: "",
      phone: "",
      email: "",
      name: "",
      password: "",
      city: "",
      address: "",
      verified: true
    });
    setLogoFile(null);
    setError("");
    setShowModal(true);
  };

  const handleOpenView = (dealer: any) => {
    setModalMode("view");
    setSelectedDealer(dealer);
    setFormData({
      businessName: dealer.businessName || "",
      rut: dealer.rut || "",
      phone: dealer.phone || "",
      email: dealer.owner?.email || "",
      name: dealer.owner?.name || "",
      password: "", // Handled separately or not at all for basic edits
      city: dealer.city || "",
      address: dealer.address || "",
      verified: dealer.verified
    });
    setLogoFile(null);
    setShowModal(true);
  };

  const handleOpenEdit = (dealer: any) => {
    setModalMode("edit");
    setSelectedDealer(dealer);
    setFormData({
      businessName: dealer.businessName || "",
      rut: dealer.rut || "",
      phone: dealer.phone || "",
      email: dealer.owner?.email || "",
      name: dealer.owner?.name || "",
      password: "", // Handled separately or not at all for basic edits
      city: dealer.city || "",
      address: dealer.address || "",
      verified: dealer.verified
    });
    setLogoFile(null);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "view") return;

    setIsSubmitting(true);
    setError("");

    const isEdit = modalMode === "edit";
    let finalLogoUrl = selectedDealer?.logoUrl || null;

    if (logoFile) {
      const uploadData = new FormData();
      uploadData.append("file", logoFile);
      uploadData.append("folder", "dealers");

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

    const url = "/api/dealers";
    const method = isEdit ? "PUT" : "POST";
    const payload = {
      ...(isEdit ? { ...formData, id: selectedDealer.id } : formData),
      ...(finalLogoUrl && { logoUrl: finalLogoUrl }),
    };

    const res = await fetch(url, {
      method,
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setShowModal(false);
      fetchDealers();
    } else {
      const data = await res.json();
      setError(data.error || "Ocurrió un error");
    }
    setIsSubmitting(false);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dealerToDelete, setDealerToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleOpenDelete = (dealer: any) => {
    setDealerToDelete(dealer);
    setDeleteError("");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!dealerToDelete) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/dealers?id=${dealerToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsDeleteModalOpen(false);
        fetchDealers();
      } else {
        const data = await res.json();
        setDeleteError(data.error || "No se pudo eliminar la automotora.");
      }
    } catch (err) {
      setDeleteError("Error de red al intentar eliminar.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleVerify = async (id: string, currentStatus: boolean) => {
    const res = await fetch("/api/dealers", {
      method: "PATCH",
      body: JSON.stringify({ id, verified: !currentStatus }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) fetchDealers();
  };

  const filteredDealers = dealers.filter((d) =>
    d.businessName.toLowerCase().includes(search.toLowerCase()) || 
    d.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
            Gestión de Automotoras
          </h1>
          <p className="text-neutral-500">
            Administrá y verificá los perfiles profesionales de los vendedores.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-all active:scale-95 shadow-md shadow-primary-200"
        >
          <Plus className="h-4 w-4" />
          Nueva Automotora
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
              <h2 className="text-lg font-bold text-neutral-900">
                {modalMode === "create" ? "Crear Nueva Automotora" : 
                 modalMode === "edit" ? "Editar Automotora" : 
                 "Datos de Automotora"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                      Razón Social *
                    </label>
                    <input
                      required
                      disabled={modalMode === "view"}
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Ej: Car World Uruguay"
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all disabled:bg-neutral-50 disabled:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                      Logo Automotora
                    </label>
                    <input
                      disabled={modalMode === "view"}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-2 py-2 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:bg-neutral-50 disabled:text-neutral-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                    RUT
                  </label>
                  <input
                    disabled={modalMode === "view"}
                    type="text"
                    value={formData.rut}
                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                    placeholder="21XXXXXXXX00XX"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                    Teléfono *
                  </label>
                  <input
                    required
                    disabled={modalMode === "view"}
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09X XXX XXX"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4 pt-2 border-t border-neutral-50">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                      Email Usuario *
                    </label>
                    <input
                      required
                      disabled={modalMode === "view" || modalMode === "edit"}
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@automotora.com"
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all disabled:bg-neutral-50 disabled:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                      Nombre Admin *
                    </label>
                    <input
                      required
                      disabled={modalMode === "view"}
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Juan Pérez"
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all disabled:bg-neutral-50 disabled:text-neutral-500"
                    />
                  </div>
                  {modalMode === "create" && (
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                        Contraseña Temporal *
                      </label>
                      <input
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all"
                      />
                    </div>
                  )}
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4 pt-2 border-t border-neutral-50">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                      Ciudad
                    </label>
                    <input
                      disabled={modalMode === "view"}
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Montevideo"
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all disabled:bg-neutral-50 disabled:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                      Dirección
                    </label>
                    <input
                      disabled={modalMode === "view"}
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Av. Italia 1234"
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all disabled:bg-neutral-50 disabled:text-neutral-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors active:scale-95"
                >
                  {modalMode === "view" ? "Cerrar" : "Cancelar"}
                </button>
                {modalMode !== "view" && (
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary-100"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {modalMode === "create" ? "Crear Automotora" : "Guardar Cambios"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm shadow-neutral-100">
        <div className="border-b border-neutral-100 p-4 bg-neutral-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o ciudad..."
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
                <th className="px-6 py-4 font-bold">Automotora</th>
                <th className="px-6 py-4 font-bold">Contacto</th>
                <th className="px-6 py-4 font-bold">Ubicación</th>
                <th className="px-6 py-4 font-bold text-center">Vehículos</th>
                <th className="px-6 py-4 font-bold text-center">Verificación</th>
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
              ) : filteredDealers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-neutral-400">
                    No se encontraron automotoras.
                  </td>
                </tr>
              ) : (
                filteredDealers.map((dealer) => (
                  <tr key={dealer.id} className="hover:bg-neutral-50 group transition-colors">
                    <td className="px-6 py-4 font-bold text-neutral-900 border-l-2 border-transparent group-hover:border-primary-400 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white font-black text-primary-600 shadow-sm overflow-hidden">
                           {dealer.logoUrl ? <img src={dealer.logoUrl} className="h-full w-full object-cover" /> : <Building2 className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">{dealer.businessName}</p>
                          <p className="text-xs text-neutral-400 font-medium">{dealer.owner?.name || "Sin nombre"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <a 
                          href={`mailto:${dealer.owner?.email || ""}`}
                          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 hover:underline transition-colors"
                        >
                          <Mail className="h-3 w-3" /> {dealer.owner?.email || "Sin email"}
                        </a>
                        <a 
                          href={`tel:${dealer.phone?.replace(/\s/g, "")}`}
                          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 hover:underline transition-colors transition-all"
                        >
                          <Phone className="h-3 w-3" /> {dealer.phone || "Sin tel."}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-neutral-600">
                        {dealer.city || "No especificada"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-lg bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-700">
                        {dealer._count.vehicles}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleVerify(dealer.id, dealer.verified)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold transition-all active:scale-95 uppercase tracking-wider",
                          dealer.verified 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        )}
                      >
                         {dealer.verified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                         {dealer.verified ? "Verificada" : "Pendiente"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenView(dealer)}
                          className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(dealer)}
                          className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenDelete(dealer)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && dealerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden border border-neutral-100">
            <div className="p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-6 border border-red-100 shadow-sm">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">¿Eliminar Automotora?</h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                Estás por eliminar a <span className="font-bold text-neutral-800">"{dealerToDelete.businessName}"</span>. Esta acción no se puede deshacer.
              </p>

              {deleteError && (
                <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-100 tracking-tight flex items-center gap-2 text-left justify-center">
                   <ShieldAlert className="h-4 w-4 shrink-0" />
                   {deleteError}
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-bold text-neutral-500 hover:bg-neutral-50 transition-all active:scale-95 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
