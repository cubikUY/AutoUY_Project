import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const dealers = await prisma.dealerProfile.findMany({
      include: {
        owner: { select: { email: true, name: true } },
        _count: { select: { vehicles: true } },
      },
      orderBy: { businessName: "asc" },
    });
    return NextResponse.json(dealers);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { businessName, rut, phone, email, name, password, city, address, logoUrl } = body;

    if (!businessName || !email || !name || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    if (rut) {
      const existingDealer = await prisma.dealerProfile.findUnique({ where: { rut } });
      if (existingDealer) {
        return NextResponse.json({ error: "RUT already registered" }, { status: 400 });
      }
    }

    // Create User and DealerProfile in a transaction
    const dealer = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          // TODO: Use a proper hashing utility (e.g. bcryptjs) when auth is fully implemented
          passwordHash: password,
          role: "DEALER",
        },
      });

      return tx.dealerProfile.create({
        data: {
          ownerId: user.id,
          businessName,
          rut,
          phone,
          city,
          address,
          logoUrl,
          verified: true, // Admin-created dealers can be verified by default or as per policy
        },
        include: {
          owner: { select: { email: true, name: true } },
          _count: { select: { vehicles: true } },
        },
      });
    });

    return NextResponse.json(dealer, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dealers]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, verified } = await req.json();
    if (!id || verified === undefined) {
      return NextResponse.json({ error: "Id and Verified status are required" }, { status: 400 });
    }

    const dealer = await prisma.dealerProfile.update({
      where: { id },
      data: { verified },
    });
    return NextResponse.json(dealer);
  } catch (error) {
    console.error("[PATCH /api/dealers]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

  export async function PUT(req: Request) {
    try {
      const session = await auth();
      if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id, businessName, rut, phone, email, name, city, address, verified, logoUrl } = await req.json();

    if (!id || !businessName || !email || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update both DealerProfile and User in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      const dealer = await tx.dealerProfile.update({
        where: { id },
        data: {
          businessName,
          rut,
          phone,
          city,
          address,
          logoUrl,
          verified,
          owner: {
            update: {
              email,
              name,
            }
          }
        },
        include: {
          owner: { select: { email: true, name: true } },
          _count: { select: { vehicles: true } },
        }
      });
      return dealer;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/dealers]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }

    // Check if there are associated vehicles
    const vehicleCount = await prisma.vehicle.count({
      where: { dealerId: id }
    });

    if (vehicleCount > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar una automotora con vehículos publicados." 
      }, { status: 400 });
    }

    // Physical delete (DealerProfile first, then User if not needed, but usually we delete both)
    const dealer = await prisma.dealerProfile.findUnique({
      where: { id },
      select: { ownerId: true }
    });

    if (dealer) {
      await prisma.$transaction([
        prisma.dealerProfile.delete({ where: { id } }),
        prisma.user.delete({ where: { id: dealer.ownerId } })
      ]);
    }

    return NextResponse.json({ message: "Automotora eliminada correctamente" });
  } catch (error) {
    console.error("[DELETE /api/dealers]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

