import { ApiKeySettingsForm } from "@/src/modules/settings/pages/api-key-settings-form";
import { getAuthenticatedUser } from "@/src/shared/services/auth.service";
import { getDecryptedUserApiKey, getUserApiKeyStatus } from "@/src/shared/services/user-api-key.service";

export default async function ApiKeyPage() {
  const user = await getAuthenticatedUser();
  const status = user
    ? await getUserApiKeyStatus(user.id)
    : { configured: false, maskedKey: null };
  const apiKey = user ? await getDecryptedUserApiKey(user.id) : null;

  return <ApiKeySettingsForm initialStatus={{ ...status, apiKey }} />;
}
