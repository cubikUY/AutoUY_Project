import { prisma } from "@autouuy/database";
import { type NextRequest } from "next/server";
import { created, ok, handleApiError, getPaginationParams, paginate, Errors } from "@/lib/api";
import { CreateLeadSchema, LeadFilterSchema } from "@/lib/schemas";

/**
 * POST /api/leads
 * Crea un nuevo lead (consulta) a partir del formulario de contacto de un auto.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateLeadSchema.parse(body);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      select: { id: true, salesmanId: true, dealerId: true },
    });

    if (!vehicle) return Errors.notFound("Vehículo");

    // Lógica Round Robin para automotoras
    let salesmanId = vehicle.salesmanId; // Por defecto el que subió el auto
    
    if (vehicle.dealerId) {
        // Encontrar todo el personal activo de la automotora
        const staff = await prisma.user.findMany({
            where: {
                dealerId: vehicle.dealerId,
                isActive: true,
            },
            select: { id: true },
        });

        if (staff.length > 0) {
            // Encontrar al que se le asignó un lead hace más tiempo (Round Robin)
            // O al que no tiene ninguno asignado
            const assignments = await Promise.all(staff.map(async (member) => {
                const lastLead = await prisma.lead.findFirst({
                    where: { salesmanId: member.id },
                    orderBy: { createdAt: "desc" },
                    select: { createdAt: true }
                });
                return { id: member.id, lastAssignedAt: lastLead?.createdAt || new Date(0) };
            }));

            // Ordenar por fecha de asignación y elegir el más antiguo
            assignments.sort((a, b) => a.lastAssignedAt.getTime() - b.lastAssignedAt.getTime());
            salesmanId = assignments[0].id;
        }
    }

    const lead = await prisma.lead.create({
      data: {
        ...data,
        status: "NEW",
        salesmanId: salesmanId,
      },
    });

    return created(lead);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * GET /api/leads
 * Lista los leads recibidos (protegido por rol).
 * TODO: Implementar validación de sesión para filtrar por dealerId o userId.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const parsed = LeadFilterSchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      status: searchParams.get("status"),
      vehicleId: searchParams.get("vehicleId"),
    });

    const { page, pageSize, ...filters } = parsed;
    const { skip, take } = getPaginationParams(searchParams);

    const where = {
      ...(filters.status && { status: filters.status }),
      ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: {
            select: { title: true, brand: true, model: true },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return ok(leads, paginate(total, page, pageSize));
  } catch (err) {
    return handleApiError(err);
  }
}
