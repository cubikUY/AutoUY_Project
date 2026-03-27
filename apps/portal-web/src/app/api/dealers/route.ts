import { prisma } from "@autouuy/database";
import { type NextRequest } from "next/server";
import { ok, handleApiError, getPaginationParams, paginate } from "@/lib/api";
import { DealerFilterSchema } from "@/lib/schemas";

/**
 * GET /api/dealers
 * Lista pública de automotoras verificadas.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const parsed = DealerFilterSchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      verified: searchParams.get("verified"),
      city: searchParams.get("city"),
      search: searchParams.get("search"),
    });

    const { page, pageSize, search, city, verified } = parsed;
    const { skip, take } = getPaginationParams(searchParams);

    const where = {
      ...(verified !== undefined ? { verified } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" as const } } : {}),
      ...(search
        ? {
            OR: [
              { businessName: { contains: search, mode: "insensitive" as const } },
              { city: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [dealers, total] = await Promise.all([
      prisma.dealerProfile.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          businessName: true,
          city: true,
          logoUrl: true,
          bannerUrl: true,
          verified: true,
          website: true,
          phone: true,
          whatsapp: true,
          _count: { select: { vehicles: { where: { status: "ACTIVE" } } } },
        },
        orderBy: [{ verified: "desc" }, { businessName: "asc" }],
      }),
      prisma.dealerProfile.count({ where }),
    ]);

    return ok(dealers, paginate(total, page, pageSize));
  } catch (err) {
    return handleApiError(err);
  }
}
