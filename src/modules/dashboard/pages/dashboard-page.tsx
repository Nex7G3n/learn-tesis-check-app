import { BarChart3, FileText, CheckCircle, Clock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

export function DashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="animate-appear">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-[var(--ink-soft)] mt-1">
          Vista general de métricas y estado del sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 animate-appear-delay">
        {[
          { label: "Total tesis", value: "24", helper: "+3 esta semana", icon: FileText },
          { label: "Revisadas", value: "18", helper: "75% completado", icon: CheckCircle },
          { label: "Pendientes", value: "6", helper: "En cola de revisión", icon: Clock },
          { label: "Hallazgos", value: "142", helper: "+12 esta semana", icon: BarChart3 },
        ].map((metric) => (
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
            <CardDescription className="text-[var(--ink-soft)]">Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]/20">
                  <FileText className="h-5 w-5 text-[var(--brand)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Tesis cargada #{i + 100}</p>
                  <p className="text-xs text-[var(--ink-soft)]">Hace {i * 2} horas</p>
                </div>
                <Badge
                  variant={i === 1 ? "default" : "secondary"}
                  className={i === 1 ? "bg-[var(--brand)] text-[#06101d] hover:bg-[var(--brand-strong)]" : "border-[var(--line)] bg-white/5 text-[var(--ink-soft)]"}
                >
                  {i === 1 ? "Completado" : "En proceso"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mesh-card border-[var(--line)] animate-appear-delay">
          <CardHeader>
            <CardTitle className="text-white">Estadísticas</CardTitle>
            <CardDescription className="text-[var(--ink-soft)]">Distribución de revisiones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: "Capítulo 1", value: 85 },
              { label: "Capítulo 2", value: 62 },
              { label: "Conclusiones", value: 90 },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{item.label}</span>
                  <span className="font-medium text-[var(--brand)]">{item.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--brand)] to-[var(--brand-strong)] transition-all duration-1000"
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
