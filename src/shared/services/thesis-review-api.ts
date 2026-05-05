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

export async function uploadThesisFile(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", file);

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

export async function fetchRecordsData(): Promise<RecordsData> {
  const res = await fetch(`${BASE_URL}/records`);
  if (!res.ok) throw new Error("Error al cargar registros");
  return res.json();
}

export async function analyzeThesisFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al analizar el archivo");
  }

  const data = await res.json();
  return data.analysis as string;
}
