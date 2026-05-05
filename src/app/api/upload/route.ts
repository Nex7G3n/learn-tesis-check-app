import { NextResponse } from "next/server";

import { uploadFeatures } from "@/src/shared/application/thesis-review.snapshot";

export async function GET() {
  return NextResponse.json({
    features: uploadFeatures,
  });
}

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

    return NextResponse.json({
      success: true,
      message: "Archivo recibido y validado correctamente",
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error al procesar el archivo" },
      { status: 500 }
    );
  }
}
