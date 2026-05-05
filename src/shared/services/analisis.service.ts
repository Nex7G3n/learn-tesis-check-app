import { supabaseServer } from "@/src/shared/infrastructure/supabase/server";

export interface AnalisisInput {
  tesis_id: string;
  resultado: string;
  modelo_ia?: string;
  prompt_version?: string;
}

export async function saveAnalisis(input: AnalisisInput) {
  const { data, error } = await supabaseServer
    .from("analisis")
    .insert({
      tesis_id: input.tesis_id,
      resultado: input.resultado,
      modelo_ia: input.modelo_ia ?? "gemini-2.5-flash",
      prompt_version: input.prompt_version ?? "v1",
    })
    .select("id, tesis_id, resultado, created_at")
    .single();

  if (error || !data) {
    throw new Error(`Error guardando análisis: ${error?.message ?? "unknown"}`);
  }

  // Actualizar estado de la tesis a revisada
  await supabaseServer
    .from("tesis")
    .update({ estado: "revisada" })
    .eq("id", input.tesis_id);

  return data;
}
