"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Sparkles, Mail, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { createSupabaseBrowserClient } from "@/src/shared/infrastructure/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.replace(redirectedFrom);
    router.refresh();
  }

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="space-y-3 p-8 pb-4">
        <CardTitle className="text-2xl text-white">Iniciar sesión</CardTitle>
        <CardDescription className="text-slate-300">
          Accede para usar tu panel y funcionalidades de análisis.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-2">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              Correo
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 border-white/15 bg-white/5 pl-10 text-white placeholder:text-slate-400 focus-visible:border-(--brand)"
                placeholder="tu_correo@dominio.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 border-white/15 bg-white/5 pl-10 text-white placeholder:text-slate-400 focus-visible:border-(--brand)"
                placeholder="Ingresa tu contraseña"
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <Button
            className="h-11 w-full bg-(--brand) text-[#06101d] hover:bg-(--brand-strong)"
            type="submit"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Entrar al panel"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020817] p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.26),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(21,128,61,0.2),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.16),transparent_40%)]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur md:grid-cols-2">
        <section className="hidden md:flex flex-col justify-between border-r border-white/10 bg-gradient-to-b from-emerald-950/45 to-slate-900/30 p-10 text-white">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Tesis IQ
            </div>
            <h1 className="text-3xl font-bold leading-tight">
              Revisión académica con IA, segura y trazable
            </h1>
            <p className="mt-4 text-sm text-slate-300">
              Inicia sesión para gestionar tesis, configurar tu API key personalizada y enviar
              informes en PDF por correo.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-3 text-sm text-slate-200">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
              Tu sesión y configuración se mantienen protegidas con autenticación y controles de
              acceso del servidor.
            </div>
          </div>
        </section>

        <Suspense fallback={
          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="p-8 pt-12 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[var(--brand)]" />
            </CardContent>
          </Card>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
