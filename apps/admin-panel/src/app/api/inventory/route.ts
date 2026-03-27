import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logAction } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const vehicles = await prisma.vehicle.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...((session.user as any).role === "DEALER" 
          ? { 
              OR: [
                { ownerId: (session.user as any).id },
                { dealerId: (session.user as any).dealerId }
              ]
            } 
          : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { brand: { name: { contains: search, mode: "insensitive" } } },
                { model: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        brand: { select: { name: true } },
        model: { select: { name: true } },
        dealer: { select: { businessName: true } },
        owner: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Basic validation
    if (!body.title || !body.brandId || !body.modelId || !body.price || !body.ownerId) {
      return NextResponse.json({ error: "Missing required fields (title, brand, model, price, owner)" }, { status: 400 });
    }

    // Fetch model to get its vehicleType
    const model = await prisma.model.findUnique({
      where: { id: body.modelId },
      select: { vehicleType: true }
    });
    
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        title: body.title,
        description: body.description,
        vehicleType: model.vehicleType,
        condition: body.condition || "USED",
        year: parseInt(body.year),
        mileage: parseInt(body.mileage || 0),
        price: body.price,
        currency: body.currency || "USD",
        fuelType: body.fuelType,
        transmission: body.transmission,
        color: body.color,
        engineSize: body.engineSize,
        doors: body.doors ? parseInt(body.doors) : null,
        seats: body.seats ? parseInt(body.seats) : null,
        brandId: body.brandId,
        modelId: body.modelId,
        ownerId: body.ownerId,
        dealerId: body.dealerId,
        branchId: body.branchId || null,
        salesmanId: (session.user as any).id,
        isFeatured: body.isFeatured || false,
        status: body.status || "DRAFT",
        ...(body.newImages && {
          images: {
            create: body.newImages.map((img: any) => ({
              url: img.url,
              r2Key: img.r2Key,
              isCover: img.isCover,
            })),
          },
        }),
      },
    });

    await logAction({
      userId: (session.user as any).id,
      action: "CREATE",
      entity: "VEHICLE",
      entityId: vehicle.id,
      details: `Vehículo creado: ${vehicle.title}`,
      newValue: vehicle,
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("[Vehicle POST Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Id and Status are required" }, { status: 400 });
    }

    const oldVehicle = await prisma.vehicle.findUnique({ where: { id } });

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { status },
    });

    await logAction({
      userId: (session.user as any).id,
      action: "STATUS_CHANGE",
      entity: "VEHICLE",
      entityId: id,
      details: `Cambio de estado: ${oldVehicle?.status} -> ${status}`,
      oldValue: { status: oldVehicle?.status },
      newValue: { status },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
