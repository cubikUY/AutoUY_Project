"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VehicleModal from "@/components/VehicleModal";
import { Car, Search, Filter, Loader2, Trash2, CheckCircle2, XCircle, Plus, Edit2, RotateCcw, Eye, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import ImportModal from "@/components/ImportModal";

export default function InventarioPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory?status=${statusFilter}&search=${search}`);
      if (res.ok) {
        setVehicles(await res.json());
      }
    } catch (error) {
      console.error("Error fetching inventory", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, [statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const res = await fetch("/api/inventory", {
      method: "PATCH",
      body: JSON.stringify({ id, status: newStatus }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) fetchInventory();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta publicación de forma permanente?")) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (res.ok) fetchInventory();
    } catch (error) {
      console.error("Error deleting vehicle", error);
    }
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
    DRAFT: "bg-amber-50 text-amber-700 border-amber-100",
    SOLD: "bg-blue-50 text-blue-700 border-blue-100",
    PAUSED: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
            Inventario de Vehículos
          </h1>
          <p className="text-neutral-500">
            Supervisá y moderá todas las publicaciones del sitio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all active:scale-95"
          >
            <FileUp className="h-4 w-4" /> Importar
          </button>
          <button
            onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-md shadow-primary-200 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Nueva Publicación
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm shadow-neutral-100">
        <div className="flex flex-wrap items-center gap-4 border-b border-neutral-100 p-4 bg-neutral-50/50">
          <form className="relative flex-1 min-w-[240px]" onSubmit={(e) => { e.preventDefault(); fetchInventory(); }}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por título, marca o modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none transition-all"
            />
          </form>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none transition-all"
            >
              <option value="">Todos los Estados</option>
              <option value="ACTIVE">Activos</option>
              <option value="DRAFT">Borradores</option>
              <option value="SOLD">Vendidos</option>
              <option value="PAUSED">Pausados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-4 font-bold">Vehículo</th>
                <th className="px-6 py-4 font-bold">Condición</th>
                {isAdmin && <th className="px-6 py-4 font-bold">Vendedor</th>}
                <th className="px-6 py-4 font-bold">Precio / Año</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-20 text-center text-neutral-400">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-400" />
                    <p className="mt-2 text-xs">Cargando inventario...</p>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-20 text-center text-neutral-400">
                    No se encontraron vehículos.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-neutral-50 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 line-clamp-1">{v.title}</p>
                          <p className="text-xs text-neutral-500">{v.brand?.name} {v.model?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        v.condition === "NEW" ? "bg-blue-50 text-blue-700" : "bg-neutral-100 text-neutral-600"
                      )}>
                        {v.condition === "NEW" ? "Nuevo" : "Usado"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <p className="font-medium text-neutral-700">{v.dealer?.businessName || v.owner?.name || "Sin dueño"}</p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-tighter">
                          {v.dealerId ? "Automotora" : "Particular"}
                        </p>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <p className="font-bold text-neutral-900">{v.currency} {Number(v.price).toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">Año {v.year}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                        statusColors[v.status] || "bg-neutral-100 text-neutral-500"
                      )}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/inventario/${v.id}`)}
                          title="Ver publicación"
                          className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {v.status === "DRAFT" && (
                          <button
                            onClick={() => handleStatusUpdate(v.id, "ACTIVE")}
                            title="Aprobar y Publicar"
                            className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-50 transition-colors"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {v.status === "ACTIVE" && (
                          <button
                            onClick={() => handleStatusUpdate(v.id, "PAUSED")}
                            title="Pausar"
                            className="rounded-lg p-2 text-amber-500 hover:bg-amber-50 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        {v.status === "PAUSED" && (
                          <button
                            onClick={() => handleStatusUpdate(v.id, "ACTIVE")}
                            title="Reactivar"
                            className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-50 transition-colors"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/inventario/${v.id}/editar`)}
                          title="Editar"
                          className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          title="Eliminar"
                          className="rounded-lg p-2 text-neutral-300 hover:bg-red-50 hover:text-red-500 transition-colors"
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

      <VehicleModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingVehicle(null); }} 
        onSave={fetchInventory}
        vehicle={editingVehicle}
      />
      
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={fetchInventory}
      />
    </div>
  );
}
