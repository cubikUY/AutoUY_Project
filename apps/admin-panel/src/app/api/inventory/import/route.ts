import { prisma } from "@autouuy/database";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import * as XLSX from "xlsx";
import { logAction } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se subió ningún archivo" }, { status: 400 });
    }

    // Read the file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse with XLSX
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (data.length === 0) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
    }

    const results = {
      total: data.length,
      success: 0,
      errors: [] as any[],
    };

    const userData = session.user as any;
    const userId = userData.id;
    const dealerId = userData.role === "DEALER" ? (await prisma.dealerProfile.findUnique({ where: { ownerId: userId } }))?.id : null;

    // Process each row
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNum = i + 2; // +1 header + 1 index
        try {
            // Mapping fields from template
            const brandName = (row["Marca"] || "").toString().trim();
            const modelName = (row["Modelo"] || "").toString().trim();
            
            if (!brandName || !modelName) {
                results.errors.push({ row: rowNum, error: "Marca o Modelo no especificado" });
                continue;
            }

            // Find brand
            const brand = await prisma.brand.findFirst({
                where: { name: { contains: brandName, mode: 'insensitive' } }
            });

            if (!brand) {
                results.errors.push({ row: rowNum, error: `Marca no encontrada: ${brandName}` });
                continue;
            }

            // Find model
            const model = await prisma.model.findFirst({
                where: { 
                    name: { contains: modelName, mode: 'insensitive' },
                    brandId: brand.id
                }
            });

            if (!model) {
                results.errors.push({ row: rowNum, error: `Modelo no encontrado: ${modelName} para la marca ${brandName}` });
                continue;
            }

            // Create vehicle
            await prisma.vehicle.create({
                data: {
                    title: (row["Título"] || `${brandName} ${modelName}`).toString(),
                    description: row["Descripción"]?.toString(),
                    brandId: brand.id,
                    modelId: model.id,
                    vehicleType: model.vehicleType,
                    year: parseInt(row["Año"]) || new Date().getFullYear(),
                    mileage: parseInt(row["Kilometraje"]) || 0,
                    price: parseFloat(row["Precio"]) || 0,
                    currency: (row["Moneda"] || "USD").toString() as any,
                    condition: (row["Condición"] || "USED").toString().toUpperCase() as any,
                    fuelType: row["Combustible"]?.toString(),
                    transmission: row["Transmisión"]?.toString(),
                    color: row["Color"]?.toString(),
                    engineSize: row["Motor"]?.toString(),
                    ownerId: userId,
                    dealerId: dealerId,
                    status: "DRAFT", // Importados van a borrador para revisión
                }
            });

            results.success++;
        } catch (error: any) {
            results.errors.push({ row: rowNum, error: error.message });
        }
    }

    await logAction({
      userId: (session.user as any).id,
      action: "IMPORT",
      entity: "VEHICLE",
      entityId: "BATCH",
      details: `Importación masiva: ${results.success} vehículos cargados desde archivo ${file.name}`,
      newValue: { successCount: results.success, errorCount: results.errors.length }
    });

    return NextResponse.json({
      message: `Importación completada: ${results.success} cargados correctamente, ${results.errors.length} errores.`,
      results
    });

  } catch (error) {
    console.error("[Inventory Import Error]", error);
    return NextResponse.json({ error: "Ocurrió un error procesando el archivo" }, { status: 500 });
  }
}
