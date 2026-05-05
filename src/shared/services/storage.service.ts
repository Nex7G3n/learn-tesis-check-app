import { supabaseServer } from "@/src/shared/infrastructure/supabase/server";

const BUCKET = process.env.SUPABASE_BUCKET ?? "archivos";

export async function uploadFileToStorage(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ path: string; url: string }> {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `tesis/${timestamp}_${safeName}`;

  const { error } = await supabaseServer.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir archivo: ${error.message}`);
  }

  const { data } = supabaseServer.storage.from(BUCKET).getPublicUrl(path);

  return { path, url: data.publicUrl };
}
