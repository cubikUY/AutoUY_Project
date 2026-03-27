"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, Car, Fuel, Gauge, Palette, Settings2, DoorOpen,
  Users, Calendar, Building2, User2,
  ImageOff, CheckCircle2, XCircle, RotateCcw, Pencil, Trash2, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  SOLD: "Vendida",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
  SOLD: "bg-blue-50 text-blue-700 border-blue-200",
  PAUSED: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [coverIndex, setCoverIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchVehicle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/${id}`);
      if (res.ok) {
        const data = await res.json();
        setVehicle(data);
      } else {
        router.push("/inventario");
      }
    } catch {
      router.push("/inventario");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchVehicle();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    const res = await fetch("/api/inventory", {
      method: "PATCH",
      body: JSON.stringify({ id, status: newStatus }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) await fetchVehicle();
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar esta publicación? Esta acción es irreversible.")) return;
    const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/inventario");
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!vehicle) return null;

  const images: any[] = vehicle.images || [];
  const coverImage = images[coverIndex];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/inventario")}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 line-clamp-1">
              {vehicle.title}
            </h1>
            <p className="text-sm text-neutral-500">
              {vehicle.brand?.name} · {vehicle.model?.name} · {vehicle.year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase",
            STATUS_COLORS[vehicle.status] || "bg-neutral-100 text-neutral-500"
          )}>
            {STATUS_LABELS[vehicle.status] || vehicle.status}
          </span>

          {vehicle.status === "DRAFT" && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusUpdate("ACTIVE")}
              title="Publicar"
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" /> Publicar
            </button>
          )}
          {vehicle.status === "ACTIVE" && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusUpdate("PAUSED")}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" /> Pausar
            </button>
          )}
          {vehicle.status === "PAUSED" && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusUpdate("ACTIVE")}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" /> Reactivar
            </button>
          )}
          <button
            onClick={() => router.push(`/inventario/${id}/editar`)}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
          >
            <Pencil className="h-4 w-4" /> Editar
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Gallery + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            {images.length > 0 ? (
              <>
                {/* Main image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
                  <img
                    src={coverImage?.url}
                    alt={vehicle.title}
                    className="h-full w-full object-cover"
                  />
                  {/* Portada pill — only shown when the displayed image is the actual cover */}
                  {coverImage?.isCover && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      Portada
                    </div>
                  )}
                </div>
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-3">
                    {images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        onClick={() => setCoverIndex(idx)}
                        className={cn(
                          "h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                          idx === coverIndex ? "border-primary-500 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex aspect-[16/9] flex-col items-center justify-center gap-3 bg-neutral-50 text-neutral-400">
                <ImageOff className="h-12 w-12" />
                <p className="text-sm font-medium">Sin imágenes cargadas</p>
              </div>
            )}
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-primary-600">Descripción</h3>
              <p className="text-sm leading-relaxed text-neutral-600">{vehicle.description}</p>
            </div>
          )}
        </div>

        {/* Right: Details panels */}
        <div className="space-y-6">

          {/* Precio */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-primary-600">Precio</h3>
            <p className="text-3xl font-black text-neutral-900">
              {vehicle.currency}{" "}
              {Number(vehicle.price).toLocaleString("es-UY")}
            </p>
            <span className={cn(
              "mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
              vehicle.condition === "NEW" ? "bg-blue-50 text-blue-700" : "bg-neutral-100 text-neutral-600"
            )}>
              {vehicle.condition === "NEW" ? "0 km / Nuevo" : "Usado"}
            </span>
          </div>

          {/* Especificaciones */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-primary-600">Especificaciones</h3>
            <dl className="space-y-3">
              {[
                { icon: Calendar, label: "Año", value: vehicle.year },
                { icon: Gauge, label: "Kilometraje", value: vehicle.mileage != null ? `${Number(vehicle.mileage).toLocaleString("es-UY")} km` : "-" },
                { icon: Fuel, label: "Combustible", value: vehicle.fuelType || "-" },
                { icon: Settings2, label: "Transmisión", value: vehicle.transmission || "-" },
                { icon: Palette, label: "Color", value: vehicle.color || "-" },
                { icon: Car, label: "Motor", value: vehicle.engineSize || "-" },
                { icon: DoorOpen, label: "Puertas", value: vehicle.doors ?? "-" },
                { icon: Users, label: "Plazas", value: vehicle.seats ?? "-" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Icon className="h-3.5 w-3.5" />
                    <dt className="text-xs font-medium">{label}</dt>
                  </div>
                  <dd className="text-sm font-bold text-neutral-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Automotora / Vendedor */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-primary-600">Vendedor</h3>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                {vehicle.dealerId ? <Building2 className="h-5 w-5 text-neutral-500" /> : <User2 className="h-5 w-5 text-neutral-500" />}
              </div>
              <div>
                <p className="font-bold text-neutral-900">
                  {vehicle.dealer?.businessName || vehicle.owner?.name || "Sin asignar"}
                </p>
                <p className="text-xs text-neutral-400 uppercase tracking-tighter">
                  {vehicle.dealerId ? "Automotora" : "Particular"}
                </p>
                {vehicle.dealer?.city && (
                  <p className="mt-0.5 text-xs text-neutral-500">{vehicle.dealer.city}</p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-primary-600">Información</h3>
            <dl className="space-y-3">
              {[
                { label: "ID", value: vehicle.id?.slice(0, 12) + "..." },
                { label: "Tipo", value: vehicle.vehicleType || "-" },
                { label: "Creado", value: vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString("es-UY") : "-" },
                { label: "Actualizado", value: vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleDateString("es-UY") : "-" },
                { label: "Imágenes", value: `${images.length} foto${images.length !== 1 ? "s" : ""}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-xs font-medium text-neutral-500">{label}</dt>
                  <dd className="text-xs font-bold text-neutral-700">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
