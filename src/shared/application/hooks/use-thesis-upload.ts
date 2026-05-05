"use client";

import { useCallback, useEffect, useState } from "react";

import type { UploadConfig } from "@/src/shared/services/thesis-review-api";
import { analyzeThesisFile, fetchUploadConfig, uploadThesisFile } from "@/src/shared/services/thesis-review-api";

export function useThesisUpload() {
  const [config, setConfig] = useState<UploadConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<unknown | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
    setUploadResult(null);
    setUploadError(null);
    setAnalysisResult(null);
    setAnalysisError(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadError(null);
      const result = await uploadThesisFile(selectedFile);
      setUploadResult(result);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }, [selectedFile]);

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
    uploading,
    uploadResult,
    uploadError,
    analyzing,
    analysisResult,
    analysisError,
    handleFileChange,
    handleUpload,
    handleAnalyze,
  };
}
