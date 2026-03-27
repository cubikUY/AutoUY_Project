import { prisma } from "@autouuy/database";
import { type NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api";

/**
 * GET /api/brands
 * Retorna la lista de marcas distintas de vehículos activos.
 * Útil para poblar filtros en /buscar.
 *
 * Query params:
 *  - vehicleType: filtra marcas por tipo de vehículo
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const vehicleType = searchParams.get("vehicleType") as
      | "AUTO"
      | "MOTO"
      | "CAMION"
      | "CAMIONETA"
      | "UTILITARIO"
      | "BUS"
      | "OTRO"
      | null;

    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
        vehicles: {
          some: {
            status: "ACTIVE",
            ...(vehicleType ? { vehicleType } : {}),
          },
        },
      },
      include: {
        _count: {
          select: { vehicles: { where: { status: "ACTIVE" } } },
        },
      },
      orderBy: { name: "asc" },
    });

    return ok(brands);
  } catch (err) {
    return handleApiError(err);
  }
}
