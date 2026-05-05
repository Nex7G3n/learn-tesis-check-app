"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, CheckCircle, Clock, ArrowRight } from "lucide-react";

import { useThesisHome } from "@/src/shared/application/hooks/use-thesis-home";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";

export function HomePage() {
  const { data, loading, error } = useThesisHome();
  const [activeStage, setActiveStage] = useState(0);

  const stages = data?.stages ?? [];
  const metrics = data?.metrics ?? [];

  useEffect(() => {
    if (stages.length === 0) return;
    const interval = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % stages.length);
    }, 3200);
    return () => window.clearInterval(interval);
  }, [stages.length]);

  const currentStage = stages[activeStage];
  const progress = stages.length > 0 ? ((activeStage + 1) / stages.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Cargando dashboard...</p>
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
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen general del sistema de revisión de tesis.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.label}
              </CardTitle>
              {metric.label.includes("Tiempo") ? (
                <Clock className="h-4 w-4 text-muted-foreground" />
              ) : metric.label.includes("Trazabilidad") ? (
                <FileText className="h-4 w-4 text-muted-foreground" />
              ) : (
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Flujo de revisión</CardTitle>
            <CardDescription>
              Etapas del proceso de análisis de tesis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stages.map((stage, index) => {
              const isActive = activeStage === index;
              return (
                <div
                  key={stage.id}
                  className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                    isActive
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-bold ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    0{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">{stage.title}</h4>
                      {isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Activo
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {currentStage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Progreso del flujo
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/cargar-tesis" className="w-full">
              <Button className="w-full justify-between" variant="outline">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Cargar nueva tesis
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/registros-respuesta" className="w-full">
              <Button className="w-full justify-between" variant="outline">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Ver registros
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
