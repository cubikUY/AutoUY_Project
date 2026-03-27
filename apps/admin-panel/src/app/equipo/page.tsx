"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Plus, 
  Loader2, 
  Edit2, 
  X, 
  Save, 
  ShieldCheck,
  User as UserIcon,
  Mail,
  Phone,
  ShieldAlert,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EquipoPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    staffRole: "SALES",
    isActive: true,
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        setStaff(await res.json());
      }
    } catch (error) {
      console.error("Error fetching staff", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingUser ? "PATCH" : "POST";
      const body = editingUser ? { ...formData, id: editingUser.id } : formData;

      const res = await fetch("/api/staff", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "", phone: "", staffRole: "SALES", isActive: true });
        fetchStaff();
      } else {
          const err = await res.json();
          alert(err.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving staff member", error);
    }
    setSaving(false);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email || "",
      password: "", // No se edita el password aquí por seguridad en este MVP
      phone: user.phone || "",
      staffRole: user.staffRole || "SALES",
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
            Mi Equipo de Ventas
          </h1>
          <p className="text-neutral-500">
            Gestioná los vendedores y colaboradores de tu automotora.
          </p>
        </div>
        <button
          onClick={() => { 
            setEditingUser(null); 
            setFormData({ name: "", email: "", password: "", phone: "", staffRole: "SALES", isActive: true }); 
            setIsModalOpen(true); 
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" /> Nuevo Vendedor
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
        </div>
      ) : staff.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-neutral-200 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300 mb-4">
                <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Tu equipo está vacío</h3>
            <p className="text-neutral-500 max-w-xs mx-auto mt-2">Agregá vendedores para que puedan gestionar sus propios leads y stock.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((user) => (
            <div key={user.id} className={cn(
                "group relative rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-all",
                !user.isActive && "opacity-60 bg-neutral-50"
            )}>
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    "p-3 rounded-2xl text-white font-bold text-lg flex items-center justify-center w-12 h-12",
                    user.staffRole === "OWNER" ? "bg-primary-600" : "bg-neutral-800"
                )}>
                  {user.name[0].toUpperCase()}
                </div>
                <div className="flex gap-2">
                    <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        user.staffRole === "OWNER" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    )}>
                        {user.staffRole === "OWNER" ? "Dueño" : "Vendedor"}
                    </span>
                    <button onClick={() => handleEdit(user)} className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-opacity">
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-neutral-900 mb-1">{user.name}</h3>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Mail className="w-4 h-4 text-neutral-400" /> {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Phone className="w-4 h-4 text-neutral-400" /> {user.phone}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-neutral-50">
                  <div className="flex items-center gap-1.5">
                      {user.isActive ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                          <XCircle className="w-4 h-4 text-neutral-400" />
                      )}
                      <span className="text-xs font-medium text-neutral-500">
                          {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">
                      Miembro desde {new Date(user.createdAt).toLocaleDateString()}
                  </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900">{editingUser ? "Editar Miembro" : "Nuevo Miembro del Equipo"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                 <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1.5 ml-1">Nombre Completo</label>
                 <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                    <input 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Ej. Juan Pérez"
                        className="w-full rounded-xl border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                    />
                 </div>
               </div>

               <div>
                 <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1.5 ml-1">Email (Acceso)</label>
                 <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                    <input 
                        required
                        type="email"
                        disabled={!!editingUser}
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="vendedor@empresa.com"
                        className="w-full rounded-xl border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all disabled:opacity-50"
                    />
                 </div>
               </div>

               {!editingUser && (
                <div>
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1.5 ml-1">Contraseña Inicial</label>
                    <input 
                        required
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder="Min. 6 caracteres"
                        className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                    />
                </div>
               )}

               <div>
                 <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1.5 ml-1">Teléfono</label>
                 <input 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+598 99 123 456"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition-all"
                 />
               </div>

               <div>
                 <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1.5 ml-1">Rol en el Equipo</label>
                 <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, staffRole: "SALES"})}
                        className={cn(
                            "flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all",
                            formData.staffRole === "SALES" ? "border-primary-600 bg-primary-50 text-primary-700" : "border-neutral-100 bg-neutral-50 text-neutral-500"
                        )}
                    >
                        Vendedor
                    </button>
                    <button
                        type="button"
                        disabled={editingUser?.staffRole === "OWNER"} // No dejarse bajar de rango a si mismo si es unico dueño? 
                        onClick={() => setFormData({...formData, staffRole: "OWNER"})}
                        className={cn(
                            "flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all",
                            formData.staffRole === "OWNER" ? "border-amber-600 bg-amber-50 text-amber-700" : "border-neutral-100 bg-neutral-50 text-neutral-500"
                        )}
                    >
                        Dueño
                    </button>
                 </div>
                 {formData.staffRole === "SALES" && (
                     <p className="flex items-start gap-1.5 text-[10px] text-neutral-400 mt-2 px-1">
                        <ShieldAlert className="w-3 h-3 shrink-0" />
                        Los vendedores no tienen permiso para cambiar precios de vehículos publicados.
                     </p>
                 )}
               </div>

               {editingUser && (
                   <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                       <span className="text-xs font-bold text-neutral-800">Acceso Habilitado</span>
                       <button 
                        type="button"
                        onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                        className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            formData.isActive ? "bg-primary-600" : "bg-neutral-300"
                        )}
                       >
                           <span className={cn(
                               "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                               formData.isActive ? "translate-x-6" : "translate-x-1"
                           )} />
                       </button>
                   </div>
               )}

               <button
                 type="submit"
                 disabled={saving}
                 className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
               >
                 {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                 {editingUser ? "Guardar Cambios" : "Crear Acceso"}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
