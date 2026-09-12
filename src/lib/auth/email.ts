import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import nodemailer from "nodemailer";

interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export async function sendEmail(message: EmailMessage) {
  if (smtpConfigured()) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
    await transport.sendMail({
      from: process.env.EMAIL_FROM ?? "Guido <no-reply@localhost>",
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    return { delivery: "smtp" as const };
  }

  const directory = path.resolve(process.env.LOCAL_EMAIL_OUTBOX_DIR ?? ".local/email");
  await mkdir(directory, { recursive: true });
  const filename = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID()}.txt`;
  await writeFile(path.join(directory, filename), `To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n`, "utf8");
  return { delivery: "local-outbox" as const, path: path.join(directory, filename) };
}

export async function sendWelcomeEmail(input: { to: string; name: string; verificationUrl: string }) {
  return sendEmail({
    to: input.to,
    subject: "Bem-vindo ao Guido! Confirme sua conta",
    text: `Olá, ${input.name}!

Sua conta Guido foi criada com sucesso. Estamos felizes em ter você com a gente.

Para confirmar seu e-mail e começar a usar o Guido, acesse:
${input.verificationUrl}

O link expira em 24 horas.`,
  });
}
