import { prisma } from "@autouuy/database";
import { type NextRequest } from "next/server";
import { auth } from "@/auth";
import { ok, noContent, handleApiError, Errors } from "@/lib/api";
import { UpdateVehicleSchema } from "@/lib/schemas";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/vehicles/[id]
 * Retorna el detalle completo de un vehículo con sus imágenes y dealer.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        brand: { select: { id: true, name: true, logoUrl: true } },
        model: { select: { id: true, name: true } },
        images: { orderBy: [{ isCover: "desc" }, { position: "asc" }] },
        dealer: {
          select: {
            id: true,
            businessName: true,
            city: true,
            logoUrl: true,
            phone: true,
            whatsapp: true,
            website: true,
            verified: true,
          },
        },
        owner: {
          select: { id: true, name: true },
        },
        leads: false,
      },
    });

    if (!vehicle) return Errors.notFound();

    return ok(vehicle);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PUT /api/vehicles/[id]
 * Actualiza los datos de un vehículo.
 * Verifica que el usuario autenticado es el owner, el dealer asociado, o ADMIN.
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Errors.unauthorized();
    }

    const { id: userId, role } = session.user as any;
    const { id } = await params;

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { dealer: true },
    });

    if (!existingVehicle) {
      return Errors.notFound("Vehículo");
    }

    // Role checks
    if (role !== "ADMIN") {
      let isOwner = existingVehicle.ownerId === userId;
      let isDealer = role === "DEALER" && existingVehicle.dealer?.ownerId === userId;

      if (!isOwner && !isDealer) {
        return Errors.forbidden();
      }
    }

    const body = await req.json();
    const data = UpdateVehicleSchema.parse(body);

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === "ACTIVE" ? { publishedAt: new Date() } : {}),
      },
      include: {
        images: { orderBy: { position: "asc" } },
      },
    });

    return ok(vehicle);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/vehicles/[id]
 * Elimina un vehículo (ADMIN o propietario).
 * Verifica permisos con sesión.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Errors.unauthorized();
    }

    const { id: userId, role } = session.user as any;
    const { id } = await params;

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { dealer: true },
    });

    if (!existingVehicle) {
      return Errors.notFound("Vehículo");
    }

    // Role checks
    if (role !== "ADMIN") {
      let isOwner = existingVehicle.ownerId === userId;
      let isDealer = role === "DEALER" && existingVehicle.dealer?.ownerId === userId;

      if (!isOwner && !isDealer) {
        return Errors.forbidden();
      }
    }

    await prisma.vehicle.delete({ where: { id } });

    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
