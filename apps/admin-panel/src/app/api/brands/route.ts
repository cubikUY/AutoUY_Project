import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: { select: { models: true, vehicles: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(brands);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, logoUrl, isFeatured, isActive } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const brand = await prisma.brand.create({
      data: { 
        name, 
        logoUrl, 
        isFeatured: isFeatured ?? false,
        isActive: isActive ?? true 
      },
    });
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
