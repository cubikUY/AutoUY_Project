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
    let where: any = {};

    if (role === "DEALER") {
      const salesmanRole = (session.user as any).staffRole;
      const dealerId = (session.user as any).dealerId;

      if (salesmanRole === "SALES") {
        // Si es vendedor, solo ve los leads asignados a él O de sus vehículos
        where = {
          OR: [
            { salesmanId: userId },
            { vehicle: { salesmanId: userId } }
          ]
        };
      } else {
        // Ve todo lo de la automotora (es dueño o el usuario base)
        where = {
            OR: [
              { vehicle: { ownerId: userId } },
              { vehicle: { dealer: { ownerId: userId } } },
              { vehicle: { dealerId: dealerId } }
            ]
        };
      }
    } else if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            price: true,
            currency: true,
            images: {
              where: { isCover: true },
              take: 1,
              select: { url: true }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("[Leads GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
