import { createSupabaseServerAuthClient } from "@/src/shared/infrastructure/supabase/server-auth";

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerAuthClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}
