import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

/**
 * Detecta y arregla tablas mal formateadas en markdown.
 * Gemini genera tablas sin la línea separadora o todo en una línea.
 */
function fixGeminiTables(text: string): string {
  // Normalizar saltos de línea
  let result = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Estrategia: encontrar bloques que parecen tablas y reconstruirlos
  // Un bloque de tabla es un grupo de líneas que empiezan con |
  const lines = result.split("\n");
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detectar si esta línea empieza una tabla
    if (/^\s*\|/.test(line) && /\|\s*$/.test(line)) {
      // Recolectar todas las líneas consecutivas que parecen tabla
      const tableLines: string[] = [];
      let j = i;
      while (j < lines.length && /^\s*\|/.test(lines[j]) && /\|\s*$/.test(lines[j])) {
        tableLines.push(lines[j].trim());
        j++;
      }

      // Reconstruir la tabla
      const fixedTable = rebuildTable(tableLines);
      output.push(...fixedTable);
      i = j;
    } else {
      output.push(line);
      i++;
    }
  }

  return output.join("\n");
}

function rebuildTable(lines: string[]): string[] {
  // Primero, juntar todo en una sola cadena (por si las filas están fragmentadas)
  const raw = lines.join(" ");

  // Separar en filas individuales usando el patrón: | ... | | ... |
  // donde || indica el final de una fila y el inicio de otra
  // PERO cuidado: || puede ser una celda vacía

  // En su lugar, contemos cuántas columnas tiene la primera fila
  const firstRowCols = countColumns(lines[0]);
  if (firstRowCols < 2) return lines;

  // Juntar todo y separar en bloques de N columnas
  const allCells: string[] = [];
  for (const line of lines) {
    const cells = line.split("|").map((c) => c.trim());
    // Filtrar elementos vacíos al inicio y final (por los | del borde)
    const trimmed = cells.filter((_, idx) => {
      if (idx === 0) return cells[idx].length > 0;
      if (idx === cells.length - 1) return cells[idx].length > 0;
      return true;
    });
    allCells.push(...trimmed);
  }

  // Reconstruir filas de N columnas cada una
  const newRows: string[] = [];
  const expectedCols = firstRowCols;

  for (let i = 0; i < allCells.length; i += expectedCols) {
    const rowCells = allCells.slice(i, i + expectedCols);
    if (rowCells.length === expectedCols && rowCells.some((c) => c.length > 0)) {
      newRows.push("| " + rowCells.join(" | ") + " |");
    }
  }

  // Si no hay separador después del encabezado, insertarlo
  if (newRows.length > 0 && !isSeparatorRow(newRows[1] || "")) {
    const separator = "|" + " --- |".repeat(expectedCols);
    newRows.splice(1, 0, separator);
  }

  return newRows;
}

function countColumns(row: string): number {
  // Contar columnas basándose en el número de |
  const parts = row.split("|");
  // Filtrar elementos vacíos al inicio y final
  const cells = parts.filter((c, idx) => {
    if (idx === 0 && c.trim() === "") return false;
    if (idx === parts.length - 1 && c.trim() === "") return false;
    return true;
  });
  return cells.length;
}

function isSeparatorRow(row: string): boolean {
  return /^\s*\|\s*[-\s:]+\s*(?:\|\s*[-\s:]+\s*)*\|\s*$/.test(row);
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const fixedContent = fixGeminiTables(content);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{fixedContent}</ReactMarkdown>
    </div>
  );
}
