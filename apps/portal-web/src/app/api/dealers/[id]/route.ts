import { prisma } from "@autouuy/database";
import { type NextRequest } from "next/server";
import { ok, handleApiError, Errors } from "@/lib/api";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/dealers/[id]
 * Retorna el perfil público detallado de una automotora.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const dealer = await prisma.dealerProfile.findUnique({
      where: { id },
      select: {
        id: true,
        businessName: true,
        city: true,
        logoUrl: true,
        bannerUrl: true,
        phone: true,
        whatsapp: true,
        address: true,
        website: true,
        description: true,
        verified: true,
        _count: {
          select: { vehicles: { where: { status: "ACTIVE" } } },
        },
      },
    });

    if (!dealer) return Errors.notFound("Automotora");

    return ok(dealer);
  } catch (err) {
    return handleApiError(err);
  }
}
