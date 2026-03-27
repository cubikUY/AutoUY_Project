import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status, salesmanId } = await req.json();

  try {
    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const staffRole = (session.user as any).staffRole;
    const userDealerId = (session.user as any).dealerId;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { 
        vehicle: { 
          include: { 
            dealer: true 
          } 
        } 
      }
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Permission Check
    if (role === "DEALER") {
      const isOwner = lead.vehicle.ownerId === userId || lead.vehicle.dealer?.ownerId === userId;
      const isMyDealer = lead.vehicle.dealerId === userDealerId;

      if (!isOwner && !isMyDealer) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Solo el DUEÑO puede reasignar leads
      if (salesmanId && staffRole === "SALES") {
          return NextResponse.json({ error: "Solo los administradores de la automotora pueden reasignar leads." }, { status: 403 });
      }
    } else if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data: any = {};
    if (status) {
        const allowedStatuses = ["NEW", "CONTACTED", "CLOSED"];
        if (!allowedStatuses.includes(status)) {
          return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        data.status = status;
    }
    if (salesmanId) {
        data.salesmanId = salesmanId;
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("[Leads PATCH Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
