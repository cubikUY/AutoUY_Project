import { PrismaClient } from "../generated/client";

// ─── Singleton PrismaClient (dev hot-reload safe) ────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ─── Re-export types & enums from Prisma client ──────────────────────────────

export {
  Role,
  VehicleType,
  VehicleCondition,
  VehicleStatus,
  LeadStatus,
} from "../generated/client";

export type {
  User,
  DealerProfile,
  Brand,
  Model,
  Vehicle,
  Image,
  Lead,
  Favorite,
  Prisma,
} from "../generated/client";
