"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";

type ApiKeyStatusResponse = {
  configured: boolean;
  maskedKey: string | null;
  apiKey: string | null;
};

export function ApiKeySettingsForm({ initialStatus }: { initialStatus: ApiKeyStatusResponse }) {
  const [saving, setSaving] = useState(false);
  const [configured, setConfigured] = useState(initialStatus.configured);
  const [maskedKey, setMaskedKey] = useState<string | null>(initialStatus.maskedKey);
  const [currentApiKey, setCurrentApiKey] = useState(initialStatus.apiKey ?? "");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentApiKey.trim()) return;

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/settings/api-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: currentApiKey.trim() }),
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
      setSuccess("API key guardada correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar API key");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="animate-appear">
        <h2 className="text-2xl font-bold tracking-tight">Configurar API key</h2>
        <p className="text-[var(--ink-soft)] mt-1">
          Esta clave se guarda cifrada en servidor y se usa para tus análisis con IA.
        </p>
      </div>

      <Card className="mesh-card border-[var(--line)] animate-appear-delay">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <KeyRound className="h-5 w-5 text-[var(--brand)]" />
            Gemini API key
          </CardTitle>
          <CardDescription className="text-[var(--ink-soft)]">
            {configured
              ? `Estado: configurada (${maskedKey ?? "oculta"})`
              : "Estado: sin configurar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-sm text-white/80">
                {configured ? "Tu API key actual" : "Tu API key"}
              </Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  placeholder="AIza..."
                  value={currentApiKey}
                  onChange={(event) => setCurrentApiKey(event.target.value)}
                  required
                  className="bg-white/[0.03] border-[var(--line)] text-white placeholder:text-[var(--ink-soft)]/50 pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-white transition-colors"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[var(--ink-soft)]/60">
                {configured
                  ? "Puedes editarla directamente y guardar para actualizar."
                  : "Ingresa tu API key de Gemini para empezar a analizar tesis."}
              </p>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {success}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={saving || !currentApiKey.trim()}
              className="bg-[var(--brand)] text-[#06101d] hover:bg-[var(--brand-strong)] rounded-xl font-semibold disabled:opacity-50"
            >
              {saving ? "Guardando..." : configured ? "Actualizar API key" : "Guardar API key"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
