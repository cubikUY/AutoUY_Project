import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    const vehicleType = searchParams.get("vehicleType");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      ...(brandId ? { brandId } : {}),
      ...(vehicleType ? { vehicleType: vehicleType as any } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { brand: { name: { contains: search, mode: "insensitive" as const } } }
        ]
      } : {})
    };

    const [models, total] = await Promise.all([
      prisma.model.findMany({
        where,
        include: {
          brand: { select: { name: true } },
          _count: { select: { vehicles: true } },
        },
        orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
        skip,
        take: limit,
      }),
      prisma.model.count({ where })
    ]);

    return NextResponse.json({ models, total, page, limit });
  } catch (error) {
    console.error("[Models GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, brandId, vehicleType } = await req.json();
    if (!name || !brandId || !vehicleType) {
      return NextResponse.json({ error: "Name, BrandId, and VehicleType are required" }, { status: 400 });
    }

    const model = await prisma.model.create({
      data: { name, brandId, vehicleType },
      include: { brand: { select: { name: true } } },
    });
    return NextResponse.json(model, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
