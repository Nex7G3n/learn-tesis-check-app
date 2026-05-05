import { CheckCircle, AlertTriangle, Info } from "lucide-react";

import { useThesisRecords } from "@/src/shared/application/hooks/use-thesis-records";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

export function RecordsPage() {
  const { data, loading, error } = useThesisRecords();

  const sections = data?.sections ?? [];
  const findings = data?.findings ?? [];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-[var(--ink-soft)]">Cargando registros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="animate-appear">
        <h2 className="text-2xl font-bold tracking-tight">Registros de respuesta</h2>
        <p className="text-[var(--ink-soft)] mt-1">
          Consulta las respuestas del agente y los hallazgos registrados.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="mesh-card border-[var(--line)] animate-appear-delay">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-white">Respuestas del agente</CardTitle>
                <CardDescription className="text-[var(--ink-soft)]">
                  Salidas interpretadas por el sistema
                </CardDescription>
              </div>
              <Badge className="bg-[var(--brand)]/10 text-[var(--brand)] border-[var(--brand)]/30 hover:bg-[var(--brand)]/20">Demo</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-xl border border-[var(--line)] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-sm font-semibold text-white">{section.title}</h4>
                  <Badge variant="outline" className="border-[var(--line)] text-[var(--ink-soft)] bg-transparent">
                    {section.tone}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-[var(--ink-soft)] leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="mesh-card border-[var(--line)] animate-appear-delay">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-white">Hallazgos</CardTitle>
                  <CardDescription className="text-[var(--ink-soft)]">
                    Registros listos para seguimiento
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-[var(--line)] text-[var(--ink-soft)] bg-transparent">
                  Lectura
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {findings.map((finding) => (
                <div
                  key={finding.title}
                  className="rounded-xl border border-[var(--line)] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold text-white">{finding.title}</h4>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${
                        finding.severity === "Fortaleza"
                          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                          : finding.severity === "Alta prioridad"
                          ? "border-red-500/40 text-red-400 bg-red-500/10"
                          : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                      }`}
                    >
                      {finding.severity}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-[var(--ink-soft)] leading-relaxed">
                    {finding.detail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mesh-card border-[var(--line)] animate-appear-delay">
            <CardHeader>
              <CardTitle className="text-white">Trazabilidad</CardTitle>
              <CardDescription className="text-[var(--ink-soft)]">
                Seguimiento por capítulos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Info, title: "Capítulo 1", desc: "Justificación y definición del problema" },
                { icon: AlertTriangle, title: "Capítulo 2", desc: "Referencias teóricas y citas observables" },
                { icon: CheckCircle, title: "Conclusiones", desc: "Coherencia final con objetivos" },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]/20 shrink-0">
                    <item.icon className="h-5 w-5 text-[var(--brand)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-[var(--ink-soft)]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
