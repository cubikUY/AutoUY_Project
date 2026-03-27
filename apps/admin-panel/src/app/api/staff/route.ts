import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, role } = session.user as any;

    if (role !== "ADMIN" && role !== "DEALER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let dealerId: string | null = null;

    if (role === "DEALER") {
      const profile = await prisma.dealerProfile.findFirst({
        where: {
          OR: [
            { ownerId: userId },
            { staff: { some: { id: userId } } }
          ]
        }
      });
      if (!profile) return NextResponse.json([], { status: 200 });
      dealerId = profile.id;
    }

    const staff = await prisma.user.findMany({
      where: {
        dealerId: dealerId || undefined,
        role: "DEALER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        staffRole: true,
        isActive: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[Staff GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, role } = session.user as any;

    // Solo el dueño puede agregar personal
    let dealerId: string | null = null;
    if (role === "DEALER") {
      const profile = await prisma.dealerProfile.findUnique({
        where: { ownerId: userId },
      });
      if (!profile) {
        return NextResponse.json({ error: "Only the owner can add staff" }, { status: 403 });
      }
      dealerId = profile.id;
    } else if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, password, phone, staffRole } = await req.json();

    if (!name || !email || !password || !dealerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if email taken
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role: "DEALER",
        staffRole: staffRole || "SALES",
        dealerId: dealerId,
      },
    });

    const { passwordHash: _, ...user } = newUser;
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("[Staff POST Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const { id: userId, role } = session.user as any;
  
      const { id: staffId, name, phone, staffRole, isActive } = await req.json();
  
      // Verify permissions: Must be owner of the same dealer or ADMIN
      const staffUser = await prisma.user.findUnique({
          where: { id: staffId },
          select: { dealerId: true }
      });

      if (!staffUser) {
          return NextResponse.json({ error: "Staff not found" }, { status: 404 });
      }

      if (role === "DEALER") {
          const ownerProfile = await prisma.dealerProfile.findUnique({
              where: { ownerId: userId }
          });
          if (!ownerProfile || ownerProfile.id !== staffUser.dealerId) {
              return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          }
      } else if (role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
  
      const updated = await prisma.user.update({
        where: { id: staffId },
        data: {
          name,
          phone,
          staffRole,
          isActive
        },
      });
  
      const { passwordHash: _, ...user } = updated;
      return NextResponse.json(user);
    } catch (error) {
      console.error("[Staff PATCH Error]", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
