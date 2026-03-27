import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Ensure environment variables exist
const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "autouuy-vehicles";

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.warn("R2 Credentials are not fully set in the environment variables.");
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

export const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_R2_BASE_URL || `https://${accountId}.r2.cloudflarestorage.com/${bucketName}`;
};

/**
 * Subir un archivo directamente a Cloudflare R2
 * 
 * @param buffer Contenido binario del archivo
 * @param fileName Nombre original del archivo (e.g. "logo.png")
 * @param contentType Tipo MIME (e.g. "image/png")
 * @param folder Carpeta opcional (e.g. "brands" o "vehicles")
 * @returns { url, r2Key } Objeto con la URL pública y la llave del objeto
 */
export async function uploadFileToR2(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folder?: string
): Promise<{ url: string; r2Key: string }> {
  
  // Create a unique filename to prevent overwriting
  const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  
  const r2Key = folder 
    ? `${folder}/${uniquePrefix}-${sanitizedName}`
    : `${uniquePrefix}-${sanitizedName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: r2Key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const baseUrl = getBaseUrl();
    // Assuming the base URL points to the CDN root, we append the key
    const finalUrl = `${baseUrl.replace(/\/$/, "")}/${r2Key}`;

    return { 
      url: finalUrl, 
      r2Key 
    };

  } catch (error) {
    console.error("[uploadFileToR2] Error uploading to R2:", error);
    throw new Error("Failed to upload file to R2 storage.");
  }
}
