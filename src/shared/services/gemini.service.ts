import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.GEMINI_API_KEY ?? "";
const MODEL_NAME = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const genAI = new GoogleGenerativeAI(API_KEY);

const DOCS_DIR = path.join(process.cwd(), "src", "shared", "infrastructure", "ai", "docs");

async function extractTextFromDocxBuffer(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function getPromptText(): Promise<string> {
  const promptPath = path.join(DOCS_DIR, "PROMPT.docx");
  if (!fs.existsSync(promptPath)) {
    throw new Error(
      'No se encontró PROMPT.docx. Colócalo en src/shared/infrastructure/ai/docs/'
    );
  }
  return extractTextFromDocx(promptPath);
}

async function getSchemaText(): Promise<string> {
  const schemaPath = path.join(DOCS_DIR, "EsquemaPT.docx");
  if (!fs.existsSync(schemaPath)) {
    throw new Error(
      'No se encontró EsquemaPT.docx. Colócalo en src/shared/infrastructure/ai/docs/'
    );
  }
  return extractTextFromDocx(schemaPath);
}

function isPdf(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".pdf");
}

function isDocx(fileName: string): boolean {
  return (
    fileName.toLowerCase().endsWith(".docx") ||
    fileName.toLowerCase().endsWith(".doc")
  );
}

export async function analyzeThesisWithGemini(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno");
  }

  const [promptTemplate, schemaText] = await Promise.all([
    getPromptText(),
    getSchemaText(),
  ]);

  let thesisContent: string;
  let useInlineData = false;
  let inlineData:
    | { mimeType: string; data: string }
    | undefined = undefined;

  if (isPdf(fileName)) {
    // PDF: Gemini soporta inline data con application/pdf
    useInlineData = true;
    inlineData = {
      mimeType: "application/pdf",
      data: fileBuffer.toString("base64"),
    };
    thesisContent = "[PDF adjunto]";
  } else if (isDocx(fileName)) {
    // DOCX/DOC: Gemini NO soporta inline data para Word
    // Extraemos el texto y lo incluimos como texto plano en el prompt
    thesisContent = await extractTextFromDocxBuffer(fileBuffer);
  } else {
    throw new Error(
      "Formato no soportado. Use PDF, DOC o DOCX."
    );
  }

  const fullPrompt = `${promptTemplate}

---

ESTRUCTURA Y NORMAS A VERIFICAR:
${schemaText}

---

PROYECTO DE TESIS A REVISAR:
${thesisContent}

---

INSTRUCCIONES DE FORMATO DE SALIDA (MUY IMPORTANTE):
- Genera TODO el informe en formato Markdown válido.
- Para las tablas, DEBES incluir la línea separadora entre el encabezado y las filas. Ejemplo:
  | Columna 1 | Columna 2 | Columna 3 |
  | --- | --- | --- |
  | Dato 1 | Dato 2 | Dato 3 |
- Usa **negrita** para resaltar hallazgos importantes, puntuaciones y títulos de secciones.
- Usa ### para los títulos principales del informe y #### para subtítulos.
- Usa listas con guiones (-) para enumerar hallazgos o errores.
- Usa bloques de texto con > para citas o resúmenes destacados.
- NO uses HTML dentro del markdown.

Por favor, revisa el proyecto de tesis adjunto de acuerdo a las indicaciones y el esquema proporcionados. Genera un informe detallado y bien formateado.`;

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const contentParts: (string | { inlineData: { mimeType: string; data: string } })[] = [
    fullPrompt,
  ];

  if (useInlineData && inlineData) {
    contentParts.push({ inlineData });
  }

  try {
    const result = await model.generateContent(contentParts);
    return result.response.text();
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "";

    if (errMsg.includes("404") && MODEL_NAME !== "gemini-2.5-flash") {
      console.warn(`Modelo ${MODEL_NAME} no disponible, intentando con gemini-2.5-flash...`);
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const fallbackResult = await fallbackModel.generateContent(contentParts);
      return fallbackResult.response.text();
    }

    throw error;
  }
}
