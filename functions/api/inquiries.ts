import { AwsClient } from "aws4fetch";
import { z } from "zod";
import { requireUser, type AuthEnv } from "../_auth";

interface Env extends AuthEnv {
  DB: D1Database;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  INQUIRY_TO_EMAIL?: string;
  INQUIRY_FROM_EMAIL?: string;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
}

const attachmentSchema = z.object({
  objectKey: z.string().startsWith("inquiries/"),
  filename: z.string().min(1).max(180),
  size: z.number().int().positive().max(100 * 1024 * 1024),
});

const inquirySchema = z.object({
  locale: z.enum(["en", "ar", "zh", "de", "fr"]),
  name: z.string().min(2).max(100),
  company: z.string().min(2).max(160),
  email: z.string().email().max(200),
  whatsapp: z.string().max(80).optional().nullable(),
  country: z.string().min(2).max(100),
  projectType: z.enum(["residential", "hospitality", "commercial"]),
  location: z.string().max(160).optional().nullable(),
  scope: z.string().max(300).optional().nullable(),
  quantity: z.string().max(160).optional().nullable(),
  budget: z.string().max(80).optional().nullable(),
  delivery: z.string().max(30).optional().nullable(),
  message: z.string().max(5000).optional().nullable(),
  consent: z.literal(true),
  turnstileToken: z.string().optional().nullable(),
  attachments: z.array(attachmentSchema).max(5),
});

const receivedNotes = {
  en: "Project information and drawings received.",
  zh: "资料已收到。",
  ar: "تم استلام معلومات المشروع والرسومات.",
  de: "Projektinformationen und Zeichnungen wurden empfangen.",
  fr: "Les informations et plans du projet ont été reçus.",
} as const;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function verifyTurnstile(
  secret: string | undefined,
  token: string | null | undefined,
  ip: string | null,
) {
  if (!secret) return true;
  if (!token) return false;
  const data = new FormData();
  data.set("secret", secret);
  data.set("response", token);
  if (ip) data.set("remoteip", ip);
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: data },
  );
  const result = (await response.json()) as { success: boolean };
  return result.success;
}

async function attachmentLinks(env: Env, attachments: z.infer<typeof attachmentSchema>[]) {
  const client = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    region: "auto",
    service: "s3",
  });

  return Promise.all(
    attachments.map(async (attachment) => {
      const url = new URL(
        `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${attachment.objectKey}`,
      );
      url.searchParams.set("X-Amz-Expires", "604800");
      const signed = await client.sign(new Request(url), {
        aws: { signQuery: true },
      });
      return { ...attachment, url: signed.url };
    }),
  );
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const inquiry = inquirySchema.parse(await context.request.json());
    const isHuman = await verifyTurnstile(
      context.env.TURNSTILE_SECRET_KEY,
      inquiry.turnstileToken,
      context.request.headers.get("CF-Connecting-IP"),
    );
    if (!isHuman) {
      return Response.json({ error: "Verification failed." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const user = await requireUser(context.request, context.env);
    const projectCode = `MLWK-${new Date().getUTCFullYear()}-${id
      .replaceAll("-", "")
      .slice(0, 8)
      .toUpperCase()}`;
    await context.env.DB.batch([
      context.env.DB.prepare(
        `INSERT INTO inquiries (
          id, project_code, created_at, updated_at, user_id, status, locale,
          name, company, email, whatsapp, country, project_type,
          project_location, scope, quantity, budget, delivery, message,
          attachments_json
        ) VALUES (
          ?, ?, datetime('now'), datetime('now'), ?, 'submitted', ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )`,
      ).bind(
        id,
        projectCode,
        user?.id ?? "",
        inquiry.locale,
        inquiry.name,
        inquiry.company,
        inquiry.email,
        inquiry.whatsapp ?? "",
        inquiry.country,
        inquiry.projectType,
        inquiry.location ?? "",
        inquiry.scope ?? "",
        inquiry.quantity ?? "",
        inquiry.budget ?? "",
        inquiry.delivery ?? "",
        inquiry.message ?? "",
        JSON.stringify(inquiry.attachments),
      ),
      context.env.DB.prepare(
        `INSERT INTO project_updates (
          id, inquiry_id, created_at, status, customer_note, expected_date,
          created_by
        ) VALUES (?, ?, datetime('now'), 'submitted', ?, '', 'system')`,
      ).bind(crypto.randomUUID(), id, receivedNotes[inquiry.locale]),
    ]);

    if (
      context.env.RESEND_API_KEY &&
      context.env.INQUIRY_TO_EMAIL &&
      context.env.INQUIRY_FROM_EMAIL
    ) {
      const files = await attachmentLinks(context.env, inquiry.attachments);
      const fileHtml = files.length
        ? `<ul>${files
            .map(
              (file) =>
                `<li><a href="${escapeHtml(file.url)}">${escapeHtml(file.filename)}</a> (${(file.size / 1024 / 1024).toFixed(1)} MB)</li>`,
            )
            .join("")}</ul>`
        : "<p>No files attached.</p>";
      const html = `
        <h1>New MLWK project enquiry</h1>
        <p><strong>ID:</strong> ${escapeHtml(id)}</p>
        <p><strong>Project:</strong> ${escapeHtml(projectCode)}</p>
        <p><strong>Name:</strong> ${escapeHtml(inquiry.name)}</p>
        <p><strong>Company:</strong> ${escapeHtml(inquiry.company)}</p>
        <p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(inquiry.whatsapp)}</p>
        <p><strong>Country:</strong> ${escapeHtml(inquiry.country)}</p>
        <p><strong>Project:</strong> ${escapeHtml(inquiry.projectType)} · ${escapeHtml(inquiry.location)}</p>
        <p><strong>Scope:</strong> ${escapeHtml(inquiry.scope)}</p>
        <p><strong>Quantity:</strong> ${escapeHtml(inquiry.quantity)}</p>
        <p><strong>Budget:</strong> ${escapeHtml(inquiry.budget)}</p>
        <p><strong>Target delivery:</strong> ${escapeHtml(inquiry.delivery)}</p>
        <p><strong>Notes:</strong><br>${escapeHtml(inquiry.message).replaceAll("\n", "<br>")}</p>
        <h2>Files</h2>${fileHtml}
      `;
      const mail = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: context.env.INQUIRY_FROM_EMAIL,
          to: [context.env.INQUIRY_TO_EMAIL],
          reply_to: inquiry.email,
          subject: `[MLWK] ${inquiry.projectType} enquiry from ${inquiry.company}`,
          html,
        }),
      });
      if (!mail.ok) console.error("Resend notification failed", await mail.text());
    }

    return Response.json({ id, projectCode, received: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Invalid enquiry." }, { status: 400 });
  }
};
