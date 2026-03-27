import { type NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ok, handleApiError, Errors } from "@/lib/api";
import { PresignedUploadSchema } from "@/lib/schemas";
import { randomUUID } from "node:crypto";

/**
 * POST /api/upload
 * Genera una presigned URL para subir imágenes directamente a Cloudflare R2.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Validar inputs
    const body = await req.json();
    const { vehicleId, fileName, contentType } = PresignedUploadSchema.parse(body);

    // TODO: Validar que el usuario tiene permiso para subir fotos a este vehicleId

    // 2. Configurar cliente S3 (R2 compatible)
    const s3 = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    // 3. Generar key única para R2
    const fileExtension = fileName.split(".").pop();
    const randomName = randomUUID();
    const r2Key = `vehicles/${vehicleId}/${randomName}.${fileExtension}`;

    // 4. Crear comando y generar URL firmada
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: r2Key,
      ContentType: contentType,
    });

    // URL válida por 5 minutos
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return ok({
      uploadUrl,
      r2Key,
      publicUrl: `${process.env.NEXT_PUBLIC_R2_BASE_URL}/${r2Key}`,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
