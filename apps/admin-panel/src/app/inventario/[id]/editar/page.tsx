"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Loader2, Save, Check,
  Car, Info, Image as ImageIcon, X, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Datos Generales", icon: Info },
  { id: 2, label: "Características", icon: Car },
  { id: 3, label: "Imágenes", icon: ImageIcon },
];

export default function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Master data
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);

  // Gallery state
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);

  const [form, setForm] = useState({
    // Step 1 – Datos Generales
    title: "",
    description: "",
    status: "DRAFT",
    condition: "USED",
    brandId: "",
    modelId: "",
    vehicleType: "",
    // Step 2 – Características
    year: new Date().getFullYear(),
    mileage: 0,
    price: 0,
    currency: "USD",
    fuelType: "Nafta",
    transmission: "Manual",
    color: "",
    engineSize: "",
    doors: 4,
    seats: 5,
  });

  // ─── Load vehicle and master data ─────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/inventory/${id}`),
      fetch("/api/brands"),
    ]).then(async ([vehicleRes, brandsRes]) => {
      if (vehicleRes.ok) {
        const v = await vehicleRes.json();
        const imgs = v.images || [];
        setExistingImages(imgs);
        // Set the initial cover image ID from the existing data
        const currentCover = imgs.find((img: any) => img.isCover);
        setCoverImageId(currentCover?.id || imgs[0]?.id || null);
        setForm({
          title: v.title || "",
          description: v.description || "",
          status: v.status || "DRAFT",
          condition: v.condition || "USED",
          brandId: v.brandId || "",
          modelId: v.modelId || "",
          vehicleType: v.vehicleType || "",
          year: v.year || new Date().getFullYear(),
          mileage: v.mileage || 0,
          price: v.price || 0,
          currency: v.currency || "USD",
          fuelType: v.fuelType || "Nafta",
          transmission: v.transmission || "Manual",
          color: v.color || "",
          engineSize: v.engineSize || "",
          doors: v.doors || 4,
          seats: v.seats || 5,
        });
        if (v.brandId) {
          const mRes = await fetch(`/api/models?brandId=${v.brandId}&limit=1000`);
          if (mRes.ok) {
            const mData = await mRes.json();
            setModels(mData.models || []);
          }
        }
      } else {
        router.push("/inventario");
      }
      if (brandsRes.ok) setBrands(await brandsRes.json());
      setLoading(false);
    });
  }, [id]);

  const handleBrandChange = async (brandId: string) => {
    setForm(f => ({ ...f, brandId, modelId: "", vehicleType: "" }));
    if (!brandId) { setModels([]); return; }
    const mRes = await fetch(`/api/models?brandId=${brandId}&limit=1000`);
    if (mRes.ok) {
      const mData = await mRes.json();
      setModels(mData.models || []);
    }
  };

  const handleModelChange = (modelId: string) => {
    const selected = models.find(m => m.id === modelId);
    setForm(f => ({ ...f, modelId, vehicleType: selected?.vehicleType || "" }));
  };

  // ─── Save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError("");

    let uploadedImages: any[] = [];
    if (newGalleryFiles.length > 0) {
      const uploadData = new FormData();
      uploadData.append("folder", "vehicles");
      newGalleryFiles.forEach(f => uploadData.append("files", f));

      const upRes = await fetch("/api/upload", { method: "POST", body: uploadData });
      if (upRes.ok) {
        const result = await upRes.json();
        if (result.files) {
          uploadedImages = result.files.map((f: any, i: number) => ({
            url: f.url,
            r2Key: f.r2Key,
            isCover: existingImages.length === 0 && i === 0,
          }));
        }
      } else {
        setError("Error al subir imágenes.");
        setSaving(false);
        return;
      }
    }

    const payload = {
      ...form,
      ...(coverImageId && { coverImageId }),
      ...(uploadedImages.length > 0 && { newImages: uploadedImages }),
    };

    const res = await fetch(`/api/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push(`/inventario/${id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Error al guardar los cambios.");
    }
    setSaving(false);
  };

  // ─── Guards ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all";
  const labelCls = "block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5";
  const selectCls = inputCls;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/inventario/${id}`)}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Editar Publicación</h1>
          <p className="text-sm text-neutral-500">Modificá los datos de este vehículo.</p>
        </div>
      </div>

      {/* ── Step Indicator ── */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, idx) => {
          const isActive = step === s.id;
          const isDone = step > s.id;
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <button
                onClick={() => isDone && setStep(s.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 flex-1 group",
                  isDone ? "cursor-pointer" : "cursor-default"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                  isActive && "border-primary bg-primary text-white shadow-lg shadow-primary-200",
                  isDone && "border-emerald-500 bg-emerald-500 text-white",
                  !isActive && !isDone && "border-neutral-200 bg-white text-neutral-400"
                )}>
                  {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={cn(
                  "text-[11px] font-bold uppercase tracking-wider text-center",
                  isActive ? "text-primary-600" : isDone ? "text-emerald-600" : "text-neutral-400"
                )}>
                  {s.label}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "mb-5 h-0.5 flex-1 transition-all",
                  step > s.id ? "bg-emerald-400" : "bg-neutral-200"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step content card ── */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">

        {/* ─── STEP 1: Datos Generales ─── */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary-600">Datos Generales</h2>

            <div>
              <label className={labelCls}>Título de la publicación *</label>
              <input
                required
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className={inputCls}
                placeholder="Ej: Toyota Hilux 2024 GR Sport 4WD"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Marca *</label>
                <select
                  value={form.brandId}
                  onChange={e => handleBrandChange(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Seleccionar marca...</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Modelo *</label>
                <select
                  value={form.modelId}
                  onChange={e => handleModelChange(e.target.value)}
                  disabled={!form.brandId}
                  className={cn(selectCls, !form.brandId && "opacity-50")}
                >
                  <option value="">Seleccionar modelo...</option>
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {form.vehicleType && (
              <div className="flex items-center gap-2 rounded-xl bg-primary-50 border border-primary-100 px-4 py-2.5">
                <Car className="h-4 w-4 text-primary-500" />
                <span className="text-sm font-bold text-primary-700">Tipo de vehículo: {form.vehicleType}</span>
                <span className="text-xs text-primary-500">(definido por el modelo)</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Estado de publicación</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={selectCls}>
                  <option value="DRAFT">Borrador</option>
                  <option value="ACTIVE">Activa</option>
                  <option value="PAUSED">Pausada</option>
                  <option value="SOLD">Vendida</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Condición</label>
                <div className="flex gap-2 mt-1">
                  {[{ v: "USED", l: "Usado" }, { v: "NEW", l: "0KM / Nuevo" }].map(opt => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, condition: opt.v }))}
                      className={cn(
                        "flex-1 rounded-xl py-2.5 text-xs font-bold border transition-all",
                        form.condition === opt.v
                          ? "bg-primary-50 border-primary-200 text-primary-700 shadow-sm"
                          : "bg-white border-neutral-200 text-neutral-400 hover:border-neutral-300"
                      )}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Descripción</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                className={cn(inputCls, "resize-none")}
                placeholder="Describí detalles adicionales del vehículo..."
              />
            </div>
          </div>
        )}

        {/* ─── STEP 2: Características ─── */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary-600">Características del Vehículo</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Precio *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Moneda</label>
                <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className={selectCls}>
                  <option value="USD">USD</option>
                  <option value="UYU">UYU</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Año</label>
                <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Kilometraje</label>
                <input type="number" value={form.mileage} onChange={e => setForm(f => ({ ...f, mileage: parseInt(e.target.value) }))} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Combustible</label>
                <select value={form.fuelType} onChange={e => setForm(f => ({ ...f, fuelType: e.target.value }))} className={selectCls}>
                  <option>Nafta</option>
                  <option>Diesel</option>
                  <option>Híbrido</option>
                  <option>Eléctrico</option>
                  <option>GNC</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Transmisión</label>
                <select value={form.transmission} onChange={e => setForm(f => ({ ...f, transmission: e.target.value }))} className={selectCls}>
                  <option>Manual</option>
                  <option>Automática</option>
                  <option>Secuencial</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Color</label>
                <input type="text" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className={inputCls} placeholder="Blanco perla" />
              </div>
              <div>
                <label className={labelCls}>Motor</label>
                <input type="text" value={form.engineSize} onChange={e => setForm(f => ({ ...f, engineSize: e.target.value }))} className={inputCls} placeholder="2.8 TDI" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Puertas</label>
                <input type="number" value={form.doors} onChange={e => setForm(f => ({ ...f, doors: parseInt(e.target.value) }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Plazas</label>
                <input type="number" value={form.seats} onChange={e => setForm(f => ({ ...f, seats: parseInt(e.target.value) }))} className={inputCls} />
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Imágenes ─── */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary-600">Galería de Imágenes</h2>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase mb-3">Imágenes actuales ({existingImages.length})</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {existingImages.map((img) => {
                    const isCover = img.id === coverImageId;
                    return (
                      <div key={img.id} className={cn(
                        "relative group rounded-xl overflow-hidden border-2 aspect-square bg-neutral-50 transition-all",
                        isCover ? "border-yellow-400 shadow-md shadow-yellow-100" : "border-neutral-200"
                      )}>
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                        {/* Portada pill */}
                        {isCover && (
                          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-bold text-yellow-300 backdrop-blur-sm">
                            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                            Portada
                          </div>
                        )}
                        {/* Mark as cover button — only on non-cover images */}
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => setCoverImageId(img.id)}
                            title="Marcar como portada"
                            className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                          >
                            <Star className="h-5 w-5" />
                            Marcar portada
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-neutral-400">
                  Hacé hover sobre una imagen y clic en ★ para cambiar la portada.
                  Las nuevas imágenes subidas se agregan al final.
                </p>
              </div>
            )}

            {/* Upload new images */}
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase mb-3">Agregar nuevas imágenes</p>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-8 text-neutral-400 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-500 transition-all">
                <ImageIcon className="h-8 w-8" />
                <div className="text-center">
                  <p className="text-sm font-bold">Hacé clic para subir imágenes</p>
                  <p className="text-xs">JPG, PNG, WEBP — múltiples archivos permitidos</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    setNewGalleryFiles(prev => [...prev, ...files]);
                  }}
                />
              </label>
            </div>

            {/* Preview of new files */}
            {newGalleryFiles.length > 0 && (
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase mb-3">
                  Nuevas a subir ({newGalleryFiles.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {newGalleryFiles.map((file, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-neutral-200 aspect-square bg-neutral-50">
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setNewGalleryFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {existingImages.length === 0 && idx === 0 && (
                        <div className="absolute top-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-yellow-300 backdrop-blur-sm">
                          Portada
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => step > 1 ? setStep(s => s - 1) : router.push(`/inventario/${id}`)}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-bold text-neutral-500 hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? "Cancelar" : "Anterior"}
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={step === 1 && (!form.title || !form.brandId || !form.modelId)}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-md shadow-primary-200 active:scale-95 disabled:opacity-40"
          >
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-8 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        )}
      </div>
    </div>
  );
}
