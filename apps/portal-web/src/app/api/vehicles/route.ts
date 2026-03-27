import { prisma } from "@autouuy/database";
import { type NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  ok,
  created,
  handleApiError,
  getPaginationParams,
  paginate,
} from "@/lib/api";
import { VehicleFilterSchema, CreateVehicleSchema } from "@/lib/schemas";

/**
 * GET /api/vehicles
 * Lista pública de vehículos activos con filtros, búsqueda y paginación.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const parsed = VehicleFilterSchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      vehicleType: searchParams.get("vehicleType"),
      condition: searchParams.get("condition"),
      status: searchParams.get("status") ?? "ACTIVE",
      brandId: searchParams.get("brandId"),
      modelId: searchParams.get("modelId"),
      brand: searchParams.get("brand"),
      model: searchParams.get("model"),
      yearMin: searchParams.get("yearMin"),
      yearMax: searchParams.get("yearMax"),
      priceMin: searchParams.get("priceMin"),
      priceMax: searchParams.get("priceMax"),
      fuelType: searchParams.get("fuelType"),
      dealerId: searchParams.get("dealerId"),
      city: searchParams.get("city"),
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy") ?? "createdAt_desc",
    });

    const { page, pageSize, sortBy, search, yearMin, yearMax, priceMin, priceMax, ...filters } = parsed;
    const { skip, take } = getPaginationParams(searchParams);

    // Build Prisma where clause
    const where = {
      ...(filters.status && { status: filters.status }),
      ...(filters.vehicleType && { vehicleType: filters.vehicleType }),
      ...(filters.condition && { condition: filters.condition }),
      ...(filters.brandId && { brandId: filters.brandId }),
      ...(filters.modelId && { modelId: filters.modelId }),
      ...(filters.fuelType && { fuelType: { equals: filters.fuelType, mode: "insensitive" as const } }),
      ...(filters.dealerId && { dealerId: filters.dealerId }),
      ...(filters.city && {
        OR: [
          { branch: { city: { equals: filters.city, mode: "insensitive" as const } } },
          { 
            AND: [
              { branchId: null },
              { dealer: { city: { equals: filters.city, mode: "insensitive" as const } } }
            ]
          }
        ]
      }),
      ...(yearMin || yearMax
        ? { year: { ...(yearMin && { gte: yearMin }), ...(yearMax && { lte: yearMax }) } }
        : {}),
      ...(priceMin || priceMax
        ? { price: { ...(priceMin && { gte: priceMin }), ...(priceMax && { lte: priceMax }) } }
        : {}),
      ...(search || filters.brand || filters.model
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { brand: { name: { contains: search || filters.brand, mode: "insensitive" as const } } },
              { model: { name: { contains: search || filters.model, mode: "insensitive" as const } } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    // Build orderBy
    const orderByMap: Record<string, object> = {
      price_asc: { price: "asc" },
      price_desc: { price: "desc" },
      year_desc: { year: "desc" },
      year_asc: { year: "asc" },
      createdAt_desc: { createdAt: "desc" },
    };

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        orderBy: orderByMap[sortBy] ?? { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          brand: { select: { name: true } },
          model: { select: { name: true } },
          year: true,
          mileage: true,
          price: true,
          currency: true,
          vehicleType: true,
          condition: true,
          status: true,
          fuelType: true,
          color: true,
          publishedAt: true,
          createdAt: true,
          dealer: {
            select: {
              id: true,
              businessName: true,
              city: true,
              logoUrl: true,
              verified: true,
            },
          },
          branch: {
            select: {
              name: true,
              city: true,
            },
          },
          images: {
            where: { isCover: true },
            select: { url: true, alt: true },
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

/**
 * POST /api/vehicles
 * Crea un nuevo vehículo. Requiere autenticación (DEALER o CLIENT).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return (await import("@/lib/api")).Errors.unauthorized();
    }

    const { id: userId, role } = session.user as any;
    if (role !== "DEALER" && role !== "ADMIN") {
      return (await import("@/lib/api")).Errors.forbidden();
    }

    // Fetch the dealer profile for the logged in user
    const dealerProfile = await prisma.dealerProfile.findUnique({
      where: { ownerId: userId },
    });

    if (!dealerProfile && role !== "ADMIN") {
       return (await import("@/lib/api")).Errors.forbidden();
    }

    const body = await req.json();
    const data = CreateVehicleSchema.parse(body);

    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        price: data.price,
        ownerId: userId,
        dealerId: dealerProfile?.id, // Assumes model can optionally handle non-dealer situations or handles ADMIN gracefully, but dealerId is what actually links them.
        status: "DRAFT",
      },
      include: {
        images: true,
        dealer: { select: { businessName: true, city: true } },
      },
    });

    return created(vehicle);
  } catch (err) {
    return handleApiError(err);
  }
}
