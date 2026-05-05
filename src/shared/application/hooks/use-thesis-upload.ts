"use client";

import { useCallback, useEffect, useState } from "react";

import type { UploadConfig } from "@/src/shared/services/thesis-review-api";
import { analyzeThesisFile, fetchUploadConfig } from "@/src/shared/services/thesis-review-api";

export function useThesisUpload() {
  const [config, setConfig] = useState<UploadConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

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

  const handleFileChange = useCallback((file: File | null) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    setAnalysisError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setAnalyzing(true);
      setAnalysisError(null);
      const result = await analyzeThesisFile(selectedFile);
      setAnalysisResult(result);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Error al analizar");
    } finally {
      setAnalyzing(false);
    }
  }, [selectedFile]);

  return {
    config,
    loading,
    error,
    selectedFile,
    analyzing,
    analysisResult,
    analysisError,
    handleFileChange,
    handleAnalyze,
  };
}
