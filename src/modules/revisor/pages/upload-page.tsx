"use client";

import { type ChangeEvent, useState } from "react";
import {
  Upload,
  FileCheck,
  AlertCircle,
  Sparkles,
  Loader2,
  FileText,
  Save,
  Plus,
  X,
  RotateCcw,
  User,
  Mail,
  Users,
  CheckCircle2,
  ChevronDown,
  Share2,
  Send,
} from "lucide-react";

import { useThesisUpload } from "@/src/shared/application/hooks/use-thesis-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { MarkdownRenderer } from "@/src/components/markdown-renderer";
import { exportMarkdownToPdfArrayBuffer, pdfFilenameFromBasename } from "@/src/shared/utils/export-markdown-pdf";

export function UploadPage() {
  const {
    loading,
    error,
    selectedFile,
    alumnosBD,
    loadingAlumnos,
    alumnosSeleccionados,
    showNuevoAlumno,
    nuevoNombre,
    nuevoCorreo,
    processing,
    analysisResult,
    analysisError,
    saving,
    saved,
    saveError,
    setNuevoNombre,
    setNuevoCorreo,
    setShowNuevoAlumno,
    handleFileChange,
    handleAgregarAlumnoExistente,
    handleAgregarNuevoAlumno,
    handleRemoveAlumno,
    handleAnalyze,
    handleSave,
    handleReset,
  } = useThesisUpload();

  const [selectedAlumnoId, setSelectedAlumnoId] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);

  // Modal compartir
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileChange(file);
  };

  const onAddExistente = () => {
    if (!selectedAlumnoId) return;
    handleAgregarAlumnoExistente(selectedAlumnoId);
    setSelectedAlumnoId("");
  };

  const handleExportPdf = async () => {
    if (!analysisResult || exportingPdf) return;
    try {
      setExportingPdf(true);
      const { exportMarkdownToPdf } = await import("@/src/shared/utils/export-markdown-pdf");
      await exportMarkdownToPdf(analysisResult, pdfFilenameFromBasename(selectedFile?.name));
    } catch (e) {
      console.error(e);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleSendEmail = async () => {
    if (!analysisResult || !selectedFile || alumnosSeleccionados.length === 0) return;

    try {
      setSharing(true);
      setShareError(null);
      setShareSuccess(false);

      // Generar PDF como ArrayBuffer
      const pdfBuffer = await exportMarkdownToPdfArrayBuffer(
        analysisResult,
        pdfFilenameFromBasename(selectedFile.name)
      );

      // Convertir a base64
      const pdfBase64 = btoa(
        new Uint8Array(pdfBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const tesisTitle = selectedFile.name.replace(/\.(pdf|docx?)$/i, "");
      const fileName = pdfFilenameFromBasename(selectedFile.name);

      // Enviar a cada alumno
      const correos = alumnosSeleccionados.map((a) => a.correo);
      const results = await Promise.allSettled(
        correos.map(async (toEmail) => {
          const res = await fetch("/api/tesis/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              toEmail,
              tesisTitle,
              fileName,
              pdfBase64,
            }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || `Error enviando a ${toEmail}`);
          }
          return toEmail;
        })
      );

      const fallos = results
        .filter((r): r is PromiseRejectedResult => r.status === "rejected")
        .map((r) => r.reason instanceof Error ? r.reason.message : String(r.reason));

      if (fallos.length > 0) {
        setShareError(`Errores: ${fallos.join("; ")}`);
      } else {
        setShareSuccess(true);
      }
    } catch (err) {
      setShareError(err instanceof Error ? err.message : "Error al enviar correos");
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-[var(--ink-soft)]">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="animate-appear">
        <h2 className="text-2xl font-bold tracking-tight">Cargar tesis</h2>
        <p className="text-[var(--ink-soft)] mt-1">
          Selecciona alumnos, sube el documento y revisa con IA.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 animate-appear">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Formulario principal: solo visible cuando no hay resultado ni está procesando */}
      {!analysisResult && !processing && (
        <div className="grid gap-6 animate-appear-delay">
          {/* Selección de alumnos */}
          <Card className="mesh-card border-[var(--line)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-[var(--brand)]" />
                Alumnos asociados
              </CardTitle>
              <CardDescription className="text-[var(--ink-soft)]">
                Selecciona alumnos existentes o agrega uno nuevo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Selector de existentes */}
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs text-[var(--ink-soft)]">Alumno existente</Label>
                  <div className="relative">
                    <select
                      value={selectedAlumnoId}
                      onChange={(e) => setSelectedAlumnoId(e.target.value)}
                      disabled={loadingAlumnos}
                      className="w-full h-10 rounded-xl border border-[var(--line)] bg-white/[0.03] text-white px-3 pr-10 appearance-none focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/20 outline-none disabled:opacity-50"
                    >
                      <option value="" className="bg-[#0a1526]">
                        {loadingAlumnos ? "Cargando..." : "Seleccionar alumno..."}
                      </option>
                      {alumnosBD.map((a) => (
                        <option key={a.id} value={a.id} className="bg-[#0a1526]">
                          {a.nombre} — {a.correo}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-soft)] pointer-events-none" />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={onAddExistente}
                  disabled={!selectedAlumnoId}
                  className="bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/30 hover:bg-[var(--brand)]/20 rounded-xl disabled:opacity-40"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {/* Form inline para nuevo alumno */}
              {showNuevoAlumno && (
                <div className="rounded-xl border border-[var(--brand)]/20 bg-[var(--brand)]/5 p-4 space-y-3 animate-appear">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Nuevo alumno</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNuevoAlumno(false)}
                      className="h-7 w-7 text-[var(--ink-soft)] hover:text-white hover:bg-white/5"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
                        <User className="h-3 w-3" />
                        Nombre
                      </div>
                      <Input
                        placeholder="Nombre completo"
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                        className="bg-white/[0.03] border-[var(--line)] text-white placeholder:text-[var(--ink-soft)]/50 focus:border-[var(--brand)]/50 focus:ring-[var(--brand)]/20 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
                        <Mail className="h-3 w-3" />
                        Correo
                      </div>
                      <Input
                        type="email"
                        placeholder="alumno@universidad.edu"
                        value={nuevoCorreo}
                        onChange={(e) => setNuevoCorreo(e.target.value)}
                        className="bg-white/[0.03] border-[var(--line)] text-white placeholder:text-[var(--ink-soft)]/50 focus:border-[var(--brand)]/50 focus:ring-[var(--brand)]/20 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAgregarNuevoAlumno}
                      disabled={!nuevoNombre.trim() || !nuevoCorreo.trim()}
                      className="bg-[var(--brand)] text-[#06101d] hover:bg-[var(--brand-strong)] rounded-xl font-semibold disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar a la lista
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de seleccionados */}
              {alumnosSeleccionados.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-medium text-[var(--ink-soft)] uppercase tracking-wider">
                    Alumnos seleccionados ({alumnosSeleccionados.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {alumnosSeleccionados.map((a, index) => (
                      <div
                        key={`${a.correo}-${index}`}
                        className="group flex items-center gap-3 rounded-xl border border-[var(--line)] bg-gradient-to-r from-[var(--brand)]/10 to-[var(--brand)]/5 pl-4 pr-2 py-2.5 hover:border-[var(--brand)]/40 transition-all"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/20 ring-1 ring-[var(--brand)]/30">
                          <User className="h-4 w-4 text-[var(--brand)]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-white truncate">{a.nombre}</span>
                          <span className="text-xs text-[var(--ink-soft)] truncate">{a.correo}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAlumno(index)}
                          className="ml-1 rounded-lg p-1.5 text-[var(--ink-soft)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Área de archivo */}
          <Card className="mesh-card border-[var(--line)]">
            {!selectedFile && (
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Upload className="h-5 w-5 text-[var(--brand)]" />
                  Subir documento
                </CardTitle>
                <CardDescription className="text-[var(--ink-soft)]">
                  Arrastra tu archivo o selecciónalo desde tu dispositivo.
                </CardDescription>
              </CardHeader>
            )}
            <CardContent className="space-y-6">
              {!selectedFile ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--line)] bg-white/[0.02] px-6 py-14 text-center transition-colors hover:border-[var(--brand)]/40 hover:bg-white/[0.04]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]/20">
                    <Upload className="h-7 w-7 text-[var(--brand)]" />
                  </div>
                  <h3 className="mt-5 text-sm font-semibold text-white">
                    Arrastra tu tesis aquí
                  </h3>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">
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
                    className="mt-5 border-[var(--line)] bg-white/5 hover:bg-white/10 text-white hover:text-white rounded-xl"
                    onClick={() => document.getElementById("thesis-file")?.click()}
                  >
                    Elegir archivo
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 space-y-6">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]/20">
                      <FileCheck className="h-10 w-10 text-[var(--brand)]" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-medium text-white">{selectedFile.name}</p>
                      <p className="text-sm text-[var(--ink-soft)]">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="mt-1 border-[var(--brand)]/30 text-[var(--brand)] bg-[var(--brand)]/10 rounded-full px-3"
                    >
                      Listo para revisar
                    </Badge>
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={processing || alumnosSeleccionados.length === 0}
                    className="w-full max-w-sm bg-[var(--brand)] text-[#06101d] hover:bg-[var(--brand-strong)] rounded-xl font-semibold shadow-lg shadow-[var(--brand)]/20 disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Revisar con IA (Gemini)
                  </Button>

                  {analysisError && (
                    <div className="w-full max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p className="text-sm font-medium">
                          Error en análisis: {analysisError}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Procesando */}
      {processing && (
        <Card className="mesh-card border-[var(--brand)]/20 animate-appear">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[var(--brand)]/20 animate-ping" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]/30">
                <Loader2 className="h-10 w-10 text-[var(--brand)] animate-spin" />
              </div>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-white">
              La IA está trabajando en tu documento
            </h3>
            <p className="mt-2 text-sm text-[var(--ink-soft)] text-center max-w-md">
              Esto puede tardar unos segundos. Gemini está revisando la
              estructura, citas, formato y contenido de tu tesis.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-[var(--ink-soft)]">
              <Sparkles className="h-3 w-3 animate-pulse text-[var(--brand)]" />
              <span>Analizando con Gemini 2.5 Flash...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado */}
      {analysisResult && (
        <div className="space-y-4 animate-appear">
          {/* Acciones */}
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || saved}
              className={`rounded-xl font-semibold shadow-lg transition-all ${
                saved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                  : "bg-[var(--brand)] text-[#06101d] hover:bg-[var(--brand-strong)] shadow-[var(--brand)]/20"
              }`}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saved ? "Análisis guardado" : saving ? "Guardando..." : "Guardar análisis"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={exportingPdf}
              onClick={handleExportPdf}
              className="border-[var(--line)] bg-white/5 hover:bg-white/10 text-white/80 rounded-xl disabled:opacity-50"
            >
              {exportingPdf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {exportingPdf ? "Generando PDF..." : "Exportar PDF"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareModal(true)}
              disabled={sharing}
              className="border-[var(--line)] bg-white/5 hover:bg-white/10 text-white/80 rounded-xl disabled:opacity-50"
            >
              {sharing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4 mr-2" />
              )}
              {sharing ? "Enviando..." : "Compartir"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-[var(--line)] bg-white/5 hover:bg-white/10 text-white/80 rounded-xl"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Nueva tesis
            </Button>
          </div>

          {saveError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">Error al guardar: {saveError}</p>
              </div>
            </div>
          )}

          <Card className="mesh-card border-[var(--line)]">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-[var(--brand)]" />
                    Resultado del análisis con Gemini
                  </CardTitle>
                  <CardDescription className="text-[var(--ink-soft)]">
                    Revisión generada por IA basada en tu prompt y esquema
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/[0.03] px-4 py-2">
                  <FileText className="h-4 w-4 text-[var(--ink-soft)] shrink-0" />
                  <span
                    className="text-sm font-medium text-white/80 truncate max-w-[180px]"
                    title={selectedFile?.name}
                  >
                    {selectedFile?.name}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto rounded-xl border border-[var(--line)] bg-[#060e1a]/80 p-6 analysis-content">
                <MarkdownRenderer content={analysisResult} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Compartir */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="bg-[#0d1c31] border-[var(--line)] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[var(--brand)]" />
              Compartir análisis
            </DialogTitle>
            <DialogDescription className="text-[var(--ink-soft)]">
              Se enviará el informe en PDF a los siguientes correos:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {alumnosSeleccionados.map((a, i) => (
              <div
                key={`${a.correo}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white/[0.03] px-4 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/20 ring-1 ring-[var(--brand)]/30">
                  <Mail className="h-4 w-4 text-[var(--brand)]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-white truncate">{a.nombre}</span>
                  <span className="text-xs text-[var(--ink-soft)] truncate">{a.correo}</span>
                </div>
              </div>
            ))}
          </div>

          {shareSuccess && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Correos enviados correctamente
              </div>
            </div>
          )}

          {shareError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {shareError}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowShareModal(false);
                setShareSuccess(false);
                setShareError(null);
              }}
              className="border-[var(--line)] bg-white/5 hover:bg-white/10 text-white hover:text-white rounded-xl"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sharing || shareSuccess}
              className="bg-[var(--brand)] text-[#06101d] hover:bg-[var(--brand-strong)] rounded-xl font-semibold disabled:opacity-50"
            >
              {sharing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {sharing ? "Enviando..." : shareSuccess ? "Enviado" : "Enviar correos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
