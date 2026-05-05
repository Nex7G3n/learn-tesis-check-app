import { NextResponse } from "next/server";

import { createAlumno, deleteAlumno, getAllAlumnos, updateAlumno } from "@/src/shared/services/alumno.service";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, correo } = body;

    if (!nombre?.trim() || !correo?.trim()) {
      return NextResponse.json(
        { error: "Nombre y correo son obligatorios" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return NextResponse.json(
        { error: "Correo inválido" },
        { status: 400 }
      );
    }

    const alumno = await createAlumno({ nombre, correo });
    return NextResponse.json({ success: true, alumno });
  } catch (error) {
    console.error("Error creando alumno:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al crear alumno",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nombre, correo } = body;

    if (!id || !nombre?.trim() || !correo?.trim()) {
      return NextResponse.json(
        { error: "ID, nombre y correo son obligatorios" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return NextResponse.json(
        { error: "Correo inválido" },
        { status: 400 }
      );
    }

    const alumno = await updateAlumno(id, { nombre, correo });
    return NextResponse.json({ success: true, alumno });
  } catch (error) {
    console.error("Error actualizando alumno:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar alumno",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID es obligatorio" },
        { status: 400 }
      );
    }

    await deleteAlumno(id);
    return NextResponse.json({ success: true, message: "Alumno eliminado" });
  } catch (error) {
    console.error("Error eliminando alumno:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al eliminar alumno",
      },
      { status: 500 }
    );
  }
}
