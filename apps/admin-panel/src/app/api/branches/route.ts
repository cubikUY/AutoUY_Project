import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    
    let where: any = {};
    if (user.role === "DEALER") {
      const dealer = await prisma.dealerProfile.findUnique({ where: { ownerId: user.id } });
      if (!dealer) return NextResponse.json([], { status: 200 });
      where = { dealerId: dealer.id };
    }

    const branches = await prisma.branch.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(branches);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let dealerId = body.dealerId;
    if (user.role === "DEALER") {
      const dealer = await prisma.dealerProfile.findUnique({ where: { ownerId: user.id } });
      if (!dealer) return NextResponse.json({ error: "Dealer profile not found" }, { status: 404 });
      dealerId = dealer.id;
    }

    const branch = await prisma.branch.create({
      data: {
        dealerId,
        name: body.name,
        address: body.address,
        city: body.city,
        phone: body.phone,
        whatsapp: body.whatsapp,
      },
    });

    return NextResponse.json(branch);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...data } = body;

    const branch = await prisma.branch.update({
      where: { id },
      data,
    });

    return NextResponse.json(branch);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
