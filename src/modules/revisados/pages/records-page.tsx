import { CheckCircle, AlertTriangle, Info } from "lucide-react";

import { useThesisRecords } from "@/src/shared/application/hooks/use-thesis-records";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";

export function RecordsPage() {
  const { data, loading, error } = useThesisRecords();

  const sections = data?.sections ?? [];
  const findings = data?.findings ?? [];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Cargando registros...</p>
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
        <h2 className="text-2xl font-bold tracking-tight">Registros de respuesta</h2>
        <p className="text-muted-foreground">
          Consulta las respuestas del agente y los hallazgos registrados.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Respuestas del agente</CardTitle>
                <CardDescription>
                  Salidas interpretadas por el sistema
                </CardDescription>
              </div>
              <Badge variant="secondary">Demo</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-lg border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{section.title}</h4>
                  <Badge variant="outline">{section.tone}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hallazgos</CardTitle>
                  <CardDescription>
                    Registros listos para seguimiento
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  Lectura
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {findings.map((finding) => (
                <div
                  key={finding.title}
                  className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold">{finding.title}</h4>
                    <Badge
                      variant={
                        finding.severity === "Fortaleza"
                          ? "default"
                          : finding.severity === "Alta prioridad"
                          ? "destructive"
                          : "secondary"
                      }
                      className="shrink-0 text-xs"
                    >
                      {finding.severity}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {finding.detail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trazabilidad</CardTitle>
              <CardDescription>
                Seguimiento por capítulos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <Info className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Capítulo 1</p>
                  <p className="text-xs text-muted-foreground">
                    Justificación y definición del problema
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Capítulo 2</p>
                  <p className="text-xs text-muted-foreground">
                    Referencias teóricas y citas observables
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Conclusiones</p>
                  <p className="text-xs text-muted-foreground">
                    Coherencia final con objetivos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
