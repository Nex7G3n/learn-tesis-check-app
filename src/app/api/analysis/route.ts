import { NextResponse } from "next/server";

import { saveAnalisis } from "@/src/shared/services/analisis.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tesis_id, resultado } = body;

    if (!tesis_id || !resultado) {
      return NextResponse.json(
        { error: "Se requiere tesis_id y resultado" },
        { status: 400 }
      );
    }

    const analisis = await saveAnalisis({
      tesis_id,
      resultado,
    });

    return NextResponse.json({
      success: true,
      message: "Análisis guardado correctamente",
      analisis,
    });
  } catch (error) {
    console.error("Error guardando análisis:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al guardar el análisis",
      },
      { status: 500 }
    );
  }
}
