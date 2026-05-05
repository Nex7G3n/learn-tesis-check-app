"use client";

import { type ChangeEvent } from "react";
import { Upload, FileCheck, AlertCircle, Sparkles } from "lucide-react";

import { useThesisUpload } from "@/src/shared/application/hooks/use-thesis-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";

export function UploadPage() {
  const {
    config,
    loading,
    error,
    selectedFile,
    uploading,
    uploadResult,
    uploadError,
    analyzing,
    analysisResult,
    analysisError,
    handleFileChange,
    handleUpload,
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
          Sube un documento para iniciar el proceso de revisión.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr]">
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

            {selectedFile && (
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Listo</Badge>
                </div>
              </div>
            )}

            {!!uploadResult && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    Archivo subido correctamente
                  </p>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">Error: {uploadError}</p>
                </div>
              </div>
            )}

            {selectedFile && !uploadResult && !uploading && (
              <Button onClick={handleUpload} className="w-full">
                Subir archivo
              </Button>
            )}

            {uploading && (
              <Button disabled className="w-full">
                Subiendo archivo...
              </Button>
            )}

            {!!uploadResult && !analyzing && !analysisResult && (
              <Button onClick={handleAnalyze} className="w-full" variant="default">
                <Sparkles className="h-4 w-4 mr-2" />
                Analizar con IA (Gemini)
              </Button>
            )}

            {analyzing && (
              <Button disabled className="w-full">
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Analizando con Gemini... (puede tardar unos segundos)
              </Button>
            )}

            {analysisError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">Error en análisis: {analysisError}</p>
                </div>
              </div>
            )}

            <Separator />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-semibold text-foreground">Formatos</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, DOC y DOCX
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-semibold text-foreground">Entrega</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Carga individual
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-semibold text-foreground">Destino</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Flujo automatizado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Características</CardTitle>
            <CardDescription>
              Funcionalidades del módulo de carga
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border bg-muted/30 p-4"
              >
                <h4 className="text-sm font-semibold">{feature.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {analysisResult}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
