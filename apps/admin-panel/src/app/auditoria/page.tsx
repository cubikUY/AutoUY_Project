"use client";

import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Loader2, 
  User, 
  Calendar, 
  Info,
  ArrowRight,
  Eye,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit");
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (error) {
      console.error("Error fetching logs", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionColors: Record<string, string> = {
    CREATE: "border-emerald-100 bg-emerald-50 text-emerald-700",
    UPDATE: "border-blue-100 bg-blue-50 text-blue-700",
    DELETE: "border-red-100 bg-red-50 text-red-700",
    IMPORT: "border-purple-100 bg-purple-50 text-purple-700",
    STATUS_CHANGE: "border-amber-100 bg-amber-50 text-amber-700",
  };

  const entityIcons: Record<string, string> = {
    VEHICLE: "🚗",
    USER: "👤",
    DEALER: "🏢",
    BRAND: "🏷️",
    LEAD: "📨",
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
            Registro de Auditoría
          </h1>
          <p className="text-neutral-500">
            Control de cambios y acciones realizadas por los usuarios del sistema.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-4 font-bold">Fecha</th>
                <th className="px-6 py-4 font-bold">Usuario</th>
                <th className="px-6 py-4 font-bold">Acción</th>
                <th className="px-6 py-4 font-bold">Entidad</th>
                <th className="px-6 py-4 font-bold">Detalles</th>
                <th className="px-6 py-4 font-bold text-right">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-400" />
                    <p className="mt-2 text-xs text-neutral-400">Cargando registros...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-neutral-400">
                    No hay registros de auditoría aún.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-neutral-900">
                        {format(new Date(log.createdAt), "dd MMM, HH:mm", { locale: es })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                          {log.user.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-800 leading-none">{log.user.name}</p>
                          <p className="text-[10px] text-neutral-400 mt-1">{log.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold",
                        actionColors[log.action] || "border-neutral-100 bg-neutral-50 text-neutral-500"
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-neutral-700">
                        <span className="text-lg">{entityIcons[log.entity] || "📄"}</span>
                        <span>{log.entity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <p className="text-neutral-600 italic">"{log.details}"</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-2 rounded-lg text-neutral-400 hover:bg-white hover:text-primary-600 hover:shadow-sm"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-neutral-100 text-primary-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-neutral-900">Detalles del Evento</h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-full hover:bg-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1.5">Usuario</label>
                  <p className="font-bold text-neutral-900">{selectedLog.user.name}</p>
                  <p className="text-sm text-neutral-500">{selectedLog.user.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1.5">Fecha y Hora</label>
                  <p className="font-bold text-neutral-900">
                     {format(new Date(selectedLog.createdAt), "PPPP, HH:mm", { locale: es })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1.5">Resumen de la acción</label>
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 italic text-neutral-700">
                   {selectedLog.details}
                </div>
              </div>

              {(selectedLog.oldValue || selectedLog.newValue) && (
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block">Comparativa de Datos</label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-red-500 underline underline-offset-4">Estado Anterior</p>
                        <pre className="text-[10px] bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 max-h-60 overflow-auto whitespace-pre-wrap font-mono">
                          {selectedLog.oldValue ? JSON.stringify(selectedLog.oldValue, null, 2) : "N/A (Crecimiento/Importación)"}
                        </pre>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-emerald-600 underline underline-offset-4">Estado Nuevo</p>
                        <pre className="text-[10px] bg-emerald-50 text-emerald-900 p-4 rounded-xl border border-emerald-100 max-h-60 overflow-auto whitespace-pre-wrap font-mono">
                          {selectedLog.newValue ? JSON.stringify(selectedLog.newValue, null, 2) : "N/A (Eliminado)"}
                        </pre>
                      </div>
                   </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-neutral-100 flex justify-end">
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="bg-neutral-900 text-white px-6 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-md shadow-neutral-200"
                >
                  Cerrar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
