import { supabaseServer } from "@/src/shared/infrastructure/supabase/server";

export interface DashboardStats {
  totalTesis: number;
  revisadas: number;
  pendientes: number;
  totalAnalisis: number;
  totalAlumnos: number;
  tesisRecientes: {
    id: string;
    archivo_nombre: string;
    estado: string;
    created_at: string;
    alumnos: string[];
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Contar tesis
  const { data: tesisData, error: tesisError } = await supabaseServer
    .from("tesis")
    .select("id, estado, archivo_nombre, created_at", { count: "exact" });

  if (tesisError) throw new Error(`Error contando tesis: ${tesisError.message}`);

  const tesis = tesisData ?? [];
  const totalTesis = tesis.length;
  const revisadas = tesis.filter((t) => t.estado === "revisada").length;
  const pendientes = tesis.filter((t) => t.estado === "pendiente").length;

  // Contar análisis
  const { data: analisisData, error: analisisError } = await supabaseServer
    .from("analisis")
    .select("id", { count: "exact" });

  if (analisisError) throw new Error(`Error contando análisis: ${analisisError.message}`);

  const totalAnalisis = analisisData?.length ?? 0;

  // Contar alumnos
  const { data: alumnosData, error: alumnosError } = await supabaseServer
    .from("alumnos")
    .select("id", { count: "exact" });

  if (alumnosError) throw new Error(`Error contando alumnos: ${alumnosError.message}`);

  const totalAlumnos = alumnosData?.length ?? 0;

  // Tesis recientes (últimas 5)
  const tesisRecientesRaw = tesis
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const tesisRecientes = await Promise.all(
    tesisRecientesRaw.map(async (t) => {
      const { data: rels } = await supabaseServer
        .from("alumno_tesis")
        .select("alumnos(nombre)")
        .eq("tesis_id", t.id);

      const nombres =
        (rels as unknown as { alumnos: { nombre: string } }[])?.map((r) => r.alumnos.nombre) ?? [];

      return {
        id: t.id,
        archivo_nombre: t.archivo_nombre,
        estado: t.estado,
        created_at: t.created_at,
        alumnos: nombres,
      };
    })
  );

  return {
    totalTesis,
    revisadas,
    pendientes,
    totalAnalisis,
    totalAlumnos,
    tesisRecientes,
  };
}
