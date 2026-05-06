import nodemailer from "nodemailer";

type SendAnalysisEmailInput = {
  toEmail: string;
  subject: string;
  html: string;
  pdfBuffer: Buffer;
  fileName: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST ?? "";
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER ?? "";
  const pass = process.env.SMTP_PASS ?? "";
  const from = process.env.SMTP_FROM ?? "";

  if (!host || !user || !pass || !from) {
    throw new Error("Falta configurar SMTP_HOST, SMTP_USER, SMTP_PASS o SMTP_FROM");
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    secure: port === 465,
  };
}

async function sendWithSmtp(input: SendAnalysisEmailInput) {
  const config = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  await transporter.sendMail({
    from: config.from,
    to: input.toEmail,
    subject: input.subject,
    html: input.html,
    attachments: [
      {
        filename: input.fileName,
        content: input.pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

export async function sendAnalysisEmail(input: SendAnalysisEmailInput) {
  await sendWithSmtp(input);
}
