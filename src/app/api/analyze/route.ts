import { NextResponse } from "next/server";

import { analyzeThesisWithGemini } from "@/src/shared/services/gemini.service";
import { getAuthenticatedUser } from "@/src/shared/services/auth.service";
import { getDecryptedUserApiKey } from "@/src/shared/services/user-api-key.service";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tesisId = (formData.get("tesis_id") as string | null) ?? undefined;

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

    const userApiKey = await getDecryptedUserApiKey(user.id);
    const fallbackApiKey = process.env.GEMINI_API_KEY ?? "";
    const apiKeyToUse = userApiKey ?? fallbackApiKey;

    if (!apiKeyToUse) {
      return NextResponse.json(
        {
          error:
            "No hay API key configurada para este usuario. Ve a Configurar API key antes de analizar.",
        },
        { status: 400 }
      );
    }

    const analysis = await analyzeThesisWithGemini(buffer, file.name, apiKeyToUse);

    return NextResponse.json({
      success: true,
      analysis,
      tesis_id: tesisId,
    });
  } catch (error) {
    console.error("Error en análisis con Gemini");
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
