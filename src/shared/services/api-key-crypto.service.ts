import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function getEncryptionSecret() {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET ?? "";
  if (!secret) {
    throw new Error("API_KEY_ENCRYPTION_SECRET no está configurada");
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptApiKey(plainText: string): string {
  const key = getEncryptionSecret();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}.${encrypted.toString("base64")}.${authTag.toString("base64")}`;
}

export function decryptApiKey(cipherText: string): string {
  const [ivB64, encryptedB64, authTagB64] = cipherText.split(".");
  if (!ivB64 || !encryptedB64 || !authTagB64) {
    throw new Error("Formato de API key cifrada inválido");
  }

  const key = getEncryptionSecret();
  const iv = Buffer.from(ivB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return "*".repeat(apiKey.length);
  }

  const start = apiKey.slice(0, 4);
  const end = apiKey.slice(-4);
  return `${start}${"*".repeat(Math.max(4, apiKey.length - 8))}${end}`;
}
