import { NextResponse } from "next/server";
import { uploadFileToR2 } from "@/lib/r2";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // El frontend puede enviar un solo archivo bajo 'file',
    // o múltiples bajo 'files' u otros nombres de campos.
    const uploadedFiles: Array<{ url: string; r2Key: string; name: string }> = [];
    const folder = formData.get("folder") as string || "general";

    for (const [key, value] of Array.from(formData.entries())) {
      if (typeof value === "object" && value !== null && "arrayBuffer" in value) {
        const file = value as File;
        
        // Skip empty files
        if (file.size === 0) continue;

        let buffer: any = Buffer.from(await file.arrayBuffer());
        let fileName = file.name;
        let fileType = file.type;

        // --- Optimización con Sharp ---
        // Solo procesamos si es una imagen y no es un SVG (sharp maneja JPG, PNG, WEBP, etc)
        if (file.type.startsWith("image/") && !file.type.includes("svg")) {
          try {
            console.log(`[Upload API] Optimizando imagen: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
            
            const optimizedBuffer = await sharp(buffer)
              .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer();

            buffer = optimizedBuffer;
            
            // Cambiamos extensión a .webp para consistencia en R2
            const nameWithoutExt = file.name.split(".").slice(0, -1).join(".");
            fileName = `${nameWithoutExt || "image"}.webp`;
            fileType = "image/webp";

            console.log(`[Upload API] Imagen optimizada: ${fileName} (${(buffer.length / 1024).toFixed(2)} KB)`);
          } catch (sharpError) {
            console.error("[Upload API] Error optimizando con Sharp, subiendo original:", sharpError);
            // Si Sharp falla, seguimos con el buffer original
          }
        }

        const result = await uploadFileToR2(
          buffer,
          fileName,
          fileType,
          folder
        );

        uploadedFiles.push({
          url: result.url,
          r2Key: result.r2Key,
          name: fileName
        });
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "No se encontró ningún archivo válido para subir." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { files: uploadedFiles, count: uploadedFiles.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Upload API] Error global:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
