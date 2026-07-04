import { z } from "zod";
import { requireUser, unauthorized, type AuthEnv } from "../../../_auth";

interface Env extends AuthEnv {
  DB: D1Database;
}

const addressSchema = z.object({
  label: z.string().min(1).max(40),
  recipientName: z.string().min(2).max(120),
  line1: z.string().min(3).max(180),
  line2: z.string().max(180).optional().default(""),
  city: z.string().min(2).max(100),
  region: z.string().max(100).optional().default(""),
  postalCode: z.string().min(2).max(30),
  countryCode: z.string().length(2).transform((value) => value.toUpperCase()),
  phone: z.string().max(60).optional().default(""),
});

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = await requireUser(context.request, context.env);
  if (!user) return unauthorized();
  const result = await context.env.DB.prepare(
    `SELECT id, label, recipient_name, line1, line2, city, region,
            postal_code, country_code, phone
     FROM store_addresses WHERE user_id = ? ORDER BY created_at DESC`,
  )
    .bind(user.id)
    .all();
  return Response.json({ addresses: result.results });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = await requireUser(context.request, context.env);
  if (!user) return unauthorized();
  try {
    const address = addressSchema.parse(await context.request.json());
    const id = crypto.randomUUID();
    await context.env.DB.prepare(
      `INSERT INTO store_addresses (
        id, user_id, created_at, label, recipient_name, line1, line2,
        city, region, postal_code, country_code, phone
      ) VALUES (?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        user.id,
        address.label,
        address.recipientName,
        address.line1,
        address.line2,
        address.city,
        address.region,
        address.postalCode,
        address.countryCode,
        address.phone,
      )
      .run();
    return Response.json({ id }, { status: 201 });
  } catch {
    return Response.json({ error: "Invalid address." }, { status: 400 });
  }
};
