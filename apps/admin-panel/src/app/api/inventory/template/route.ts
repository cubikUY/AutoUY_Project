import { NextResponse } from "next/server";
import { auth } from "@/auth";
import * as XLSX from "xlsx";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Define template columns
  const columns = [
    {
      "Título": "Volkswagen Polo 2024 1.0 TSI",
      "Descripción": "Impecable estado, único dueño.",
      "Marca": "Volkswagen",
      "Modelo": "Polo",
      "Año": 2024,
      "Kilometraje": 0,
      "Precio": 22900,
      "Moneda": "USD",
      "Condición": "NEW",
      "Combustible": "Nafta",
      "Transmisión": "Manual",
      "Color": "Gris",
      "Motor": "1.0 TSI"
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(columns);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Disposition": 'attachment; filename="AutoUY_Plantilla_Inventario.xlsx"',
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
