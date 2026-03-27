import { prisma } from "@autouuy/database";
import { type NextRequest } from "next/server";
import { ok, handleApiError, getPaginationParams, paginate } from "@/lib/api";
import { VehicleFilterSchema } from "@/lib/schemas";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/dealers/[id]/vehicles
 * Lista los vehículos activos de una automotora específica.
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = req.nextUrl;

    const parsed = VehicleFilterSchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      vehicleType: searchParams.get("vehicleType"),
      condition: searchParams.get("condition"),
      status: "ACTIVE", // Forzada a activos
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy") ?? "createdAt_desc",
    });

    const { page, pageSize, sortBy, search, ...filters } = parsed;
    const { skip, take } = getPaginationParams(searchParams);

    const where = {
      dealerId: id,
      status: "ACTIVE" as const,
      ...(filters.vehicleType && { vehicleType: filters.vehicleType }),
      ...(filters.condition && { condition: filters.condition }),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { brand: { name: { contains: search, mode: "insensitive" as const } } },
              { model: { name: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        orderBy:
          sortBy === "price_asc"
            ? { price: "asc" }
            : sortBy === "price_desc"
              ? { price: "desc" }
              : { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          brand: true,
          model: true,
          year: true,
          price: true,
          currency: true,
          images: {
            where: { isCover: true },
            select: { url: true },
            take: 1,
          },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return ok(vehicles, paginate(total, page, pageSize));
  } catch (err) {
    return handleApiError(err);
  }
}
