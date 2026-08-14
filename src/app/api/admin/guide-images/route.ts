import { NextResponse } from "next/server";
import { z } from "zod";
import { guideImageRules, validateGuideImageDimensions, validateGuideImageFile } from "@/features/admin/guide-image-validation";
import { extensionForGuideImage, guideImageContextSchema } from "@/features/admin/shared-guide-image";
import { getAdminAccess } from "@/lib/supabase/admin";

const bucket = "guide-public";
const storedRowSchema = z.object({
  id: z.string().uuid(),
  step_id: z.string(),
  storage_key: z.string(),
  mime_type: z.enum(guideImageRules.acceptedTypes),
  byte_size: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  updated_at: z.string(),
});

function accessError() {
  return NextResponse.json(
    { error: { code: "forbidden", message: "Entre com a conta superadministradora autorizada." } },
    { status: 403 },
  );
}

function canPublish(role: string) {
  return role === "superadmin";
}

/** Bloqueia mutações originadas fora do próprio site, além da proteção dos cookies. */
function hasTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}

function originError() {
  return NextResponse.json(
    { error: { code: "invalid_origin", message: "A solicitação não veio do Guido." } },
    { status: 403 },
  );
}

function parseContext(values: Record<string, unknown>) {
  return guideImageContextSchema.safeParse({
    ...values,
    applicationSlug: values.applicationSlug || null,
    stepOrder: Number(values.stepOrder),
  });
}

async function rowResponse(
  supabase: NonNullable<Awaited<ReturnType<typeof getAdminAccess>>>["supabase"],
  row: z.infer<typeof storedRowSchema>,
) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(row.storage_key);
  return {
    id: row.id,
    stepId: row.step_id,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    width: row.width,
    height: row.height,
    updatedAt: row.updated_at,
    previewUrl: data.publicUrl,
  };
}

