"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, FileText, CheckCircle, Clock, Users, Loader2, AlertCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

interface DashboardData {
  totalTesis: number;
  revisadas: number;
  pendientes: number;
  totalAnalisis: number;
  totalAlumnos: number;
  tesisRecientes: {
    id: string;
    archivo_nombre: string;
    estado: string;
    created_at: string;
    alumnos: string[];
  }[];
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Error cargando estadísticas");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

  const stats = [
    {
      label: "Total tesis",
      value: String(data?.totalTesis ?? 0),
      helper: `${data?.totalTesis ? Math.round(((data?.revisadas ?? 0) / data.totalTesis) * 100) : 0}% revisadas`,
      icon: FileText,
    },
    {
      label: "Revisadas",
      value: String(data?.revisadas ?? 0),
      helper: `${data?.totalTesis ? Math.round(((data?.revisadas ?? 0) / data.totalTesis) * 100) : 0}% del total`,
      icon: CheckCircle,
    },
    {
      label: "Pendientes",
      value: String(data?.pendientes ?? 0),
      helper: "En cola de revisión",
      icon: Clock,
    },
    {
      label: "Análisis",
      value: String(data?.totalAnalisis ?? 0),
      helper: `${data?.totalAlumnos ?? 0} alumnos registrados`,
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="animate-appear">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-[var(--ink-soft)] mt-1">
          Vista general de métricas y estado del sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 animate-appear-delay">
        {stats.map((metric) => (
          <Card key={metric.label} className="mesh-card border-[var(--line)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">{metric.label}</CardTitle>
              <metric.icon className="h-4 w-4 text-[var(--ink-soft)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <p className="text-xs text-[var(--ink-soft)]">{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="mesh-card border-[var(--line)] animate-appear-delay">
          <CardHeader>
            <CardTitle className="text-white">Actividad reciente</CardTitle>
            <CardDescription className="text-[var(--ink-soft)]">
              Últimas tesis registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex flex-col">
            {data?.tesisRecientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-[var(--ink-soft)]/30 mb-3" />
                <p className="text-sm text-[var(--ink-soft)]">No hay tesis registradas aún</p>
              </div>
            ) : (
              data?.tesisRecientes.map((t) => (
                <Link key={t.id} href={`/registros-respuesta/${t.id}`}>
                  <div className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]/20">
                      <FileText className="h-5 w-5 text-[var(--brand)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{t.archivo_nombre}</p>
                      <p className="text-xs text-[var(--ink-soft)]">
                        {t.alumnos.length > 0 ? (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {t.alumnos.join(", ")}
                          </span>
                        ) : (
                          "Sin alumnos asignados"
                        )}
                      </p>
                    </div>
                    <Badge
                      className={
                        t.estado === "revisada"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full shrink-0"
                          : t.estado === "en_revision"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full shrink-0"
                          : "border-[var(--line)] bg-white/5 text-[var(--ink-soft)] rounded-full shrink-0"
                      }
                    >
                      {t.estado === "revisada" ? "Revisada" : t.estado === "en_revision" ? "En revisión" : "Pendiente"}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="mesh-card border-[var(--line)] animate-appear-delay">
          <CardHeader>
            <CardTitle className="text-white">Distribución</CardTitle>
            <CardDescription className="text-[var(--ink-soft)]">
              Estado de las tesis en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              {
                label: "Revisadas",
                value: data?.totalTesis ? Math.round(((data?.revisadas ?? 0) / data.totalTesis) * 100) : 0,
                color: "from-emerald-500 to-emerald-600",
              },
              {
                label: "Pendientes",
                value: data?.totalTesis ? Math.round(((data?.pendientes ?? 0) / data.totalTesis) * 100) : 0,
                color: "from-amber-500 to-amber-600",
              },
              {
                label: "En revisión",
                value: data?.totalTesis
                  ? Math.round(
                      (((data?.totalTesis ?? 0) - (data?.revisadas ?? 0) - (data?.pendientes ?? 0)) / data.totalTesis) * 100
                    )
                  : 0,
                color: "from-blue-500 to-blue-600",
              },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{item.label}</span>
                  <span className="font-medium text-[var(--brand)]">{item.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
