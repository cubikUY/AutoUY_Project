"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, User, Mail, Shield, Smartphone, Trash2, Edit2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

type Role = "ADMIN" | "DEALER" | "CLIENT";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  phone?: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  
  // Filters state
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // "ALL", "ACTIVE", "INACTIVE"
  
  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENT" as Role,
    phone: "",
    isActive: true,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Don't show password hash
        role: user.role,
        phone: user.phone || "",
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "CLIENT",
        phone: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingUser) {
        await axios.put("/api/users", { id: editingUser.id, ...formData });
      } else {
        await axios.post("/api/users", formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || "Error saving user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (user: UserData) => {
    if (!confirm(`¿Estás seguro de que querés desactivar al usuario ${user.name}?`)) return;
    try {
      await axios.delete(`/api/users?id=${user.id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || 
                          (statusFilter === "ACTIVE" && u.isActive) || 
                          (statusFilter === "INACTIVE" && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in transition-all duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Gestión de Usuarios</h1>
          <p className="text-neutral-500 font-medium">Administra los roles y accesos de todo el sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary-200 transition-all hover:bg-primary-700 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filters & Search */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full rounded-2xl border border-neutral-100 bg-neutral-50 py-3 pl-12 pr-4 text-sm transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary-50 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Role Filter */}
            <select
              className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold transition-all focus:border-primary focus:bg-white focus:outline-none min-w-[150px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | "ALL")}
            >
              <option value="ALL">TODOS LOS ROLES</option>
              <option value="CLIENT">CLIENTES</option>
              <option value="DEALER">DEALERS</option>
              <option value="ADMIN">ADMINS</option>
            </select>

            {/* Status Filter */}
            <select
              className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold transition-all focus:border-primary focus:bg-white focus:outline-none min-w-[150px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">TODOS LOS ESTADOS</option>
              <option value="ACTIVE">ACTIVOS</option>
              <option value="INACTIVE">INACTIVOS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-neutral-400">Usuario</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-neutral-400">Rol</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-neutral-400">Estado</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-neutral-400">Creado</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-neutral-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
                    <p className="mt-4 text-sm font-bold text-neutral-500">Cargando usuarios...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-sm font-bold text-neutral-500">No se encontraron usuarios.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-neutral-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 font-bold">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900 group-hover:text-primary-700 transition-colors uppercase tracking-tight">{user.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                        user.role === "ADMIN" ? "bg-red-50 text-red-700 border border-red-100" :
                        user.role === "DEALER" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        "bg-blue-50 text-blue-700 border border-blue-100"
                      )}>
                        <Shield className="h-3 w-3" />
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                        user.isActive 
                          ? "bg-green-50 text-green-700" 
                          : "bg-neutral-100 text-neutral-500"
                      )}>
                        {user.isActive ? (
                          <><CheckCircle2 className="h-3 w-3" /> Activo</>
                        ) : (
                          <><XCircle className="h-3 w-3" /> Inactivo</>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-neutral-500">
                        {new Date(user.createdAt).toLocaleDateString("es-UY", { 
                          day: "2-digit", 
                          month: "short", 
                          year: "numeric" 
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all active:scale-90"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                          title="Desactivar"
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

      {/* Modal User Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-neutral-900">
                  {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                </h2>
                <p className="text-sm font-medium text-neutral-500">Completa los datos para habilitar el acceso al sistema.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-2xl hover:bg-neutral-100 transition-colors"
              >
                <XCircle className="h-6 w-6 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez"
                      className="w-full rounded-2xl border border-neutral-100 bg-neutral-50 py-3.5 pl-12 pr-4 text-sm font-medium transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary-50 focus:outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                    <input
                      type="email"
                      required
                      placeholder="juan@ejemplo.com"
                      className="w-full rounded-2xl border border-neutral-100 bg-neutral-50 py-3.5 pl-12 pr-4 text-sm font-medium transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary-50 focus:outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Contraseña {editingUser && "(Opcional)"}</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                    <input
                      type="password"
                      required={!editingUser}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-neutral-100 bg-neutral-50 py-3.5 pl-12 pr-4 text-sm font-medium transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary-50 focus:outline-none"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Rol en el Sistema</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300 z-10" />
                    <select
                      className="w-full appearance-none rounded-2xl border border-neutral-100 bg-neutral-50 py-3.5 pl-12 pr-4 text-sm font-bold transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary-50 focus:outline-none"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                    >
                      <option value="CLIENT">CLIENTE (Comprador)</option>
                      <option value="DEALER">DEALER (Automotora)</option>
                      <option value="ADMIN">ADMINISTRADOR</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Teléfono</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                    <input
                      type="tel"
                      placeholder="09X XXX XXX"
                      className="w-full rounded-2xl border border-neutral-100 bg-neutral-50 py-3.5 pl-12 pr-4 text-sm font-medium transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary-50 focus:outline-none"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-neutral-100 transition-all after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                  </label>
                  <span className="text-sm font-bold text-neutral-600 tracking-tight">Usuario Activo</span>
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row gap-4 pt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-2xl border border-neutral-200 py-4 text-sm font-bold text-neutral-500 transition-all hover:bg-neutral-50 active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 text-sm font-bold text-white shadow-xl shadow-primary-200 transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-50"
                >
                  {formLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : editingUser ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
