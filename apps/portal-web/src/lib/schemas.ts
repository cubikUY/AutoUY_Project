import { z } from "zod";

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});

// ─── Brand & Model Schemas ───────────────────────────────────────────────────

export const CreateBrandSchema = z.object({
  name: z.string().min(1).max(100),
  logoUrl: z.string().url().optional(),
});

export const CreateModelSchema = z.object({
  name: z.string().min(1).max(100),
  brandId: z.string().cuid(),
});

// ─── Vehicle Schemas ──────────────────────────────────────────────────────────

export const VehicleFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
  vehicleType: z
    .enum(["AUTO", "MOTO", "CAMION", "CAMIONETA", "UTILITARIO", "BUS", "OTRO"])
    .optional(),
  condition: z.enum(["NEW", "USED"]).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "SOLD", "PAUSED"]).default("ACTIVE"),
  brandId: z.string().cuid().optional(),
  modelId: z.string().cuid().optional(),
  brand: z.string().optional(), // For text search fallback
  model: z.string().optional(), // For text search fallback
  yearMin: z.coerce.number().int().min(1900).optional(),
  yearMax: z.coerce.number().int().max(2100).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  fuelType: z.string().optional(),
  dealerId: z.string().optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["price_asc", "price_desc", "year_desc", "year_asc", "createdAt_desc"])
    .default("createdAt_desc"),
});

export const CreateVehicleSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(5000).optional(),
  vehicleType: z.enum(["AUTO", "MOTO", "CAMION", "CAMIONETA", "UTILITARIO", "BUS", "OTRO"]),
  condition: z.enum(["NEW", "USED"]),
  brandId: z.string().cuid(),
  modelId: z.string().cuid(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().int().min(0).default(0),
  price: z.number().positive(),
  currency: z.enum(["UYU", "USD"]).default("UYU"),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  color: z.string().optional(),
  engineSize: z.string().optional(),
  doors: z.number().int().min(0).max(10).optional(),
  seats: z.number().int().min(1).max(50).optional(),
  features: z.array(z.string()).default([]),
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial().extend({
  status: z.enum(["DRAFT", "ACTIVE", "SOLD", "PAUSED"]).optional(),
});

// ─── Lead Schemas ─────────────────────────────────────────────────────────────

export const CreateLeadSchema = z.object({
  vehicleId: z.string().cuid(),
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().default("web"),
});

export const LeadFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["NEW", "CONTACTED", "CLOSED"]).optional(),
  vehicleId: z.string().optional(),
});

// ─── Upload Schemas ───────────────────────────────────────────────────────────

export const PresignedUploadSchema = z.object({
  vehicleId: z.string().cuid(),
  fileName: z.string().min(1).max(200),
  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]),
});

// ─── Dealer Schemas ───────────────────────────────────────────────────────────

export const DealerFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  verified: z.coerce.boolean().optional(),
  city: z.string().optional(),
  search: z.string().optional(),
});

export type VehicleFilterInput = z.infer<typeof VehicleFilterSchema>;
export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>;
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type PresignedUploadInput = z.infer<typeof PresignedUploadSchema>;
export type DealerFilterInput = z.infer<typeof DealerFilterSchema>;
