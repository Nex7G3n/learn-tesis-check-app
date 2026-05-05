import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

/**
 * Arregla tablas mal formateadas generadas por Gemini.
 * Gemini a veces omite la línea separadora `|---|---|` en las tablas markdown.
 */
function fixGeminiMarkdown(raw: string): string {
  const lines = raw.split("\n");
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];

    result.push(line);

    // Detecta si esta línea es una fila de tabla (empieza y termina con |)
    const isTableRow = /^\s*\|.+\|\s*$/.test(line);
    const isSeparator = /^\s*\|[-\s|]+\|\s*$/.test(line);

    if (isTableRow && !isSeparator && nextLine) {
      const nextIsTableRow = /^\s*\|.+\|\s*$/.test(nextLine);
      const nextIsSeparator = /^\s*\|[-\s|]+\|\s*$/.test(nextLine);

      // Si la siguiente línea también es una fila de tabla PERO no es separador,
      // significa que falta la línea separadora. La insertamos.
      if (nextIsTableRow && !nextIsSeparator) {
        // Cuenta cuántas columnas tiene la tabla
        const colCount = line.split("|").length - 1;
        const separator = "|" + " --- |".repeat(colCount);
        result.push(separator);
      }
    }
  }

  return result.join("\n");
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const fixedContent = fixGeminiMarkdown(content);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{fixedContent}</ReactMarkdown>
    </div>
  );
}
