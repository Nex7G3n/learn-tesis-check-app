import { NextResponse } from "next/server";
import { getDashboardStats } from "@/src/shared/services/dashboard.service";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error en dashboard API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al cargar estadísticas",
      },
      { status: 500 }
    );
  }
}
