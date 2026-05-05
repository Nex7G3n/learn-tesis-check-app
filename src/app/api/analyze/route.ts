import { NextResponse } from "next/server";

import { analyzeThesisWithGemini } from "@/src/shared/services/gemini.service";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato de archivo no válido. Use PDF, DOC o DOCX" },
        { status: 400 }
      );
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño máximo de 25MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const analysis = await analyzeThesisWithGemini(buffer, file.name);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Error en análisis con Gemini:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al analizar la tesis con IA",
      },
      { status: 500 }
    );
  }
}
