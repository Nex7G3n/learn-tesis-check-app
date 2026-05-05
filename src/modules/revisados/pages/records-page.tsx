"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Loader2,
  AlertCircle,
  Users,
  Calendar,
  Sparkles,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

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

export function RecordsPage() {
  const [tesis, setTesis] = useState<Tesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/tesis");
        if (!res.ok) throw new Error("Error cargando tesis");
        const data = await res.json();
        setTesis(data.tesis ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "revisada":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Revisada
          </Badge>
        );
      case "en_revision":
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
            <Clock className="h-3 w-3 mr-1" />
            En revisión
          </Badge>
        );
      default:
        return (
          <Badge className="bg-white/5 text-[var(--ink-soft)] border border-[var(--line)] rounded-full">
            Pendiente
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 text-[var(--brand)] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="animate-appear">
        <h2 className="text-2xl font-bold tracking-tight">Tesis revisadas</h2>
        <p className="text-[var(--ink-soft)] mt-1">
          Listado de tesis con sus análisis de IA.
        </p>
      </div>

      {tesis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-appear">
          <FileText className="h-12 w-12 text-[var(--ink-soft)]/30 mb-4" />
          <p className="text-[var(--ink-soft)] text-sm">
            No hay tesis registradas aún.
          </p>
          <p className="text-[var(--ink-soft)]/60 text-xs mt-1">
            Ve a "Revisor" para subir y analizar una tesis.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-appear-delay">
          {tesis.map((t) => (
            <Link key={t.id} href={`/registros-respuesta/${t.id}`}>
              <Card className="mesh-card border-[var(--line)] h-full hover:border-[var(--brand)]/30 hover:bg-white/[0.02] transition-all cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]/20 shrink-0">
                      <FileText className="h-5 w-5 text-[var(--brand)]" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {getEstadoBadge(t.estado)}
                      {t.analisis && (
                        <Badge className="bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/30 rounded-full text-[10px]">
                          <Sparkles className="h-2.5 w-2.5 mr-1" />
                          Con análisis IA
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[var(--brand)] transition-colors">
                      {t.titulo || t.archivo_nombre}
                    </h3>
                    <p className="text-xs text-[var(--ink-soft)] mt-1">
                      {t.archivo_nombre}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[var(--ink-soft)]">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{t.alumnos.length} alumno{t.alumnos.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(t.created_at).toLocaleDateString("es-ES")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--line)]/60">
                    {t.alumnos.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-1.5 rounded-full bg-white/[0.03] border border-[var(--line)] px-2.5 py-1"
                      >
                        <div className="h-5 w-5 rounded-full bg-[var(--brand)]/15 flex items-center justify-center text-[10px] font-bold text-[var(--brand)]">
                          {a.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] text-white/80 truncate max-w-[80px]">
                          {a.nombre}
                        </span>
                      </div>
                    ))}
                    {t.alumnos.length > 3 && (
                      <span className="text-[10px] text-[var(--ink-soft)]">
                        +{t.alumnos.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[var(--brand)] group-hover:underline">
                    <Eye className="h-3.5 w-3.5" />
                    Ver detalle
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
