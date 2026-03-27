"use client";

import { useEffect, useState, useCallback } from "react";
import { Box, Plus, Trash2, Edit2, Loader2, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const VEHICLE_TYPES = ["AUTO", "MOTO", "CAMION", "CAMIONETA", "UTILITARIO", "BUS", "OTRO"];

export default function ModelosPage() {
  const [models, setModels] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filtering & Pagination State
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  
  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<any>(null);
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [vehicleType, setVehicleType] = useState("AUTO");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // General feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        brandId: selectedBrand,
        vehicleType: selectedVehicleType,
        page: page.toString(),
        limit: limit.toString(),
      });
      const [modelsRes, brandsRes] = await Promise.all([
        fetch(`/api/models?${query}`),
        fetch("/api/brands")
      ]);
      
      if (modelsRes.ok) {
        const data = await modelsRes.json();
        setModels(data.models);
        setTotalCount(data.total);
      }
      if (brandsRes.ok) setBrands(await brandsRes.json());
    } catch (error) {
      console.error("Error fetching data", error);
    }
    setLoading(false);
  }, [search, selectedBrand, selectedVehicleType, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (model: any = null) => {
    setEditingModel(model);
    setErrorMessage(null);
    if (model) {
      setName(model.name);
      setBrandId(model.brandId);
      setVehicleType(model.vehicleType || "AUTO");
    } else {
      setName("");
      setBrandId("");
      setVehicleType("AUTO");
    }
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (model: any) => {
    setModelToDelete(model);
    setErrorMessage(null);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brandId || !vehicleType) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const url = editingModel ? `/api/models/${editingModel.id}` : "/api/models";
      const method = editingModel ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: JSON.stringify({ name, brandId, vehicleType }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || "Ocurrió un error al guardar.");
      }
    } catch (error) {
      console.error("[Submit Model Error]", error);
      setErrorMessage("Error de conexión con el servidor.");
    }
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = async () => {
    if (!modelToDelete) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/models/${modelToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || "No se pudo eliminar el modelo.");
      }
    } catch (error) {
      console.error("[Delete Model Error]", error);
      setErrorMessage("Error de conexión al intentar eliminar.");
    }
    setIsDeleting(false);
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
            Gestión de Modelos
          </h1>
          <p className="text-neutral-500">
            Administrá los modelos asociados a cada marca de vehículo.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-md shadow-primary-200 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Nuevo Modelo
        </button>
      </div>

      {/* Filters & Table */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm shadow-neutral-100">
        <div className="flex flex-wrap items-center gap-4 border-b border-neutral-100 p-4 bg-neutral-50/50">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por modelo o marca..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <select
              value={selectedBrand}
              onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); }}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none transition-all shadow-sm"
            >
              <option value="">Todas las Marcas</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select
              value={selectedVehicleType}
              onChange={(e) => { setSelectedVehicleType(e.target.value); setPage(1); }}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none transition-all shadow-sm"
            >
              <option value="">Todos los Tipos</option>
              {VEHICLE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 border-l border-neutral-200 pl-4 ml-auto">
            <span className="text-xs font-bold text-neutral-400 uppercase">Ver:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
              className="rounded-lg border-none bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-600 focus:ring-0 cursor-pointer hover:bg-neutral-200 transition-colors"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-4 font-bold">Modelo</th>
                <th className="px-6 py-4 font-bold">Marca</th>
                <th className="px-6 py-4 font-bold">Tipo</th>
                <th className="px-6 py-4 font-bold">Vehículos</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-400" />
                    <p className="mt-2 text-neutral-400 text-xs font-medium">Actualizando modelos...</p>
                  </td>
                </tr>
              ) : models.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-neutral-400 font-medium">No se encontraron modelos con los filtros aplicados.</p>
                  </td>
                </tr>
              ) : (
                models.map((model) => (
                  <tr key={model.id} className="hover:bg-neutral-50/80 group transition-colors">
                    <td className="px-6 py-4 font-bold text-neutral-900 border-l-2 border-transparent group-hover:border-primary-400 transition-all">
                      {model.name}
                    </td>
                    <td className="px-6 py-4">
                       <button
                         onClick={() => { setSelectedBrand(model.brandId); setPage(1); }}
                         className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-600 hover:bg-primary-50 hover:text-primary-600 transition-all"
                       >
                        {model.brand.name}
                       </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-neutral-500 px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-100">
                        {model.vehicleType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
                        model._count.vehicles > 0 ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500 shadow-inner"
                      )}>
                        {model._count.vehicles} Activos
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button"
                          onClick={() => handleOpenModal(model)}
                          className="rounded-lg p-2 text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(model)}
                          className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-all"
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

        {/* Pagination bar */}
        {!loading && totalCount > 0 && (
          <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-6 py-4">
            <p className="text-sm font-medium text-neutral-500">
              Mostrando <span className="text-neutral-900">{(page - 1) * limit + 1}</span> a <span className="text-neutral-900">{Math.min(page * limit, totalCount)}</span> de <span className="text-neutral-900">{totalCount}</span> modelos
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 shadow-sm transition-all hover:bg-neutral-50 disabled:opacity-40 active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  // Only show current, first, last, and neighbors if many pages
                  const isNeighbor = Math.abs(p - page) <= 1;
                  const isEdge = p === 1 || p === totalPages;
                  if (!isNeighbor && !isEdge && totalPages > 7) {
                    if (p === 2 || p === totalPages - 1) return <span key={p} className="px-1 text-neutral-400">...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "h-8 w-8 rounded-lg text-sm font-bold transition-all active:scale-90",
                        page === p 
                          ? "bg-primary text-white shadow-md shadow-primary-200" 
                          : "text-neutral-500 hover:bg-neutral-100"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 shadow-sm transition-all hover:bg-neutral-50 disabled:opacity-40 active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-black text-neutral-900">
                {editingModel ? "Editar Modelo" : "Nuevo Modelo"}
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                {editingModel ? "Modificá los detalles del modelo seleccionado." : "Registrá un nuevo modelo asociándolo a su marca correspondiente."}
              </p>
              
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 pl-1">
                    Marca
                  </label>
                  <select
                    required
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                     className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all shadow-inner"
                  >
                    <option value="">Seleccioná una marca</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 pl-1">
                    Tipo de Vehículo
                  </label>
                  <select
                    required
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                     className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all shadow-inner"
                  >
                    {VEHICLE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 pl-1">
                    Nombre del modelo
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800 placeholder:text-neutral-300 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all shadow-inner"
                    placeholder="Ej: Golf, Model 3, Hilux..."
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 animate-in slide-in-from-top-2">
                    {errorMessage}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-neutral-50 mt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-bold text-neutral-500 hover:bg-neutral-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingModel ? "Guardar Cambios" : "Crear Modelo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && modelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 mb-6 border border-red-100">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black text-neutral-900">¿Eliminar Modelo?</h3>
              <p className="mt-2 text-sm text-neutral-500">
                Vas a eliminar el modelo <span className="font-bold text-neutral-800">{modelToDelete.name}</span>. Esta acción no se puede deshacer.
              </p>

              {errorMessage && (
                <div className="mt-4 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 uppercase tracking-tight">
                  {errorMessage}
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
