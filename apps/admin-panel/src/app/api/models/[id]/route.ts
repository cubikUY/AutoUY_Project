import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if there are associated vehicles
    const vehicleCount = await prisma.vehicle.count({ where: { modelId: id } });
    if (vehicleCount > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el modelo porque tiene vehículos asociados." },
        { status: 400 }
      );
    }

    await prisma.model.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[Model DELETE Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, brandId, vehicleType } = await req.json();

    const model = await prisma.model.update({
      where: { id },
      data: { name, brandId, vehicleType },
    });
    return NextResponse.json(model);
  } catch (error) {
    console.error("[Model PUT Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
