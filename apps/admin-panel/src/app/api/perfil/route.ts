import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "DEALER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dealer = await prisma.dealerProfile.findUnique({
      where: { ownerId: session.user.id },
      include: {
        owner: { select: { email: true, name: true } }
      }
    });

    if (!dealer) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(dealer);
  } catch (error) {
    console.error("[GET /api/perfil]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "DEALER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      description,
      whatsapp,
      phone,
      website,
      city,
      address,
      logoUrl,
      bannerUrl
    } = body;

    const updated = await prisma.dealerProfile.update({
      where: { ownerId: session.user.id },
      data: {
        description,
        whatsapp,
        phone,
        website,
        city,
        address,
        logoUrl,
        bannerUrl
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/perfil]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
