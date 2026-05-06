import { supabaseServer } from "@/src/shared/infrastructure/supabase/server";
import { decryptApiKey, encryptApiKey, maskApiKey } from "@/src/shared/services/api-key-crypto.service";

type UserApiKeyRow = {
  user_id: string;
  api_key_encrypted: string;
  api_key_masked: string;
};

const TABLE_NAME = "user_api_keys";

export async function saveUserApiKey(userId: string, apiKey: string): Promise<string> {
  const apiKeyEncrypted = encryptApiKey(apiKey);
  const apiKeyMasked = maskApiKey(apiKey);

  const { error } = await supabaseServer.from(TABLE_NAME).upsert(
    {
      user_id: userId,
      api_key_encrypted: apiKeyEncrypted,
      api_key_masked: apiKeyMasked,
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    throw new Error(`No se pudo guardar la API key: ${error.message}`);
  }

  return apiKeyMasked;
}

export async function getUserApiKeyStatus(userId: string): Promise<{
  configured: boolean;
  maskedKey: string | null;
}> {
  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .select("api_key_masked")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo consultar el estado de la API key: ${error.message}`);
  }

  return {
    configured: Boolean(data?.api_key_masked),
    maskedKey: data?.api_key_masked ?? null,
  };
}

export async function getDecryptedUserApiKey(userId: string): Promise<string | null> {
  const { data, error } = await supabaseServer
    .from(TABLE_NAME)
    .select("user_id, api_key_encrypted, api_key_masked")
    .eq("user_id", userId)
    .maybeSingle<UserApiKeyRow>();

  if (error) {
    throw new Error(`No se pudo leer la API key del usuario: ${error.message}`);
  }

  if (!data?.api_key_encrypted) {
    return null;
  }

  return decryptApiKey(data.api_key_encrypted);
}
