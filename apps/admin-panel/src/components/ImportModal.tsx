"use client";

import { useState } from "react";
import { Download, FileUp, Loader2, Search, X } from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setResults(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/inventory/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResults(data);
      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error importing inventory", error);
      alert("Error al importar el inventario");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    window.location.href = "/api/inventory/template";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-bold text-neutral-900">Importar Inventario</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8">
          {!results ? (
            <div className="space-y-6">
              <div 
                className="group relative h-40 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-6 text-center transition-all hover:bg-neutral-50 hover:border-primary-400"
              >
                <div className="mb-4 rounded-full bg-primary-50 p-3 text-primary-600 group-hover:bg-primary-100 transition-colors">
                  <FileUp className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium text-neutral-600">
                  {file ? (
                    <span className="font-bold text-primary-600">{file.name}</span>
                  ) : (
                    <>Arrastrá un archivo o hacé clic para subir <span className="block text-xs text-neutral-400 mt-1">.xlsx, .xls o .csv</span></>
                  )}
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={downloadTemplate}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-50 active:scale-95"
                >
                  <Download className="h-4 w-4" /> Descargar Plantilla
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-4 text-sm font-extrabold text-white transition-all shadow-lg shadow-primary-100 hover:bg-primary-700 disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Importar {file ? "Inventario" : ""}</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl bg-neutral-50 p-6 border border-neutral-200">
                <h4 className="text-sm font-black text-neutral-800 uppercase tracking-widest mb-4">Resumen de Carga</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white p-4 shadow-sm border border-neutral-100">
                    <p className="text-xs font-bold text-neutral-500 uppercase">Éxito</p>
                    <p className="text-2xl font-black text-emerald-600">{results.results.success}</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm border border-neutral-100">
                    <p className="text-xs font-bold text-neutral-500 uppercase">Errores</p>
                    <p className="text-2xl font-black text-red-600">{results.results.errors.length}</p>
                  </div>
                </div>
              </div>

              {results.results.errors.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-neutral-100 bg-neutral-50 p-4 space-y-2">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider pl-1 font-mono">Detalles de Errores</p>
                  {results.results.errors.map((err: any, idx: number) => (
                    <div key={idx} className="flex gap-3 text-xs p-2 bg-white rounded-lg border border-red-50 text-neutral-600">
                      <span className="font-bold text-red-400 px-1.5 py-0.5 bg-red-50 rounded min-w-[3rem] text-center">Fila {err.row}</span>
                      <span className="flex-1">{err.error}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => { setResults(null); setFile(null); }}
                className="w-full rounded-xl bg-neutral-900 py-3.5 text-sm font-bold text-white transition-all hover:bg-neutral-800 active:scale-95"
              >
                Cargar otro archivo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
