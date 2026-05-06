import { marked, type Token, type Tokens } from "marked";

import { fixGeminiTables } from "@/src/components/markdown-renderer";

marked.setOptions({ gfm: true, breaks: true });

type JsPdfInstance = import("jspdf").jsPDF;
type AutoTable = typeof import("jspdf-autotable").default;
const MAX_TABLE_CELLS = 1200;
const MAX_CELL_TEXT = 1200;

function normalizeInlineMarkdown(input: string): string {
  return (input ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function markdownToPlainText(markdown: string): string {
  const html = marked.parse(markdown) as string;
  const container = document.createElement("div");
  container.innerHTML = html;
  const text = container.innerText || container.textContent || "";
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function addPageIfNeeded(pdf: JsPdfInstance, y: number, neededHeight: number, margin: number): number {
  const pageHeight = pdf.internal.pageSize.getHeight();
  if (y + neededHeight > pageHeight - margin) {
    pdf.addPage();
    return margin;
  }
  return y;
}

function writeWrappedText(
  pdf: JsPdfInstance,
  text: string,
  y: number,
  options: { margin: number; maxWidth: number; lineHeight: number; fontSize: number; style?: "normal" | "bold" },
): number {
  if (!text.trim()) return y;

  pdf.setFont("helvetica", options.style ?? "normal");
  pdf.setFontSize(options.fontSize);
  const lines = pdf.splitTextToSize(text, options.maxWidth) as string[];
  for (const line of lines) {
    y = addPageIfNeeded(pdf, y, options.lineHeight, options.margin);
    pdf.text(line, options.margin, y);
    y += options.lineHeight;
  }
  return y;
}

function renderList(pdf: JsPdfInstance, list: Tokens.List, y: number, margin: number, maxWidth: number): number {
  for (const item of list.items) {
    const bullet = list.ordered ? `${item.task ? "[ ] " : ""}${item.raw.startsWith("1.") ? "" : ""}` : "• ";
    const text = normalizeInlineMarkdown(`${bullet}${item.text}`);
    y = writeWrappedText(pdf, text, y, {
      margin: margin + 2,
      maxWidth: maxWidth - 2,
      lineHeight: 5.5,
      fontSize: 10.5,
    });
    y += 1;
  }
  return y + 1;
}

function renderTable(
  pdf: JsPdfInstance,
  autoTable: AutoTable,
  token: Tokens.Table,
  y: number,
  margin: number,
): number {
  const headRow = token.header.map((cell) =>
    normalizeInlineMarkdown((cell.text ?? "").slice(0, MAX_CELL_TEXT)),
  );
  const bodyRows = token.rows.map((row) =>
    row.map((cell) => normalizeInlineMarkdown((cell.text ?? "").slice(0, MAX_CELL_TEXT))),
  );
  const colCount = Math.max(headRow.length, 1);
  const totalCells = (bodyRows.length + 1) * colCount;

  if (totalCells > MAX_TABLE_CELLS) {
    const warning = `Tabla extensa (${bodyRows.length} filas x ${colCount} columnas). Se resume para evitar bloqueo del exportador.`;
    y = writeWrappedText(pdf, warning, y, {
      margin,
      maxWidth: pdf.internal.pageSize.getWidth() - margin * 2,
      lineHeight: 5.5,
      fontSize: 10,
      style: "bold",
    });

    const previewRows = bodyRows.slice(0, 40);
    autoTable(pdf, {
      startY: y + 1,
      margin: { left: margin, right: margin },
      head: [headRow],
      body: previewRows,
      theme: "grid",
      tableWidth: "auto",
      showHead: "everyPage",
      rowPageBreak: "auto",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 2.2,
        overflow: "linebreak",
        valign: "top",
        minCellHeight: 5.6,
      },
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: [17, 24, 39],
        fontStyle: "bold",
        cellPadding: { top: 2.2, right: 2.2, bottom: 2.2, left: 2.2 },
        valign: "middle",
      },
      didParseCell: (data) => {
        if (typeof data.cell.raw === "string") {
          data.cell.text = [normalizeInlineMarkdown(data.cell.raw)];
        } else if (Array.isArray(data.cell.text)) {
          data.cell.text = data.cell.text.map((part) => normalizeInlineMarkdown(String(part)));
        }
      },
    });
    const previewState = (pdf as JsPdfInstance & { lastAutoTable?: { finalY: number } }).lastAutoTable;
    return (previewState?.finalY ?? y) + 6;
  }

  autoTable(pdf, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [headRow],
    body: bodyRows,
    theme: "grid",
    tableWidth: "auto",
    showHead: "everyPage",
    rowPageBreak: "auto",
    styles: {
      font: "helvetica",
      fontSize: 9.2,
      cellPadding: 2.4,
      overflow: "linebreak",
      valign: "top",
      minCellHeight: 5.6,
      lineColor: [203, 213, 225],
      lineWidth: 0.1,
      textColor: [17, 24, 39],
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: "bold",
      cellPadding: { top: 2.4, right: 2.4, bottom: 2.4, left: 2.4 },
      valign: "middle",
    },
    bodyStyles: {
      textColor: [17, 24, 39],
    },
    didParseCell: (data) => {
      if (typeof data.cell.raw === "string") {
        data.cell.text = [normalizeInlineMarkdown(data.cell.raw)];
      } else if (Array.isArray(data.cell.text)) {
        data.cell.text = data.cell.text.map((part) => normalizeInlineMarkdown(String(part)));
      }
    },
  });

  const tableState = (pdf as JsPdfInstance & { lastAutoTable?: { finalY: number } }).lastAutoTable;
  return (tableState?.finalY ?? y) + 4;
}

