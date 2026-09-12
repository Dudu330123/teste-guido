import { NextResponse } from "next/server";
import { z } from "zod";
import { guideImageRules, validateGuideImageDimensions, validateGuideImageFile } from "@/features/admin/guide-image-validation";
import { extensionForGuideImage, guideImageContextSchema } from "@/features/admin/shared-guide-image";
import { getSuperadminAccess } from "@/lib/auth/admin";
import { query, withTransaction } from "@/lib/db/client";
import { putObject, removeObject, signedObjectUrl } from "@/lib/storage";

const bucket = "guide-public";
const storedRowSchema = z.object({
  id: z.string().uuid(), step_id: z.string(), storage_key: z.string(), mime_type: z.enum(guideImageRules.acceptedTypes),
  byte_size: z.number().int().positive(), width: z.number().int().positive(), height: z.number().int().positive(), updated_at: z.union([z.string(), z.date()]),
});

function accessError() { return NextResponse.json({ error: { code: "service_unavailable", message: "O envio de prints ainda não está configurado." } }, { status: 503 }); }
function deleteAccessError() { return NextResponse.json({ error: { code: "forbidden", message: "Somente o superadministrador pode remover um print." } }, { status: 403 }); }
function hasTrustedOrigin(request: Request) { return request.headers.get("origin") === new URL(request.url).origin; }
function originError() { return NextResponse.json({ error: { code: "invalid_origin", message: "A solicitação não veio do Guido." } }, { status: 403 }); }
function parseContext(values: Record<string, unknown>) {
  return guideImageContextSchema.safeParse({ ...values, applicationSlug: values.applicationSlug || null, stepOrder: Number(values.stepOrder) });
}
function rowResponse(row: z.infer<typeof storedRowSchema>) {
  return { id: row.id, stepId: row.step_id, mimeType: row.mime_type, byteSize: row.byte_size, width: row.width, height: row.height, updatedAt: new Date(row.updated_at).toISOString(), previewUrl: signedObjectUrl(bucket, row.storage_key, 24 * 60 * 60) };
}

async function requireSuperadmin() {
  try {
    const access = await getSuperadminAccess();
    return Boolean(access);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  if (!(await requireSuperadmin())) return deleteAccessError();
  const search = new URL(request.url).searchParams;
  const context = z.object({ guideSlug: guideImageContextSchema.shape.guideSlug, applicationSlug: guideImageContextSchema.shape.applicationSlug, operatingSystem: guideImageContextSchema.shape.operatingSystem }).safeParse({ guideSlug: search.get("guideSlug"), applicationSlug: search.get("applicationSlug") || null, operatingSystem: search.get("operatingSystem") });
  if (!context.success) return NextResponse.json({ error: { code: "invalid_request", message: "Seleção de guia inválida." } }, { status: 400 });
  try {
    const result = await query<z.infer<typeof storedRowSchema>>(
      `select id, step_id, storage_key, mime_type, byte_size, width, height, updated_at
         from guide_public_images where guide_slug = $1 and operating_system = $2
         and application_slug is not distinct from $3 order by step_order asc`,
      [context.data.guideSlug, context.data.operatingSystem, context.data.applicationSlug],
    );
    return NextResponse.json({ data: result.rows.map(rowResponse) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return accessError();
  }
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return originError();
  if (!(await requireSuperadmin())) return deleteAccessError();
  try {
    const form = await request.formData();
    const file = form.get("file");
    const context = parseContext({ guideSlug: form.get("guideSlug"), applicationSlug: form.get("applicationSlug"), operatingSystem: form.get("operatingSystem"), stepId: form.get("stepId"), stepOrder: form.get("stepOrder") });
    const dimensions = { width: Number(form.get("width")), height: Number(form.get("height")) };
    if (!(file instanceof File) || !context.success || form.get("confirmedSafe") !== "true") return NextResponse.json({ error: { code: "invalid_request", message: "Revise o arquivo e confirme que ele não contém dados pessoais." } }, { status: 400 });
    const fileError = validateGuideImageFile(file) || validateGuideImageDimensions(dimensions);
    if (fileError) return NextResponse.json({ error: { code: "invalid_file", message: fileError } }, { status: 400 });
    const scope = context.data.applicationSlug ?? "sem-aplicativo";
    const storageKey = `public/${context.data.guideSlug}/${scope}/${context.data.operatingSystem}/${context.data.stepId}/${crypto.randomUUID()}.${extensionForGuideImage(file.type as "image/png" | "image/jpeg" | "image/webp")}`;
    await putObject(bucket, storageKey, new Uint8Array(await file.arrayBuffer()));
    const previous = await query<{ storage_key: string }>(
      `select storage_key from guide_public_images where guide_slug = $1 and operating_system = $2 and step_id = $3 and application_slug is not distinct from $4`,
      [context.data.guideSlug, context.data.operatingSystem, context.data.stepId, context.data.applicationSlug],
    );
    const row = await withTransaction(async (client) => {
      const existing = previous.rows[0];
      const saved = existing
        ? await client.query(`update guide_public_images set step_order=$1, storage_key=$2, original_filename=$3, mime_type=$4, byte_size=$5, width=$6, height=$7, updated_at=now() where guide_slug=$8 and operating_system=$9 and step_id=$10 and application_slug is not distinct from $11 returning id, step_id, storage_key, mime_type, byte_size, width, height, updated_at`, [context.data.stepOrder, storageKey, file.name.slice(0, 255), file.type, file.size, dimensions.width, dimensions.height, context.data.guideSlug, context.data.operatingSystem, context.data.stepId, context.data.applicationSlug])
        : await client.query(`insert into guide_public_images (guide_slug, application_slug, operating_system, step_id, step_order, storage_bucket, storage_key, original_filename, mime_type, byte_size, width, height) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id, step_id, storage_key, mime_type, byte_size, width, height, updated_at`, [context.data.guideSlug, context.data.applicationSlug, context.data.operatingSystem, context.data.stepId, context.data.stepOrder, bucket, storageKey, file.name.slice(0, 255), file.type, file.size, dimensions.width, dimensions.height]);
      return saved.rows[0];
    });
    if (previous.rows[0]?.storage_key && previous.rows[0].storage_key !== storageKey) await removeObject(bucket, previous.rows[0].storage_key);
    const parsed = storedRowSchema.safeParse(row);
    if (!parsed.success) { await removeObject(bucket, storageKey); return accessError(); }
    return NextResponse.json({ data: rowResponse(parsed.data) }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Guide image upload failed", error instanceof Error ? error.name : "unknown_error");
    return accessError();
  }
}

export async function DELETE(request: Request) {
  if (!hasTrustedOrigin(request)) return originError();
  if (!(await requireSuperadmin())) return deleteAccessError();
  const context = parseContext(await request.json().catch(() => ({})));
  if (!context.success) return NextResponse.json({ error: { code: "invalid_request", message: "Print inválido." } }, { status: 400 });
  try {
    const result = await query<{ storage_key: string }>(`delete from guide_public_images where guide_slug = $1 and operating_system = $2 and step_id = $3 and application_slug is not distinct from $4 returning storage_key`, [context.data.guideSlug, context.data.operatingSystem, context.data.stepId, context.data.applicationSlug]);
    if (result.rows[0]) await removeObject(bucket, result.rows[0].storage_key);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: { code: "delete_failed", message: "Não foi possível remover o print." } }, { status: 503 });
  }
}
