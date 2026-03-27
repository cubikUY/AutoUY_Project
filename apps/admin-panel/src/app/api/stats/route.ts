import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    let vehicleWhere: any = {};
    let leadWhere: any = {};

    if (role === "DEALER") {
      vehicleWhere = {
        OR: [{ ownerId: userId }, { dealer: { userId: userId } }],
      };
      leadWhere = {
        vehicle: vehicleWhere,
      };
    }

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonthFilter = { createdAt: { gte: startOfCurrentMonth } };
    const previousMonthFilter = { createdAt: { gte: startOfPreviousMonth, lt: startOfCurrentMonth } };

    const [
      totalVehicles,
      activeVehicles,
      currentVehicles,
      previousVehicles,
      totalLeads,
      currentLeads,
      previousLeads,
      totalUsers,
      totalDealers,
      currentUsers,
      previousUsers,
      recentLeads,
    ] = await Promise.all([
      prisma.vehicle.count({ where: vehicleWhere }),
      prisma.vehicle.count({ where: { ...vehicleWhere, status: "ACTIVE" } }),
      prisma.vehicle.count({ where: { ...vehicleWhere, ...currentMonthFilter } }),
      prisma.vehicle.count({ where: { ...vehicleWhere, ...previousMonthFilter } }),
      prisma.lead.count({ where: leadWhere }),
      prisma.lead.count({ where: { ...leadWhere, ...currentMonthFilter } }),
      prisma.lead.count({ where: { ...leadWhere, ...previousMonthFilter } }),
      role === "ADMIN" ? prisma.user.count() : Promise.resolve(0),
      role === "ADMIN" ? prisma.dealerProfile.count() : Promise.resolve(0),
      role === "ADMIN" ? prisma.user.count({ where: currentMonthFilter }) : Promise.resolve(0),
      role === "ADMIN" ? prisma.user.count({ where: previousMonthFilter }) : Promise.resolve(0),
      prisma.lead.findMany({
        where: leadWhere,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: { select: { title: true } },
        },
      }),
    ]);

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const diff = current - previous;
      const pct = (diff / previous) * 100;
      return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
    };

    const stats = {
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
        growth: calculateGrowth(currentVehicles, previousVehicles),
      },
      leads: {
        total: totalLeads,
        growth: calculateGrowth(currentLeads, previousLeads),
      },
      users: {
        total: totalUsers,
        dealers: totalDealers,
        growth: calculateGrowth(currentUsers, previousUsers),
      },
      revenue: {
        total: role === "ADMIN" ? "$142,000" : "-",
        growth: "+2.3%",
      },
      recentLeads,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[Stats API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
