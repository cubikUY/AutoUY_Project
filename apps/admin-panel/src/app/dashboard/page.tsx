/**
 * @stitch-screen c68aa45e823148e6a810c97351e0a495
 * @stitch-project 16463981372665945842
 * @stitch-title Dashboard KPIs — Admin
 */

import {
  Car,
  Users,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

async function getStats() {
  const res = await fetch("http://localhost:3005/api/stats", {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function DashboardPage() {
  const stats = await getStats();

  if (!stats) return <div>Cargando estadísticas...</div>;

  const cards = [
    {
      label: "Vehículos Activos",
      value: stats.vehicles.active,
      total: stats.vehicles.total,
      growth: stats.vehicles.growth,
      icon: Car,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Consultas Recibidas",
      value: stats.leads.total,
      growth: stats.leads.growth,
      icon: MessageSquare,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Usuarios Totales",
      value: stats.users.total,
      sub: `${stats.users.dealers} Automotoras`,
      growth: stats.users.growth,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Ingresos Estimados",
      value: stats.revenue.total,
      growth: stats.revenue.growth,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
          Panel de Control
        </h1>
        <p className="text-neutral-500">
          Resumen general del estado del marketplace hoy.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Content = (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className={card.bg + " rounded-xl p-2 " + card.color}>
                  <card.icon className="h-6 w-6" />
                </div>
                {card.growth.startsWith("-") ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-red-600">
                    {card.growth} <ArrowDownRight className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    {card.growth} <ArrowUpRight className="h-3 w-3" />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-neutral-500">{card.label}</p>
                <h3 className="text-2xl font-black text-neutral-900">
                  {card.value}
                </h3>
                {card.sub && (
                  <p className="mt-1 text-xs text-neutral-400">{card.sub}</p>
                )}
              </div>
            </div>
          );

          if (card.label === "Consultas Recibidas") {
            return (
              <Link
                key={card.label}
                href="/consultas"
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-100 transition-all hover:shadow-md hover:border-primary-200"
              >
                {Content}
              </Link>
            );
          }

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-100 transition-all hover:shadow-md"
            >
              {Content}
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Actividad Reciente</h2>
            <Link href="/consultas" className="text-sm font-bold text-primary-600 hover:underline">
              Ver todo
            </Link>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm shadow-neutral-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Cliente</th>
                  <th className="px-6 py-4 font-bold">Vehículo</th>
                  <th className="px-6 py-4 font-bold">Estado</th>
                  <th className="px-6 py-4 font-bold">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 italicize">
                {stats.recentLeads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-neutral-50 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-neutral-900">{lead.name}</div>
                      <div className="text-xs text-neutral-400">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 font-medium">
                      {lead.vehicle.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / System Health */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-neutral-900">Estado del Sistema</h2>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-medium text-neutral-700">API Gateway</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-medium text-neutral-700">Database</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                <span className="text-sm font-medium text-neutral-700">Image Processing</span>
              </div>
              <span className="text-xs font-bold text-amber-600 uppercase">High Load</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
