"use client";

import { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  Car, 
  MoreHorizontal,
  Loader2,
  Calendar,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Users } from "lucide-react";

export default function ConsultasPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const staffRole = (session?.user as any)?.staffRole;
  const isOwnerOrAdmin = userRole === "ADMIN" || staffRole === "OWNER";

  useEffect(() => {
    setIsMounted(true);
    fetchLeads();
    if (isOwnerOrAdmin) fetchStaff();
  }, [isOwnerOrAdmin]);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        setStaff(await res.json());
      }
    } catch (error) {
      console.error("Error fetching staff", error);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        setLeads(await res.json());
      }
    } catch (error) {
      console.error("Error fetching leads", error);
    }
    setLoading(false);
  };

  const updateStatus = async (leadId: string, newStatus: string) => {
    setIsUpdating(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      }
    } catch (error) {
      console.error("Error updating lead status", error);
    }
    setIsUpdating(null);
  };

  const assignSalesman = async (leadId: string, salesmanId: string) => {
    setIsUpdating(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salesmanId }),
      });

      if (res.ok) {
        setLeads(leads.map(l => l.id === leadId ? { ...l, salesmanId } : l));
      }
    } catch (error) {
      console.error("Error assigning salesman", error);
    }
    setIsUpdating(null);
  };

  if (!isMounted) return null;

  const filteredLeads = leads.filter((l) => {
    const matchesSearch = 
      l.name?.toLowerCase().includes(search.toLowerCase()) || 
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.vehicle?.title?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-UY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "NEW":
        return { 
          label: "Nueva", 
          color: "bg-blue-100 text-blue-700 border-blue-200", 
          icon: Clock 
        };
      case "CONTACTED":
        return { 
          label: "Contactado", 
          color: "bg-amber-100 text-amber-700 border-amber-200", 
          icon: Mail 
        };
      case "CLOSED":
        return { 
          label: "Cerrada / Vendido", 
          color: "bg-emerald-100 text-emerald-700 border-emerald-200", 
          icon: CheckCircle 
        };
      default:
        return { 
          label: status, 
          color: "bg-neutral-100 text-neutral-700 border-neutral-200", 
          icon: MoreHorizontal 
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
          Gestión de Consultas (Leads)
        </h1>
        <p className="text-neutral-500">
          Seguí y gestioná los contactos de potenciales compradores para tus vehículos.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o vehículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-800 shadow-sm focus:border-primary-400 focus:outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {["ALL", "NEW", "CONTACTED", "CLOSED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-bold transition-all",
                statusFilter === s
                  ? "bg-neutral-900 text-white shadow-md shadow-neutral-200"
                  : "bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
              )}
            >
              {s === "ALL" ? "Todas" : s === "NEW" ? "Nuevas" : s === "CONTACTED" ? "Contactadas" : "Cerradas"}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-neutral-100 italic text-neutral-400">
            <Loader2 className="h-10 w-10 animate-spin text-primary-300 mb-2" />
            Cargando consultas...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-neutral-100 text-center">
            <div className="h-16 w-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-neutral-300" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">No hay consultas</h3>
            <p className="text-neutral-500 max-w-xs mt-1">
              {search || statusFilter !== "ALL" 
                ? "Probá cambiando los filtros o la búsqueda." 
                : "Aún no has recibido consultas de potenciales compradores."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredLeads.map((lead) => {
              const status = getStatusConfig(lead.status);
              const StatusIcon = status.icon;
              
              return (
                <div 
                  key={lead.id}
                  className={cn(
                    "group relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-3xl border p-6 transition-all hover:shadow-xl hover:shadow-neutral-100/50 bg-white",
                    lead.status === "NEW" ? "border-blue-100 shadow-sm shadow-blue-50/50" : "border-neutral-100"
                  )}
                >
                  {/* Status Indicator */}
                  <div className="lg:col-span-2 flex flex-col items-center justify-center lg:items-start lg:justify-start gap-2">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border",
                      status.color
                    )}>
                      {isUpdating === lead.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <StatusIcon className="h-3 w-3" />
                      )}
                      {status.label}
                    </span>
                    <span className="text-[10px] font-medium text-neutral-400 flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {formatDate(lead.createdAt)}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="lg:col-span-4 space-y-2">
                    <h4 className="font-extrabold text-neutral-900 flex items-center gap-2">
                      {lead.name}
                      {lead.status === "NEW" && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Mail className="h-3.5 w-3.5" />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <Phone className="h-3.5 w-3.5" />
                          {lead.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Context */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl border border-neutral-100 bg-neutral-50 overflow-hidden flex-shrink-0">
                        {lead.vehicle?.images?.[0]?.url ? (
                          <img 
                            src={lead.vehicle.images[0].url} 
                            alt={lead.vehicle.title} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Car className="h-6 w-6 text-neutral-200" />
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-neutral-900 truncate">
                          {lead.vehicle?.title || "Vehículo desconocido"}
                        </p>
                        <p className="text-[10px] text-primary-600 font-black">
                          {lead.vehicle?.currency} {Number(lead.vehicle?.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Salesman Assignment */}
                  <div className="lg:col-span-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1">
                            Vendedor Asignado
                            {isUpdating === lead.id && <Loader2 className="h-2 w-2 animate-spin text-primary-400" />}
                        </label>
                        {isOwnerOrAdmin ? (
                            <select
                                value={lead.salesmanId || ""}
                                onChange={(e) => assignSalesman(lead.id, e.target.value)}
                                className={cn(
                                    "w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700 focus:outline-none transition-all",
                                    !lead.salesmanId && "border-amber-200 bg-amber-50 text-amber-700"
                                )}
                            >
                                <option value="">Sin Asignar</option>
                                {staff.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name} {member.staffRole === "OWNER" ? "(Dueño)" : "(Vendedor)"}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span className="inline-flex items-center gap-2 text-xs font-bold text-neutral-700 px-3 py-1.5 bg-neutral-50 rounded-xl border border-neutral-100">
                                <Users className="h-3.5 w-3.5 text-neutral-400" />
                                {staff.find(s => s.id === lead.salesmanId)?.name || "Sin Asignar"}
                            </span>
                        )}
                    </div>
                  </div>

                  {/* Message / Content Preview */}
                  {lead.message && (
                    <div className="lg:col-span-12 mt-2 p-4 rounded-2xl bg-neutral-50 border border-neutral-100/50 flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase text-neutral-300 tracking-wider">Consulta</span>
                      <p className="text-xs text-neutral-600 leading-relaxed italic">
                        "{lead.message}"
                      </p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="lg:col-span-3 lg:justify-end flex items-center gap-2">
                    {lead.status !== "CONTACTED" && lead.status !== "CLOSED" && (
                      <button
                        onClick={() => updateStatus(lead.id, "CONTACTED")}
                        disabled={!!isUpdating}
                        className="flex-1 lg:flex-none rounded-xl bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 px-4 py-2 text-xs font-bold transition-all active:scale-95"
                      >
                        Marcar Contactado
                      </button>
                    )}
                    {lead.status !== "CLOSED" && (
                      <button
                        onClick={() => updateStatus(lead.id, "CLOSED")}
                        disabled={!!isUpdating}
                        className="flex-1 lg:flex-none rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 px-4 py-2 text-xs font-extrabold transition-all active:scale-95 shadow-sm shadow-neutral-200"
                      >
                        Cerrar / Vendido
                      </button>
                    )}
                    {lead.status === "CLOSED" && (
                        <button
                        onClick={() => updateStatus(lead.id, "NEW")}
                        disabled={!!isUpdating}
                        className="flex-1 lg:flex-none rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50 px-4 py-2 text-xs font-bold transition-all active:scale-95"
                      >
                        Reabrir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
