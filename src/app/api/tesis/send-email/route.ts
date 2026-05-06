import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/src/shared/services/auth.service";
import { sendAnalysisEmail } from "@/src/shared/services/email.service";

const MAX_PDF_BYTES = 8 * 1024 * 1024;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const toEmail = (body?.toEmail as string | undefined)?.trim() ?? "";
    const tesisTitle = (body?.tesisTitle as string | undefined)?.trim() ?? "Análisis de tesis";
    const fileName = (body?.fileName as string | undefined)?.trim() ?? "analisis-tesis.pdf";
    const pdfBase64 = (body?.pdfBase64 as string | undefined)?.trim() ?? "";
    const sentBy = user.email ?? "Usuario del sistema";

    if (!toEmail || !pdfBase64) {
      return NextResponse.json(
        { error: "Correo destino y PDF son obligatorios" },
        { status: 400 },
      );
    }

    if (!EMAIL_REGEX.test(toEmail)) {
      return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 });
    }

    const pdfBuffer = Buffer.from(pdfBase64, "base64");
    if (pdfBuffer.length === 0 || pdfBuffer.length > MAX_PDF_BYTES) {
      return NextResponse.json(
        { error: "PDF inválido o excede el tamaño máximo permitido (8MB)" },
        { status: 400 },
      );
    }

    const safeTitle = escapeHtml(tesisTitle);
    const safeTo = escapeHtml(toEmail);
    const safeSender = escapeHtml(sentBy);

    await sendAnalysisEmail({
      toEmail,
      subject: `Informe de revision de tesis: ${tesisTitle}`,
      html: `
        <div style="margin:0;padding:24px;background:#ecfdf3;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
          <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
            <div style="padding:22px 24px;background:linear-gradient(135deg,#22c55e,#166534);color:#ffffff;">
              <h1 style="margin:0;font-size:20px;line-height:1.3;">Informe de revision de tesis</h1>
              <p style="margin:8px 0 0;font-size:13px;opacity:.9;">Sistema Tesis IQ</p>
            </div>
            <div style="padding:22px 24px;">
              <p style="margin:0 0 14px;font-size:14px;">Hola,</p>
              <p style="margin:0 0 14px;font-size:14px;line-height:1.6;">
                Se adjunta el informe de revision en formato PDF para la tesis:
              </p>
              <div style="margin:0 0 16px;padding:12px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;">
                <p style="margin:0;font-size:14px;"><strong>Tesis:</strong> ${safeTitle}</p>
                <p style="margin:6px 0 0;font-size:13px;color:#14532d;"><strong>Destinatario:</strong> ${safeTo}</p>
                <p style="margin:6px 0 0;font-size:13px;color:#14532d;"><strong>Enviado por:</strong> ${safeSender}</p>
              </div>
              <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
                Si no esperabas este correo, puedes ignorarlo.
              </p>
            </div>
            <div style="padding:14px 24px;background:#f0fdf4;border-top:1px solid #bbf7d0;">
              <p style="margin:0;font-size:12px;color:#64748b;">
                Este mensaje fue generado automaticamente por Tesis IQ.
              </p>
            </div>
          </div>
        </div>
      `,
      pdfBuffer,
      fileName,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno";
    console.error("Error enviando análisis por correo");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
