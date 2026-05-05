"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";

import { uploadFeatures } from "../application/thesis-review.snapshot";

export function ThesisUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.14),transparent_55%)]" />

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/75">
              Ruta de carga
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Cargar tesis
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--ink-soft)] sm:text-lg">
              Pantalla dedicada para iniciar el envio del documento y preparar el flujo que luego conectaras con n8n.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[var(--line)] bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Volver al inicio
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel rounded-[2rem] p-6 sm:p-7">
            <div className="rounded-[1.7rem] border border-dashed border-emerald-300/30 bg-[linear-gradient(180deg,rgba(34,197,94,0.12),rgba(255,255,255,0.03))] p-6 sm:p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-emerald-300 text-lg font-bold text-slate-950">
                PDF
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-white sm:text-3xl">
                Arrastra tu tesis aqui o selecciona un archivo
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
                Soporte para PDF, DOC y DOCX, con validacion de tamano, extension y estructura minima antes de lanzar el analisis.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <input
                  id="thesis-file"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="thesis-file"
                  className="cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-50"
                >
                  Elegir archivo
                </label>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                  Maximo sugerido: 25 MB
                </span>
              </div>
              {selectedFile ? (
                <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-100/10 px-4 py-3 text-sm text-emerald-100">
                  <p className="font-medium">Archivo seleccionado: {selectedFile.name}</p>
                  <p className="mt-1 text-emerald-100/80">
                    Tamano: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : null}

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-sm font-semibold text-white">Formatos</p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">PDF, DOC y DOCX</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-sm font-semibold text-white">Entrega</p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">Carga individual por tesis</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-sm font-semibold text-white">Destino</p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">Flujo automatizado con n8n</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6 sm:p-7">
            <p className="text-xs uppercase tracking-[0.28em] text-white/55">
              Preparacion del envio
            </p>
            <div className="mt-5 grid gap-4">
              {uploadFeatures.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-[1.35rem] border border-[var(--line)] bg-white/[0.04] p-4"
                >
                  <h3 className="text-base font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-slate-950/45 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/75">
                Estado esperado
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  01. Documento recibido y validado
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  02. Enviado al flujo de procesamiento
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  03. Registro listo para seguimiento
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
