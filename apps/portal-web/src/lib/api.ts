import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@autouuy/database";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ─── Response Helpers ─────────────────────────────────────────────────────────

export function ok<T>(data: T, meta?: PaginationMeta | Record<string, unknown>, status = 200) {
  return NextResponse.json<ApiSuccessResponse<T>>({ data, meta: meta as Record<string, unknown> }, { status });
}

export function created<T>(data: T) {
  return ok(data, undefined, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json<ApiErrorResponse>(
    { error: { code, message, details } },
    { status },
  );
}

// ─── Common Errors ────────────────────────────────────────────────────────────

export const Errors = {
  notFound: (entity = "Recurso") =>
    apiError("NOT_FOUND", `${entity} no encontrado.`, 404),

  badRequest: (message: string, details?: unknown) =>
    apiError("BAD_REQUEST", message, 400, details),

  unauthorized: () =>
    apiError("UNAUTHORIZED", "No autenticado.", 401),

  forbidden: () =>
    apiError("FORBIDDEN", "No tenés permiso para realizar esta acción.", 403),

  internal: (err?: unknown) => {
    console.error("[API Error]", err);
    return apiError("INTERNAL_ERROR", "Error interno del servidor.", 500);
  },
};

// ─── Error Handler ────────────────────────────────────────────────────────────

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return Errors.badRequest("Datos inválidos.", err.flatten().fieldErrors);
  }

  if (err && typeof err === "object" && "code" in err) {
    if (err.code === "P2025") return Errors.notFound();
    if (err.code === "P2002") {
      return apiError("CONFLICT", "El recurso ya existe.", 409);
    }
  }

  return Errors.internal(err);
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function paginate(total: number, page: number, pageSize: number): PaginationMeta {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 12)));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, take: pageSize };
}