export async function GET(request: Request) {
  const admin = await getAdminAccess();
  if (!admin || !canPublish(admin.role)) return accessError();
  const search = new URL(request.url).searchParams;
  const context = z.object({
    guideSlug: guideImageContextSchema.shape.guideSlug,
    applicationSlug: guideImageContextSchema.shape.applicationSlug,
    operatingSystem: guideImageContextSchema.shape.operatingSystem,
  }).safeParse({
    guideSlug: search.get("guideSlug"),
    applicationSlug: search.get("applicationSlug") || null,
    operatingSystem: search.get("operatingSystem"),
  });
  if (!context.success) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Seleção de guia inválida." } }, { status: 400 });
  }

  let query = admin.supabase
    .from("guide_public_images")
    .select("id, step_id, storage_key, mime_type, byte_size, width, height, updated_at")
    .eq("guide_slug", context.data.guideSlug)
    .eq("operating_system", context.data.operatingSystem);
  query = context.data.applicationSlug
    ? query.eq("application_slug", context.data.applicationSlug)
    : query.is("application_slug", null);
  const { data, error } = await query.order("step_order", { ascending: true });
  const parsed = storedRowSchema.array().safeParse(data);
  if (error || !parsed.success) {
    return NextResponse.json({ error: { code: "service_unavailable", message: "Não foi possível carregar os prints." } }, { status: 503 });
  }
  const drafts = (await Promise.all(parsed.data.map((row) => rowResponse(admin.supabase, row))))
    .filter((draft) => draft !== null);
  return NextResponse.json({ data: drafts }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return originError();
  const admin = await getAdminAccess();
  if (!admin || !canPublish(admin.role)) return accessError();
  const form = await request.formData();
  const file = form.get("file");
  const context = parseContext({
    guideSlug: form.get("guideSlug"),
    applicationSlug: form.get("applicationSlug"),
    operatingSystem: form.get("operatingSystem"),
    stepId: form.get("stepId"),
    stepOrder: form.get("stepOrder"),
  });
  const dimensions = {
    width: Number(form.get("width")),
    height: Number(form.get("height")),
  };
  if (!(file instanceof File) || !context.success || form.get("confirmedSafe") !== "true") {
    return NextResponse.json({ error: { code: "invalid_request", message: "Revise o arquivo e confirme que ele não contém dados pessoais." } }, { status: 400 });
  }
  const fileError = validateGuideImageFile(file) || validateGuideImageDimensions(dimensions);
  if (fileError) {
    return NextResponse.json({ error: { code: "invalid_file", message: fileError } }, { status: 400 });
  }

  const scope = context.data.applicationSlug ?? "sem-aplicativo";
  const storageKey = `${admin.user.id}/${context.data.guideSlug}/${scope}/${context.data.operatingSystem}/${context.data.stepId}/${crypto.randomUUID()}.${extensionForGuideImage(file.type as "image/png" | "image/jpeg" | "image/webp")}`;
  const { error: uploadError } = await admin.supabase.storage.from(bucket).upload(storageKey, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    return NextResponse.json({ error: { code: "upload_failed", message: "Não foi possível enviar o print." } }, { status: 503 });
  }

  let previousQuery = admin.supabase
    .from("guide_public_images")
    .select("storage_key")
    .eq("guide_slug", context.data.guideSlug)
    .eq("operating_system", context.data.operatingSystem)
    .eq("step_id", context.data.stepId);
  previousQuery = context.data.applicationSlug
    ? previousQuery.eq("application_slug", context.data.applicationSlug)
    : previousQuery.is("application_slug", null);
  const { data: previous } = await previousQuery.maybeSingle();

  const { data, error } = await admin.supabase.from("guide_public_images").upsert({
    guide_slug: context.data.guideSlug,
    application_slug: context.data.applicationSlug,
    operating_system: context.data.operatingSystem,
    step_id: context.data.stepId,
    step_order: context.data.stepOrder,
    storage_bucket: bucket,
    storage_key: storageKey,
    original_filename: file.name.slice(0, 255),
    mime_type: file.type,
    byte_size: file.size,
    width: dimensions.width,
    height: dimensions.height,
    created_by: admin.user.id,
    updated_by: admin.user.id,
  }, { onConflict: "guide_slug,application_scope,operating_system,step_id" })
    .select("id, step_id, storage_key, mime_type, byte_size, width, height, updated_at")
    .single();
  const parsed = storedRowSchema.safeParse(data);
  if (error || !parsed.success) {
    await admin.supabase.storage.from(bucket).remove([storageKey]);
    return NextResponse.json({ error: { code: "save_failed", message: "O arquivo não pôde ser associado ao passo." } }, { status: 503 });
  }
  if (previous?.storage_key && previous.storage_key !== storageKey) {
    await admin.supabase.storage.from(bucket).remove([previous.storage_key]);
  }
  const response = await rowResponse(admin.supabase, parsed.data);
  if (!response) {
    return NextResponse.json({ error: { code: "preview_failed", message: "O print foi salvo, mas a prévia não pôde ser criada." } }, { status: 503 });
  }
  return NextResponse.json({ data: response }, { status: 201, headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
  if (!hasTrustedOrigin(request)) return originError();
  const admin = await getAdminAccess();
  if (!admin || !canPublish(admin.role)) return accessError();
  const input = await request.json().catch(() => null);
  const context = parseContext(input ?? {});
  if (!context.success) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Print inválido." } }, { status: 400 });
  }
  let query = admin.supabase
    .from("guide_public_images")
    .delete()
    .eq("guide_slug", context.data.guideSlug)
    .eq("operating_system", context.data.operatingSystem)
    .eq("step_id", context.data.stepId);
  query = context.data.applicationSlug
    ? query.eq("application_slug", context.data.applicationSlug)
    : query.is("application_slug", null);
  const { data, error } = await query.select("storage_key").maybeSingle();
  if (error) {
    return NextResponse.json({ error: { code: "delete_failed", message: "Não foi possível remover o print." } }, { status: 503 });
  }
  if (data?.storage_key) await admin.supabase.storage.from(bucket).remove([data.storage_key]);
  return new NextResponse(null, { status: 204 });
}
