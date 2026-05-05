import { NextResponse } from "next/server";

import { uploadFeatures } from "@/src/shared/application/thesis-review.snapshot";
import { findOrCreateAlumno } from "@/src/shared/services/alumno.service";
import { createTesis } from "@/src/shared/services/tesis.service";
import { uploadFileToStorage } from "@/src/shared/services/storage.service";

export async function GET() {
  return NextResponse.json({
    features: uploadFeatures,
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const alumnosRaw = formData.get("alumnos") as string | null;
    const titulo = (formData.get("titulo") as string | null) ?? undefined;

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

    // Parsear alumnos
    let alumnosInput: { nombre: string; correo: string }[] = [];
    if (alumnosRaw) {
      try {
        alumnosInput = JSON.parse(alumnosRaw);
        if (!Array.isArray(alumnosInput)) throw new Error("Invalid format");
      } catch {
        return NextResponse.json(
          { error: "Formato de alumnos inválido. Debe ser un array JSON" },
          { status: 400 }
        );
      }
    }

    if (alumnosInput.length === 0) {
      return NextResponse.json(
        { error: "Debe proporcionar al menos un alumno (nombre y correo)" },
        { status: 400 }
      );
    }

    // Validar emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const a of alumnosInput) {
      if (!a.nombre?.trim() || !a.correo?.trim()) {
        return NextResponse.json(
          { error: "Todos los alumnos deben tener nombre y correo" },
          { status: 400 }
        );
      }
      if (!emailRegex.test(a.correo)) {
        return NextResponse.json(
          { error: `Correo inválido: ${a.correo}` },
          { status: 400 }
        );
      }
    }

    // 1. Subir archivo a Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const { url: archivoUrl } = await uploadFileToStorage(buffer, file.name, file.type);

    // 2. Crear o encontrar alumnos
    const alumnos = await Promise.all(
      alumnosInput.map((a) => findOrCreateAlumno(a))
    );

    // 3. Crear tesis y relacionar alumnos
    const tesis = await createTesis({
      titulo,
      archivo_nombre: file.name,
      archivo_url: archivoUrl,
      alumno_ids: alumnos.map((a) => a.id),
    });

    return NextResponse.json({
      success: true,
      message: "Tesis creada correctamente",
      tesis_id: tesis.id,
      tesis,
      alumnos,
    });
  } catch (error) {
    console.error("Error en upload:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al procesar la solicitud",
      },
      { status: 500 }
    );
  }
}
