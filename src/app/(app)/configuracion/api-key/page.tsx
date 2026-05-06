import { ApiKeySettingsForm } from "@/src/modules/settings/pages/api-key-settings-form";
import { getAuthenticatedUser } from "@/src/shared/services/auth.service";
import { getUserApiKeyStatus } from "@/src/shared/services/user-api-key.service";

export default async function ApiKeyPage() {
  const user = await getAuthenticatedUser();
  const initialStatus = user
    ? await getUserApiKeyStatus(user.id)
    : { configured: false, maskedKey: null };

  return <ApiKeySettingsForm initialStatus={initialStatus} />;
}
