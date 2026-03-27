'use server';

import { auth } from "@/auth";
import { prisma } from "@autouuy/database";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(vehicleId: string) {
  const session = await auth();
  
  if (!session?.user) {
    return { error: "unauthorized" };
  }

  const userId = (session.user as any).id;

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_vehicleId: {
          userId,
          vehicleId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: {
          id: existing.id,
        },
      });
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          vehicleId,
        },
      });
    }

    revalidatePath(`/vehiculos/${vehicleId}`);
    revalidatePath("/favoritos");
    return { success: true };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { error: "failed" };
  }
}