function renderTokens(
  pdf: JsPdfInstance,
  autoTable: AutoTable,
  tokens: Token[],
  y: number,
  margin: number,
  maxWidth: number,
): number {
  for (const token of tokens) {
    if (token.type === "heading") {
      const t = token as Tokens.Heading;
      const size = t.depth === 1 ? 18 : t.depth === 2 ? 15 : 13;
      y += 2;
      y = writeWrappedText(pdf, normalizeInlineMarkdown(t.text), y, {
        margin,
        maxWidth,
        lineHeight: size === 18 ? 8 : size === 15 ? 7 : 6,
        fontSize: size,
        style: "bold",
      });
      y += 2;
    } else if (token.type === "paragraph" || token.type === "text") {
      const t = token as Tokens.Paragraph | Tokens.Text;
      y = writeWrappedText(pdf, normalizeInlineMarkdown(t.text), y, {
        margin,
        maxWidth,
        lineHeight: 5.5,
        fontSize: 11,
      });
      y += 2;
    } else if (token.type === "blockquote") {
      const t = token as Tokens.Blockquote;
      y += 1;
      y = renderTokens(pdf, autoTable, t.tokens, y, margin + 4, maxWidth - 4);
      y += 1;
    } else if (token.type === "list") {
      y = renderList(pdf, token as Tokens.List, y, margin, maxWidth);
    } else if (token.type === "code") {
      const t = token as Tokens.Code;
      const codeText = normalizeInlineMarkdown(t.text || "");
      y += 1;
      y = writeWrappedText(pdf, codeText, y, {
        margin: margin + 2,
        maxWidth: maxWidth - 4,
        lineHeight: 5,
        fontSize: 9.5,
      });
      y += 2;
    } else if (token.type === "table") {
      y += 2;
      y = renderTable(pdf, autoTable, token as Tokens.Table, y, margin);
    } else if (token.type === "hr") {
      y = addPageIfNeeded(pdf, y, 3, margin);
      const pageWidth = pdf.internal.pageSize.getWidth();
      pdf.setDrawColor(209, 213, 219);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 4;
    } else if ("tokens" in token && Array.isArray((token as Tokens.Generic).tokens)) {
      y = renderTokens(pdf, autoTable, (token as Tokens.Generic).tokens ?? [], y, margin, maxWidth);
    }
  }

  return y;
}

async function exportStyledMarkdownWithCover(markdown: string, filename: string): Promise<boolean> {
  const pdf = await createStyledPdf(markdown, filename);
  if (!pdf) {
    return false;
  }

  try {
    pdf.save(filename);
    return true;
  } catch {
    return false;
  }
}

async function createStyledPdf(markdown: string, filename: string): Promise<JsPdfInstance | null> {
  const normalized = fixGeminiTables(markdown);
  const tokens = marked.lexer(normalized);

  try {
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const margin = 12;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;
    const baseTitle = filename.replace(/\.pdf$/i, "").replace(/-analisis$/i, "");
    const now = new Date().toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text("Analisis de Tesis", pageWidth / 2, 72, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(13);
    pdf.text(baseTitle || "Documento", pageWidth / 2, 86, { align: "center" });
    pdf.setFontSize(10);
    pdf.text(`Generado: ${now}`, pageWidth / 2, 94, { align: "center" });

    pdf.addPage();
    let y = margin;
    y = renderTokens(pdf, autoTable, tokens, y, margin, maxWidth);
    if (y < margin + 10) {
      pdf.text("(Sin contenido de analisis)", margin, y + 5);
    }

    return pdf;
  } catch (error) {
    console.error("Fallo exportando analisis con formato:", error);
    return null;
  }
}

async function buildStyledPdfArrayBuffer(markdown: string, filename: string): Promise<ArrayBuffer | null> {
  const pdf = await createStyledPdf(markdown, filename);
  if (!pdf) return null;

  return pdf.output("arraybuffer");
}

/** Nombre de archivo seguro para Windows/macOS/Linux. */
export function pdfFilenameFromBasename(fileLabel: string | undefined): string {
  const raw = (fileLabel ?? "analisis-ia").replace(/\.(pdf|docx?)$/i, "");
  const safe = raw.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim() || "analisis-ia";
  return `${safe}-analisis.pdf`;
}

/**
 * Genera un PDF con todo el contenido del markdown (incluye texto fuera del viewport del scroll).
 */
export async function exportMarkdownToPdf(
  markdown: string,
  filename: string,
): Promise<void> {
  const outName = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  await new Promise<void>((resolve) => setTimeout(resolve, 0));

  const renderedExported = await exportStyledMarkdownWithCover(markdown, outName);
  if (renderedExported) return;

  const normalized = fixGeminiTables(markdown);
  const plainText = markdownToPlainText(normalized);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const lineHeight = 6;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const lines = pdf.splitTextToSize(plainText || "(Sin contenido de análisis)", maxWidth) as string[];

  for (const line of lines) {
    if (y > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(line, margin, y);
    y += lineHeight;
  }

  pdf.save(outName);
}

export async function exportMarkdownToPdfArrayBuffer(
  markdown: string,
  filename: string,
): Promise<ArrayBuffer> {
  const outName = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  await new Promise<void>((resolve) => setTimeout(resolve, 0));

  const styledPdf = await buildStyledPdfArrayBuffer(markdown, outName);
  if (styledPdf) return styledPdf;

  const normalized = fixGeminiTables(markdown);
  const plainText = markdownToPlainText(normalized);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const lineHeight = 6;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const lines = pdf.splitTextToSize(plainText || "(Sin contenido de análisis)", maxWidth) as string[];

  for (const line of lines) {
    if (y > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(line, margin, y);
    y += lineHeight;
  }

  return pdf.output("arraybuffer");
}
