import { supabaseServer } from "@/src/shared/infrastructure/supabase/server";

export interface TesisWithRelations {
  id: string;
  titulo: string | null;
  archivo_nombre: string;
  archivo_url: string;
  estado: string;
  created_at: string;
  alumnos: {
    id: string;
    nombre: string;
    correo: string;
  }[];
  analisis: {
    id: string;
    resultado: string;
    modelo_ia: string;
    created_at: string;
  } | null;
}

export async function getAllTesis(): Promise<TesisWithRelations[]> {
  const { data: tesis, error } = await supabaseServer
    .from("tesis")
    .select("id, titulo, archivo_nombre, archivo_url, estado, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error listando tesis: ${error.message}`);
  }

  const tesisList = tesis ?? [];

  // Obtener relaciones en paralelo
  const enriched = await Promise.all(
    tesisList.map(async (t) => {
      // Alumnos relacionados
      const { data: rels } = await supabaseServer
        .from("alumno_tesis")
        .select("alumno_id, alumnos(id, nombre, correo)")
        .eq("tesis_id", t.id);

      const alumnos =
        (rels as unknown as { alumno_id: string; alumnos: { id: string; nombre: string; correo: string } }[])
          ?.map((r) => r.alumnos) ?? [];

      // Análisis
      const { data: analisisData } = await supabaseServer
        .from("analisis")
        .select("id, resultado, modelo_ia, created_at")
        .eq("tesis_id", t.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        ...t,
        alumnos,
        analisis: analisisData ?? null,
      };
    })
  );

  return enriched;
}

export async function getTesisById(id: string): Promise<TesisWithRelations> {
  const { data: tesis, error } = await supabaseServer
    .from("tesis")
    .select("id, titulo, archivo_nombre, archivo_url, estado, created_at")
    .eq("id", id)
    .single();

  if (error || !tesis) {
    throw new Error(`Error obteniendo tesis: ${error?.message ?? "Not found"}`);
  }

  // Alumnos relacionados
  const { data: rels } = await supabaseServer
    .from("alumno_tesis")
    .select("alumno_id, alumnos(id, nombre, correo)")
    .eq("tesis_id", id);

  const alumnos =
    (rels as unknown as { alumno_id: string; alumnos: { id: string; nombre: string; correo: string } }[])
      ?.map((r) => r.alumnos) ?? [];

  // Análisis
  const { data: analisisData } = await supabaseServer
    .from("analisis")
    .select("id, resultado, modelo_ia, created_at")
    .eq("tesis_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return {
    ...tesis,
    alumnos,
    analisis: analisisData ?? null,
  };
}
