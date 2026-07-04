import { AwsClient } from "aws4fetch";
import { z } from "zod";

interface Env {
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
}

const requestSchema = z.object({
  filename: z.string().min(1).max(180),
  contentType: z.string().min(1).max(100),
  size: z.number().int().positive().max(100 * 1024 * 1024),
});

const allowedExtensions = new Set([
  "pdf",
  "dwg",
  "dxf",
  "zip",
  "jpg",
  "jpeg",
  "png",
]);

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = requestSchema.parse(await context.request.json());
    const extension = body.filename.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedExtensions.has(extension)) {
      return Response.json({ error: "Unsupported file type." }, { status: 400 });
    }

    const safeName = body.filename
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(-120);
    const objectKey = `inquiries/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
    const client = new AwsClient({
      accessKeyId: context.env.R2_ACCESS_KEY_ID,
      secretAccessKey: context.env.R2_SECRET_ACCESS_KEY,
      region: "auto",
      service: "s3",
    });
    const url = new URL(
      `https://${context.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${context.env.R2_BUCKET_NAME}/${objectKey}`,
    );
    url.searchParams.set("X-Amz-Expires", "900");
    const signed = await client.sign(
      new Request(url, {
        method: "PUT",
        headers: { "Content-Type": body.contentType },
      }),
      { aws: { signQuery: true } },
    );

    return Response.json({
      uploadUrl: signed.url,
      objectKey,
      expiresIn: 900,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Invalid upload request." }, { status: 400 });
  }
};
