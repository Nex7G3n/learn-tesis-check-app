import { supabaseServer } from "@/src/shared/infrastructure/supabase/server";

export interface AlumnoInput {
  nombre: string;
  correo: string;
}

export async function getAllAlumnos() {
  const { data, error } = await supabaseServer
    .from("alumnos")
    .select("id, nombre, correo")
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(`Error listando alumnos: ${error.message}`);
  }

  return data ?? [];
}

export async function findOrCreateAlumno(input: AlumnoInput) {
  const { data: existing, error: findError } = await supabaseServer
    .from("alumnos")
    .select("id, nombre, correo")
    .eq("correo", input.correo)
    .single();

  if (findError && findError.code !== "PGRST116") {
    throw new Error(`Error buscando alumno: ${findError.message}`);
  }

  if (existing) {
    if (existing.nombre !== input.nombre) {
      const { error: updError } = await supabaseServer
        .from("alumnos")
        .update({ nombre: input.nombre })
        .eq("id", existing.id);
      if (updError) throw new Error(`Error actualizando alumno: ${updError.message}`);
    }
    return existing;
  }

  const { data: created, error: createError } = await supabaseServer
    .from("alumnos")
    .insert({ nombre: input.nombre, correo: input.correo })
    .select("id, nombre, correo")
    .single();

  if (createError || !created) {
    throw new Error(`Error creando alumno: ${createError?.message ?? "unknown"}`);
  }

  return created;
}
