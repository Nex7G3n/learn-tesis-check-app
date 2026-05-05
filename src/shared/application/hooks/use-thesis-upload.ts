"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { UploadConfig } from "@/src/shared/services/thesis-review-api";
import { analyzeThesisFile, fetchUploadConfig, saveAnalysis, uploadThesisFile } from "@/src/shared/services/thesis-review-api";

export type AlumnoExistente = {
  id: string;
  nombre: string;
  correo: string;
};

export type AlumnoSeleccionado =
  | { tipo: "existente"; id: string; nombre: string; correo: string }
  | { tipo: "nuevo"; nombre: string; correo: string };

export function useThesisUpload() {
  const [config, setConfig] = useState<UploadConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref para prevenir doble submit
  const isRunningRef = useRef(false);

  // Alumnos de la BD
  const [alumnosBD, setAlumnosBD] = useState<AlumnoExistente[]>([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);

  // Selección
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState<AlumnoSeleccionado[]>([]);

  // Modal nuevo alumno
  const [showNuevoAlumno, setShowNuevoAlumno] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");

  // Tesis
  const [tesisId, setTesisId] = useState<string | null>(null);

  // Proceso global (subida + análisis en paralelo)
  const [processing, setProcessing] = useState(false);

  // Análisis
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Guardado
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const result = await fetchUploadConfig();
        if (!cancelled) setConfig(result);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cargar alumnos de la BD
  useEffect(() => {
    let cancelled = false;

    async function loadAlumnos() {
      try {
        setLoadingAlumnos(true);
        const res = await fetch("/api/alumnos");
        if (!res.ok) throw new Error("Error cargando alumnos");
        const data = await res.json();
        if (!cancelled) setAlumnosBD(data.alumnos ?? []);
      } catch (err) {
        if (!cancelled) console.error("Error cargando alumnos:", err);
      } finally {
        if (!cancelled) setLoadingAlumnos(false);
      }
    }

    loadAlumnos();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileChange = useCallback((file: File | null) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    setAnalysisError(null);
    setTesisId(null);
    setSaved(false);
    setSaveError(null);
  }, []);

  const handleAgregarAlumnoExistente = useCallback((alumnoId: string) => {
    const alumno = alumnosBD.find((a) => a.id === alumnoId);
    if (!alumno) return;
    // Evitar duplicados
    setAlumnosSeleccionados((prev) => {
      if (prev.some((a) => a.tipo === "existente" && a.id === alumnoId)) return prev;
      return [...prev, { tipo: "existente", id: alumno.id, nombre: alumno.nombre, correo: alumno.correo }];
    });
  }, [alumnosBD]);

  const handleAgregarNuevoAlumno = useCallback(() => {
    if (!nuevoNombre.trim() || !nuevoCorreo.trim()) return;
    // Evitar duplicados por correo
    setAlumnosSeleccionados((prev) => {
      if (prev.some((a) => a.correo === nuevoCorreo.trim())) return prev;
      return [...prev, { tipo: "nuevo", nombre: nuevoNombre.trim(), correo: nuevoCorreo.trim() }];
    });
    setNuevoNombre("");
    setNuevoCorreo("");
    setShowNuevoAlumno(false);
  }, [nuevoNombre, nuevoCorreo]);

  const handleRemoveAlumno = useCallback((index: number) => {
    setAlumnosSeleccionados((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;
    if (alumnosSeleccionados.length === 0) {
      setError("Debe seleccionar al menos un alumno");
      return;
    }
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    setError(null);
    setAnalysisError(null);
    setAnalysisResult(null);
    setSaved(false);
    setSaveError(null);
    setProcessing(true);

    // Construir payload de alumnos para la API
    const alumnosPayload = alumnosSeleccionados.map((a) => ({
      nombre: a.nombre,
      correo: a.correo,
    }));

    // Subida y análisis en PARALELO
    const uploadPromise = uploadThesisFile(selectedFile, alumnosPayload, undefined);
    const analyzePromise = analyzeThesisFile(selectedFile);

    const [uploadResult, analyzeResult] = await Promise.allSettled([
      uploadPromise,
      analyzePromise,
    ]);

    // Procesar resultados
    if (uploadResult.status === "fulfilled") {
      setTesisId(uploadResult.value.tesis_id);
    }

    if (analyzeResult.status === "fulfilled") {
      setAnalysisResult(analyzeResult.value.analysis);
    }

    // Errores
    const errs: string[] = [];
    if (uploadResult.status === "rejected") {
      errs.push(uploadResult.reason instanceof Error ? uploadResult.reason.message : "Error al subir la tesis");
    }
    if (analyzeResult.status === "rejected") {
      errs.push(analyzeResult.reason instanceof Error ? analyzeResult.reason.message : "Error al analizar");
      setAnalysisError(analyzeResult.reason instanceof Error ? analyzeResult.reason.message : "Error al analizar");
    }
    if (errs.length > 0) {
      setError(errs.join(" | "));
    }

    setProcessing(false);
    isRunningRef.current = false;
  }, [selectedFile, alumnosSeleccionados]);

  const handleSave = useCallback(async () => {
    if (!tesisId || !analysisResult) return;
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    try {
      setSaving(true);
      setSaveError(null);
      await saveAnalysis(tesisId, analysisResult);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
      isRunningRef.current = false;
    }
  }, [tesisId, analysisResult]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setAlumnosSeleccionados([]);
    setTesisId(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setSaved(false);
    setSaveError(null);
    setError(null);
    setShowNuevoAlumno(false);
    setNuevoNombre("");
    setNuevoCorreo("");
  }, []);

  return {
    config,
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
  };
}
