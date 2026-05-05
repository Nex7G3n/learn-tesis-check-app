import { supabaseServer } from "@/src/shared/infrastructure/supabase/server";

export interface TesisInput {
  titulo?: string;
  archivo_nombre: string;
  archivo_url: string;
  alumno_ids: string[];
}

export async function createTesis(input: TesisInput) {
  const { data: tesis, error: tesisError } = await supabaseServer
    .from("tesis")
    .insert({
      titulo: input.titulo ?? null,
      archivo_nombre: input.archivo_nombre,
      archivo_url: input.archivo_url,
      estado: "pendiente",
    })
    .select("id, titulo, archivo_nombre, archivo_url, estado, created_at")
    .single();

  if (tesisError || !tesis) {
    throw new Error(`Error creando tesis: ${tesisError?.message ?? "unknown"}`);
  }

  // Relacionar alumnos
  if (input.alumno_ids.length > 0) {
    const relations = input.alumno_ids.map((alumnoId) => ({
      alumno_id: alumnoId,
      tesis_id: tesis.id,
      rol: "autor" as const,
    }));

    const { error: relError } = await supabaseServer
      .from("alumno_tesis")
      .insert(relations);

    if (relError) {
      throw new Error(`Error relacionando alumnos: ${relError.message}`);
    }
  }

  return tesis;
}

export async function updateTesisStatus(
  tesisId: string,
  estado: "pendiente" | "en_revision" | "revisada" | "aprobada"
) {
  const { error } = await supabaseServer
    .from("tesis")
    .update({ estado })
    .eq("id", tesisId);

  if (error) {
    throw new Error(`Error actualizando tesis: ${error.message}`);
  }
}
