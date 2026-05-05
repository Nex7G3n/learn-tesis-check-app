"use client";

import { type ChangeEvent } from "react";
import { Upload, FileCheck, AlertCircle, Sparkles, Loader2 } from "lucide-react";

import { useThesisUpload } from "@/src/shared/application/hooks/use-thesis-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { MarkdownRenderer } from "@/src/components/markdown-renderer";

export function UploadPage() {
  const {
    config,
    loading,
    error,
    selectedFile,
    analyzing,
    analysisResult,
    analysisError,
    handleFileChange,
    handleAnalyze,
  } = useThesisUpload();

  const features = config?.features ?? [];

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileChange(file);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cargar tesis</h2>
        <p className="text-muted-foreground">
          Sube un documento para iniciar el proceso de revisión con IA.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir documento
            </CardTitle>
            <CardDescription>
              Arrastra tu archivo o selecciónalo desde tu dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedFile ? (
              /* Área de carga — solo visible cuando NO hay archivo */
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">
                  Arrastra tu tesis aquí
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  o haz clic para seleccionar un archivo
                </p>
                <input
                  id="thesis-file"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  onChange={onFileChange}
                />
                <Button
                  variant="outline"
                  type="button"
                  className="mt-4"
                  onClick={() => document.getElementById("thesis-file")?.click()}
                >
                  Elegir archivo
                </Button>
              </div>
            ) : (
              /* Archivo seleccionado + botón de revisión — centrado */
              <div className="flex flex-col items-center justify-center py-8 space-y-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <FileCheck className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Badge variant="outline" className="mt-1">Listo para revisar</Badge>
                </div>

                {!analyzing && !analysisResult && (
                  <Button onClick={handleAnalyze} className="w-full max-w-sm" variant="default">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Revisar con IA (Gemini)
                  </Button>
                )}

                {/* Error de análisis */}
                {analysisError && (
                  <div className="w-full max-w-sm rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm font-medium">Error en análisis: {analysisError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Animación de IA trabajando */}
      {analyzing && (
        <Card className="border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <h3 className="mt-6 text-lg font-semibold">La IA está trabajando en tu documento</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
              Esto puede tardar unos segundos. Gemini está revisando la estructura, citas, formato y contenido de tu tesis.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>Analizando con Gemini 2.5 Flash...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado del análisis */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Resultado del análisis con Gemini
                </CardTitle>
                <CardDescription>
                  Revisión generada por IA basada en tu prompt y esquema
                </CardDescription>
              </div>
              <Badge variant="secondary">IA</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto rounded-lg border bg-muted/20 p-5">
              <MarkdownRenderer content={analysisResult} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
