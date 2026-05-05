import { NextResponse } from "next/server";

import { getAllTesis, getTesisById } from "@/src/shared/services/tesis-list.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const tesis = await getTesisById(id);
      return NextResponse.json({ tesis });
    }

    const tesis = await getAllTesis();
    return NextResponse.json({ tesis });
  } catch (error) {
    console.error("Error en tesis API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al cargar tesis",
      },
      { status: 500 }
    );
  }
}
