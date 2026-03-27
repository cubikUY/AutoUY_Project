import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logAction } from "@/lib/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: (await params).id },
      include: {
        brand: true,
        model: true,
        dealer: true,
        branch: true,
        owner: true,
        images: { orderBy: { isCover: "desc" } },
      },
    });
    if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const oldVehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!oldVehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    
    // Basic validation
    if (!body.title || !body.brandId || !body.modelId || !body.price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Restriction: Sales staff cannot change price
    const salesmanRole = (session.user as any).staffRole;
    if (salesmanRole === "SALES") {
        const priceChanged = Number(oldVehicle.price) !== Number(body.price);
        const currencyChanged = oldVehicle.currency !== body.currency;
        if (priceChanged || currencyChanged) {
            return NextResponse.json({ error: "No tienes permiso para cambiar el precio del vehículo. Contacta al administrador de la automotora." }, { status: 403 });
        }
    }

    const vehicle = await prisma.$transaction(async (tx) => {
      // Handle cover image change: reset all then set the chosen one
      if (body.coverImageId) {
        await tx.image.updateMany({
          where: { vehicleId: id },
          data: { isCover: false },
        });
        await tx.image.update({
          where: { id: body.coverImageId },
          data: { isCover: true },
        });
      }

      return tx.vehicle.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
          vehicleType: body.vehicleType,
          condition: body.condition,
          year: parseInt(body.year),
          mileage: parseInt(body.mileage || 0),
          price: body.price,
          currency: body.currency,
          fuelType: body.fuelType,
          transmission: body.transmission,
          color: body.color,
          engineSize: body.engineSize,
          doors: body.doors ? parseInt(body.doors) : null,
          seats: body.seats ? parseInt(body.seats) : null,
          brandId: body.brandId,
          modelId: body.modelId,
          branchId: body.branchId || null,
          status: body.status,
          isFeatured: body.isFeatured,
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
    });

    const priceChanged = Number(oldVehicle.price) !== Number(body.price);

    await logAction({
      userId: (session.user as any).id,
      action: "UPDATE",
      entity: "VEHICLE",
      entityId: id,
      details: priceChanged 
        ? `Actualización de datos (Precio cambiado de ${oldVehicle.currency} ${oldVehicle.price} a ${body.currency} ${body.price})`
        : `Actualización de datos del vehículo ${body.title}`,
      oldValue: oldVehicle,
      newValue: vehicle,
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("[Vehicle PUT Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = (await params).id;
    const oldVehicle = await prisma.vehicle.findUnique({ where: { id } });

    await prisma.vehicle.delete({ where: { id } });

    await logAction({
      userId: (session.user as any).id,
      action: "DELETE",
      entity: "VEHICLE",
      entityId: id,
      details: `Vehículo eliminado: ${oldVehicle?.title}`,
      oldValue: oldVehicle
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
