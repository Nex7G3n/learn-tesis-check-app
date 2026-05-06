"use client";

import { FormEvent, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";

type ApiKeyStatusResponse = {
  configured: boolean;
  maskedKey: string | null;
};

export function ApiKeySettingsForm({ initialStatus }: { initialStatus: ApiKeyStatusResponse }) {
  const [saving, setSaving] = useState(false);
  const [configured, setConfigured] = useState(initialStatus.configured);
  const [maskedKey, setMaskedKey] = useState<string | null>(initialStatus.maskedKey);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/settings/api-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      const json = (await response.json()) as {
        success?: boolean;
        configured?: boolean;
        maskedKey?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error ?? "No se pudo guardar la API key");
      }

      setConfigured(Boolean(json.configured));
      setMaskedKey(json.maskedKey ?? null);
      setApiKey("");
      setSuccess("API key guardada correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar API key");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurar API key</h2>
        <p className="text-muted-foreground">
          Esta clave se guarda cifrada en servidor y se usa para tus análisis con IA.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gemini API key</CardTitle>
          <CardDescription>
            Estado actual:{" "}
            {configured ? `configurada (${maskedKey ?? "oculta"})` : "sin configurar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Tu API key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="AIza..."
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                required
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-500">{success}</p> : null}

            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar API key"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
