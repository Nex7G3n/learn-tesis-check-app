"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  Users,
  Calendar,
  Sparkles,
  Download,
  User,
  Mail,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { MarkdownRenderer } from "@/src/components/markdown-renderer";
import {
  exportMarkdownToPdf,
  exportMarkdownToPdfArrayBuffer,
  pdfFilenameFromBasename,
} from "@/src/shared/utils/export-markdown-pdf";

interface Alumno {
  id: string;
  nombre: string;
  correo: string;
}

interface Analisis {
  id: string;
  resultado: string;
  modelo_ia: string;
  created_at: string;
}

interface Tesis {
  id: string;
  titulo: string | null;
  archivo_nombre: string;
  archivo_url: string;
  estado: string;
  created_at: string;
  alumnos: Alumno[];
  analisis: Analisis | null;
}

export function TesisDetailPage({ id }: { id: string }) {
  const [tesis, setTesis] = useState<Tesis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailToSend, setEmailToSend] = useState("");
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/tesis?id=${id}`);
        if (!res.ok) throw new Error("Error cargando tesis");
        const data = await res.json();
        setTesis(data.tesis ?? null);
        setEmailToSend(data.tesis?.alumnos?.[0]?.correo ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const toBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  };

  const handleExportPdf = async () => {
    const resultado = tesis?.analisis?.resultado;
    if (!resultado || exportingPdf) return;
    try {
      setExportingPdf(true);
      await exportMarkdownToPdf(resultado, pdfFilenameFromBasename(tesis?.archivo_nombre));
    } catch (e) {
      console.error(e);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleSendEmail = async () => {
    const resultado = tesis?.analisis?.resultado;
    if (!resultado || sendingEmail) return;

    try {
      setSendingEmail(true);
      setEmailMessage(null);
      setEmailError(null);

      const fileName = pdfFilenameFromBasename(tesis?.archivo_nombre);
      const pdfArrayBuffer = await exportMarkdownToPdfArrayBuffer(resultado, fileName);
      const pdfBase64 = toBase64(pdfArrayBuffer);

      const response = await fetch("/api/tesis/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: emailToSend,
          tesisId: tesis?.id,
          tesisTitle: tesis?.titulo ?? tesis?.archivo_nombre,
          fileName,
          pdfBase64,
        }),
      });

      const json = (await response.json()) as { error?: string; success?: boolean };
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "No se pudo enviar el correo");
      }

      setEmailMessage("Correo enviado correctamente.");
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : "No se pudo enviar el correo");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 text-[var(--brand)] animate-spin" />
      </div>
    );
  }

  if (error || !tesis) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">{error || "Tesis no encontrada"}</p>
          </div>
        </div>
        <Link href="/registros-respuesta">
          <Button variant="outline" className="border-[var(--line)] bg-white/5 hover:bg-white/10 text-white hover:text-white rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al listado
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="animate-appear">
        <Link href="/registros-respuesta">
          <Button
            variant="ghost"
            className="text-[var(--ink-soft)] hover:text-white hover:bg-white/5 -ml-2 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">
          {tesis.titulo || tesis.archivo_nombre}
        </h2>
        <p className="text-[var(--ink-soft)] mt-1">
          Detalle de la tesis y análisis de IA
        </p>
      </div>

      {/* Info general */}
      <div className="grid gap-4 md:grid-cols-3 animate-appear-delay">
        <Card className="mesh-card border-[var(--line)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--ink-soft)]" />
              Archivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white font-medium truncate">{tesis.archivo_nombre}</p>
            <a
              href={tesis.archivo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--brand)] hover:underline flex items-center gap-1 mt-1"
            >
              <Download className="h-3 w-3" />
              Descargar archivo
            </a>
          </CardContent>
        </Card>

        <Card className="mesh-card border-[var(--line)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--ink-soft)]" />
              Fecha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white font-medium">
              {new Date(tesis.created_at).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="mesh-card border-[var(--line)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--ink-soft)]" />
              Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={
                tesis.estado === "revisada"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full"
                  : tesis.estado === "en_revision"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full"
                  : "bg-white/5 text-[var(--ink-soft)] border border-[var(--line)] rounded-full"
              }
            >
              {tesis.estado === "revisada"
                ? "Revisada"
                : tesis.estado === "en_revision"
                ? "En revisión"
                : "Pendiente"}
            </Badge>
            {tesis.analisis && (
              <p className="text-xs text-[var(--ink-soft)] mt-2">
                Modelo: {tesis.analisis.modelo_ia}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alumnos */}
      <Card className="mesh-card border-[var(--line)] animate-appear-delay">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-[var(--brand)]" />
            Alumnos asociados
          </CardTitle>
          <CardDescription className="text-[var(--ink-soft)]">
            {tesis.alumnos.length} alumno{tesis.alumnos.length !== 1 ? "s" : ""} vinculado{tesis.alumnos.length !== 1 ? "s" : ""} a esta tesis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {tesis.alumnos.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-gradient-to-r from-[var(--brand)]/10 to-[var(--brand)]/5 pl-4 pr-4 py-2.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/20 ring-1 ring-[var(--brand)]/30">
                  <User className="h-4 w-4 text-[var(--brand)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{a.nombre}</span>
                  <span className="text-xs text-[var(--ink-soft)] flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {a.correo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis IA */}
      {tesis.analisis ? (
        <Card className="mesh-card border-[var(--line)] animate-appear-delay">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="h-5 w-5 text-[var(--brand)]" />
                  Análisis de IA
                </CardTitle>
                <CardDescription className="text-[var(--ink-soft)]">
                  Resultado generado por Gemini el{" "}
                  {new Date(tesis.analisis.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </CardDescription>
              </div>
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
                  <Download className="h-4 w-4 mr-2" />
                )}
                {exportingPdf ? "Generando..." : "Exportar PDF"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-xl border border-[var(--line)] bg-white/[0.03] p-4 space-y-3">
              <p className="text-sm text-white/90 font-medium">Enviar análisis por correo</p>
              <div className="flex gap-2 flex-wrap">
                <Input
                  type="email"
                  value={emailToSend}
                  onChange={(event) => setEmailToSend(event.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="min-w-[240px] flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sendingEmail || !emailToSend.trim()}
                  onClick={handleSendEmail}
                  className="border-[var(--line)] bg-white/5 hover:bg-white/10 text-white/80 rounded-xl disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  {sendingEmail ? "Enviando..." : "Enviar por correo"}
                </Button>
              </div>
              {emailMessage ? <p className="text-xs text-emerald-400">{emailMessage}</p> : null}
              {emailError ? <p className="text-xs text-red-400">{emailError}</p> : null}
            </div>
            <div className="max-h-[600px] overflow-y-auto rounded-xl border border-[var(--line)] bg-[#060e1a]/80 p-6 analysis-content">
              <MarkdownRenderer content={tesis.analisis.resultado} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mesh-card border-[var(--line)] animate-appear-delay">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Sparkles className="h-10 w-10 text-[var(--ink-soft)]/30 mb-4" />
            <p className="text-[var(--ink-soft)] text-sm">
              Esta tesis aún no tiene análisis de IA.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
