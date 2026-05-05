import type {
  ExampleFinding,
  ExampleResponseSection,
  InsightCard,
  ReviewStage,
  UploadFeature,
  ValueMetric,
} from "@/src/shared/domain/review-stage";

const BASE_URL = "/api";

export type HomeData = {
  stages: ReviewStage[];
  metrics: ValueMetric[];
  insights: InsightCard[];
};

export type UploadConfig = {
  features: UploadFeature[];
};

export type RecordsData = {
  sections: ExampleResponseSection[];
  findings: ExampleFinding[];
};

export interface AlumnoInput {
  nombre: string;
  correo: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  tesis_id: string;
  tesis: {
    id: string;
    titulo: string | null;
    archivo_nombre: string;
    archivo_url: string;
    estado: string;
    created_at: string;
  };
  alumnos: {
    id: string;
    nombre: string;
    correo: string;
  }[];
}

export interface AnalysisSaveResponse {
  success: boolean;
  message: string;
  analisis: {
    id: string;
    tesis_id: string;
    resultado: string;
    created_at: string;
  };
}

export async function fetchHomeData(): Promise<HomeData> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Error al cargar datos de inicio");
  return res.json();
}

export async function fetchUploadConfig(): Promise<UploadConfig> {
  const res = await fetch(`${BASE_URL}/upload`);
  if (!res.ok) throw new Error("Error al cargar configuración de carga");
  return res.json();
}

export async function uploadThesisFile(
  file: File,
  alumnos: AlumnoInput[],
  titulo?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("alumnos", JSON.stringify(alumnos));
  if (titulo) formData.append("titulo", titulo);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al subir el archivo");
  }

  return res.json();
}

export async function analyzeThesisFile(
  file: File,
  tesisId?: string
): Promise<{ analysis: string; tesis_id?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  if (tesisId) formData.append("tesis_id", tesisId);

  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al analizar el archivo");
  }

  return res.json();
}

export async function saveAnalysis(
  tesisId: string,
  resultado: string
): Promise<AnalysisSaveResponse> {
  const res = await fetch(`${BASE_URL}/analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tesis_id: tesisId, resultado }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al guardar el análisis");
  }

  return res.json();
}

export async function fetchRecordsData(): Promise<RecordsData> {
  const res = await fetch(`${BASE_URL}/records`);
  if (!res.ok) throw new Error("Error al cargar registros");
  return res.json();
}
