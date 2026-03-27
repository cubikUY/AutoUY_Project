"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  vehicle?: any; // If null, it's a "New" vehicle
}

export default function VehicleModal({ isOpen, onClose, onSave, vehicle }: VehicleModalProps) {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    vehicleType: "AUTO",
    condition: "USED",
    status: "DRAFT",
    brandId: "",
    modelId: "",
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
    dealerId: "",
    branchId: "",
    isFeatured: false,
  });

  useEffect(() => {
    if (isOpen) {
      fetchMasterData();
      if (vehicle) {
        setFormData({
          title: vehicle.title || "",
          description: vehicle.description || "",
          vehicleType: vehicle.vehicleType || "AUTO",
          condition: vehicle.condition || "USED",
          status: vehicle.status || "DRAFT",
          brandId: vehicle.brandId || "",
          modelId: vehicle.modelId || "",
          year: vehicle.year || new Date().getFullYear(),
          mileage: vehicle.mileage || 0,
          price: vehicle.price || 0,
          currency: vehicle.currency || "USD",
          fuelType: vehicle.fuelType || "Nafta",
          transmission: vehicle.transmission || "Manual",
          color: vehicle.color || "",
          engineSize: vehicle.engineSize || "",
          doors: vehicle.doors || 4,
          seats: vehicle.seats || 5,
          dealerId: vehicle.dealerId || "",
          branchId: vehicle.branchId || "",
          isFeatured: vehicle.isFeatured || false,
        });
        setGalleryFiles([]);
        if (vehicle.brandId) fetchModels(vehicle.brandId);
      } else {
        setFormData({
          title: "",
          description: "",
          vehicleType: "AUTO",
          condition: "USED",
          status: "DRAFT",
          brandId: "",
          modelId: "",
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
          dealerId: "",
          branchId: "",
          isFeatured: false,
        });
        setGalleryFiles([]);
      }
    }
  }, [isOpen, vehicle]);

  const fetchMasterData = async () => {
    try {
      const [brandsRes, dealersRes] = await Promise.all([
        fetch("/api/brands"),
        fetch("/api/dealers")
      ]);
      if (brandsRes.ok) setBrands(await brandsRes.json());
      if (dealersRes.ok) setDealers(await dealersRes.json());
      
      const branchesRes = await fetch("/api/branches");
      if (branchesRes.ok) setBranches(await branchesRes.json());
    } catch (error) {
      console.error("Error fetching master data", error);
    }
  };

  const fetchModels = async (brandId: string) => {
    try {
      // The API now returns a paginated response: { models: [...], total, page, limit }
      // To ensure all models for the dropdown are fetched (or at least a large batch), 
      // we append limit=1000 to the query.
      const res = await fetch(`/api/models?brandId=${brandId}&limit=1000`);
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
      }
    } catch (error) {
      console.error("Error fetching models", error);
    }
  };

  const handleBrandChange = (brandId: string) => {
    setFormData({ ...formData, brandId, modelId: "" });
    fetchModels(brandId);
  };

  const handleModelChange = (modelId: string) => {
    const selectedModel = models.find(m => m.id === modelId);
    setFormData({ 
      ...formData, 
      modelId, 
      vehicleType: selectedModel?.vehicleType || "AUTO" 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Find the ownerId from the selected dealer
    const selectedDealer = dealers.find(d => d.id === formData.dealerId);
    if (!selectedDealer && !vehicle) {
      alert("Debes seleccionar una automotora");
      setLoading(false);
      return;
    }

    // Upload images first
    let uploadedImagesPayload: any[] = [];
    if (galleryFiles.length > 0) {
      const uploadData = new FormData();
      uploadData.append("folder", "vehicles");
      galleryFiles.forEach((file) => {
        uploadData.append("files", file);
      });

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (uploadRes.ok) {
          const result = await uploadRes.json();
          if (result.files) {
            uploadedImagesPayload = result.files.map((f: any, index: number) => ({
              url: f.url,
              r2Key: f.r2Key,
              isCover: index === 0,
            }));
          }
        } else {
          alert("Error subiendo imágenes");
          setLoading(false);
          return;
        }
      } catch (err) {
        alert("Error de red al subir imágenes");
        setLoading(false);
        return;
      }
    }

    const payload = {
      ...formData,
      ownerId: selectedDealer?.userId || vehicle?.ownerId,
      ...(uploadedImagesPayload.length > 0 && { newImages: uploadedImagesPayload }),
    };

    const method = vehicle ? "PUT" : "POST";
    const url = vehicle ? `/api/inventory/${vehicle.id}` : "/api/inventory";

    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        onSave();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Error al guardar vehículo");
      }
    } catch (error) {
      console.error("Error saving vehicle", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 p-6">
          <div>
            <h2 className="text-xl font-black text-neutral-900">
              {vehicle ? "Editar Vehículo" : "Nueva Publicación"}
            </h2>
            <p className="text-sm text-neutral-500">Completá los datos técnicos y comerciales.</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-neutral-100 transition-colors">
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Básicos */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-primary-600 tracking-widest pl-1">Información Básica</h4>
              
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Título</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="Ej: Toyota Hilux 2024 GR Sport..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Automotora Responsable</label>
                <select
                  required
                  disabled={!!vehicle}
                  value={formData.dealerId}
                  onChange={(e) => setFormData({ ...formData, dealerId: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all disabled:opacity-50"
                >
                  <option value="">Seleccionar automotora...</option>
                  {dealers.map(d => (
                    <option key={d.id} value={d.id}>{d.businessName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Marca</label>
                  <select
                    required
                    value={formData.brandId}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                  >
                    <option value="">Marca...</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Modelo</label>
                  <select
                    required
                    value={formData.modelId}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                    disabled={!formData.brandId}
                  >
                    <option value="">Modelo...</option>
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Precio</label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Moneda</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                  >
                    <option value="USD">USD</option>
                    <option value="UYU">UYU</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Column 2: Especificaciones */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-primary-600 tracking-widest pl-1">Especificaciones</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Año</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Kilometraje</label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Combustible</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                  >
                    <option value="Nafta">Nafta</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Transmisión</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automática">Automática</option>
                    <option value="Secuencial">Secuencial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Motor</label>
                  <input
                    type="text"
                    value={formData.engineSize}
                    onChange={(e) => setFormData({ ...formData, engineSize: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                    placeholder="Ej: 2.4 Turbo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                    placeholder="Blanco"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Puertas</label>
                  <input
                    type="number"
                    value={formData.doors}
                    onChange={(e) => setFormData({ ...formData, doors: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Plazas</label>
                  <input
                    type="number"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Column 3: Configuración */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-primary-600 tracking-widest pl-1">Configuración</h4>
              
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Estado de Publicación</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                >
                  <option value="DRAFT">Borrador</option>
                  <option value="ACTIVE">Activa</option>
                  <option value="PAUSED">Pausada</option>
                  <option value="SOLD">Vendida</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Condición</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, condition: "USED" })}
                    className={cn(
                      "flex-1 rounded-xl py-2.5 text-xs font-bold border transition-all",
                      formData.condition === "USED" ? "bg-primary-50 border-primary-200 text-primary-700 shadow-sm" : "bg-white border-neutral-100 text-neutral-400"
                    )}
                  >
                    Usado
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, condition: "NEW" })}
                    className={cn(
                      "flex-1 rounded-xl py-2.5 text-xs font-bold border transition-all",
                      formData.condition === "NEW" ? "bg-primary-50 border-primary-200 text-primary-700 shadow-sm" : "bg-white border-neutral-100 text-neutral-400"
                    )}
                  >
                    0KM / Nuevo
                  </button>
                </div>
              </div>

              {/* Destacado Toggle */}
              <label className="flex items-center gap-2 mt-4 cursor-pointer group bg-amber-50 rounded-xl p-3 border border-amber-100 hover:bg-amber-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded border-amber-300 focus:ring-amber-500"
                />
                <span className="text-sm font-bold text-amber-700 select-none">
                  🌟 Marcar como Destacado (Promocionado)
                </span>
              </label>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Sucursal / Ubicación Física</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                >
                  <option value="">Ubicación principal (Dealer)</option>
                  {branches.filter(b => !formData.dealerId || b.dealerId === formData.dealerId).map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all resize-none"
                  placeholder="Detalles adicionales del vehículo..."
                />
              </div>

              <div className="pt-4">
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5 pl-1">Galería de Imágenes</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setGalleryFiles((prev) => [...prev, ...files]);
                  }}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-2 py-2 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                
                {galleryFiles.length > 0 && (
                  <div className="mt-4 flex gap-2 flex-wrap bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    {galleryFiles.map((file, idx) => (
                      <div key={idx} className="relative group rounded-md overflow-hidden bg-white shadow-sm border border-neutral-200 flex flex-col items-center p-1 w-20">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="preview" 
                          className="w-full h-12 object-cover rounded-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setGalleryFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {idx === 0 && <span className="text-[8px] font-black uppercase text-primary-600 mt-1">Portada</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-8 mt-8 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-2xl border border-neutral-200 bg-white py-4 text-sm font-bold text-neutral-500 hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] rounded-2xl bg-neutral-900 py-4 text-sm font-bold text-white hover:bg-neutral-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {vehicle ? "Guardar Cambios" : "Publicar Vehículo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
