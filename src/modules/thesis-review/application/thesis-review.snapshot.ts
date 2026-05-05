import type {
  ExampleFinding,
  ExampleResponseSection,
  InsightCard,
  ReviewStage,
  UploadFeature,
  ValueMetric,
} from "../domain/review-stage";

export const reviewStages: ReviewStage[] = [
  {
    id: "upload",
    title: "Carga segura",
    description:
      "Sube PDF, DOC o DOCX y detecta metadatos, numero de paginas y secciones clave.",
    emphasis: "Arquitectura lista para validar archivos y versionado.",
  },
  {
    id: "analysis",
    title: "Lectura del agente",
    description:
      "El sistema puede dividir capitulos, extraer citas y evaluar consistencia argumentativa.",
    emphasis: "Pensado para conectar pipelines de IA por pasos.",
  },
  {
    id: "response",
    title: "Respuesta accionable",
    description:
      "Devuelve observaciones priorizadas, resumen ejecutivo y sugerencias concretas.",
    emphasis: "Ideal para feedback claro entre alumno, asesor y revisor.",
  },
];

export const valueMetrics: ValueMetric[] = [
  {
    label: "Tiempo de revision",
    value: "< 5 min",
    helper: "Desde la carga hasta el primer informe automatico.",
  },
  {
    label: "Trazabilidad",
    value: "Capitulo a capitulo",
    helper: "Comentarios vinculados a secciones especificas de la tesis.",
  },
  {
    label: "Salida esperada",
    value: "Resumen + hallazgos",
    helper: "Base ideal para un tablero de resultados del agente.",
  },
];

export const insightCards: InsightCard[] = [
  {
    title: "Mapa del documento",
    description:
      "Visualiza capitulos, metodologia, referencias y anexos antes de procesar.",
  },
  {
    title: "Observaciones priorizadas",
    description:
      "Separa problemas criticos, mejoras sugeridas y fortalezas detectadas.",
  },
  {
    title: "Respuesta explicable",
    description:
      "Prepara el front para mostrar evidencia, citas y origen de cada recomendacion.",
  },
];

export const uploadFeatures: UploadFeature[] = [
  {
    title: "Valida formato y peso",
    description: "Prepara el front para aceptar PDF, DOC y DOCX con reglas claras.",
  },
  {
    title: "Extrae estructura base",
    description: "Detecta portada, indice, capitulos, referencias y anexos.",
  },
  {
    title: "Envia al flujo de n8n",
    description: "Deja lista la integracion futura con tu automatizacion.",
  },
];

export const exampleResponseSections: ExampleResponseSection[] = [
  {
    title: "Resumen ejecutivo",
    tone: "Claro",
    content:
      "La tesis presenta una base metodologica consistente, pero necesita reforzar la justificacion del problema y mejorar la coherencia entre objetivos y conclusiones.",
  },
  {
    title: "Sugerencia del agente",
    tone: "Accionable",
    content:
      "Conviene ampliar el marco teorico del capitulo 2 y revisar dos citas sin fuente visible antes de la entrega a revision final.",
  },
];

export const exampleFindings: ExampleFinding[] = [
  {
    title: "Objetivo especifico poco medible",
    severity: "Alta prioridad",
    detail:
      "El objetivo 3 describe una intencion valida, pero no define criterio de evaluacion ni variable observable.",
  },
  {
    title: "Dos referencias incompletas",
    severity: "Media prioridad",
    detail:
      "Se detectan entradas bibliograficas sin ano de publicacion y una sin editorial.",
  },
  {
    title: "Conclusiones bien alineadas",
    severity: "Fortaleza",
    detail:
      "La seccion final mantiene coherencia con los resultados y resume hallazgos de forma comprensible.",
  },
];
