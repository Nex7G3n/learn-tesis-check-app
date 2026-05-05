import { NextResponse } from "next/server";

import { getAllAlumnos } from "@/src/shared/services/alumno.service";

export async function GET() {
  try {
    const alumnos = await getAllAlumnos();
    return NextResponse.json({ alumnos });
  } catch (error) {
    console.error("Error listando alumnos:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al cargar alumnos",
      },
      { status: 500 }
    );
  }
}
