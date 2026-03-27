import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check for associated records
    const [modelCount, vehicleCount] = await Promise.all([
      prisma.model.count({ where: { brandId: id } }),
      prisma.vehicle.count({ where: { brandId: id } }),
    ]);

    if (modelCount > 0 || vehicleCount > 0) {
      // Logical delete
      await prisma.brand.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ 
        message: "Marca desactivada (borrado lógico) por tener registros asociados.",
        type: "logical"
      });
    } else {
      // Physical delete
      await prisma.brand.delete({ where: { id } });
      return new NextResponse(null, { status: 204 });
    }
  } catch (error) {
    console.error("[Brands DELETE Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, logoUrl, isFeatured, isActive } = await req.json();
    const brand = await prisma.brand.update({
      where: { id },
      data: { name, logoUrl, isFeatured, isActive },
    });
    return NextResponse.json(brand);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
