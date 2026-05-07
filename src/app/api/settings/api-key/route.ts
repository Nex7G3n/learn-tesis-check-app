import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/src/shared/services/auth.service";
import { getDecryptedUserApiKey, getUserApiKeyStatus, saveUserApiKey } from "@/src/shared/services/user-api-key.service";

const GEMINI_KEY_REGEX = /^AIza[0-9A-Za-z\-_]{20,}$/;

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const status = await getUserApiKeyStatus(user.id);
    const apiKey = await getDecryptedUserApiKey(user.id);
    return NextResponse.json({ ...status, apiKey });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const apiKey = (body?.apiKey as string | undefined)?.trim() ?? "";

    if (!apiKey) {
      return NextResponse.json({ error: "La API key es requerida" }, { status: 400 });
    }

    if (!GEMINI_KEY_REGEX.test(apiKey)) {
      return NextResponse.json(
        { error: "Formato de API key inválido para Gemini" },
        { status: 400 }
      );
    }

    const maskedKey = await saveUserApiKey(user.id, apiKey);
    return NextResponse.json({ success: true, configured: true, maskedKey });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
