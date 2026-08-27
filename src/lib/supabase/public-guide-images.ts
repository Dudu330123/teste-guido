import { z } from "zod";
import type { GuideStep, OperatingSystem } from "@/types/content";
import { getSupabaseServerClient } from "./server";

const publicImageRowsSchema = z.array(z.object({
  step_order: z.number().int().positive(),
  storage_bucket: z.literal("guide-public"),
  storage_key: z.string().min(1),
}));

/** Substitui somente a tela do passo correspondente; instruções não vêm do upload. */
export function applyPublicGuideImages(steps: GuideStep[], imageByStep: ReadonlyMap<number, string>) {
  return steps.map((step) => {
    const imagePath = imageByStep.get(step.order);
    return imagePath ? { ...step, imagePath } : step;
  });
}

/** Mantém a imagem específica e usa a imagem compartilhada somente nos passos ausentes. */
export function mergePublicGuideImages(
  specificImages: ReadonlyMap<number, string>,
  fallbackImages: ReadonlyMap<number, string>,
) {
  const merged = new Map(fallbackImages);
  specificImages.forEach((imagePath, stepOrder) => merged.set(stepOrder, imagePath));
  return merged;
}

export function shouldUseAndroidImageFallback(operatingSystem: OperatingSystem, applicationCategory?: string) {
  return operatingSystem === "ios"
    && (applicationCategory === "Serviços financeiros" || applicationCategory === "Serviços públicos");
}

async function loadPublicGuideImages(
  guideSlug: string,
  applicationSlug: string | null,
  operatingSystem: OperatingSystem,
) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return new Map<number, string>();
  let query = supabase
    .from("guide_public_images")
    .select("step_order, storage_bucket, storage_key")
    .eq("guide_slug", guideSlug)
    .eq("operating_system", operatingSystem);
  query = applicationSlug
    ? query.eq("application_slug", applicationSlug)
    : query.is("application_slug", null);
  const { data, error } = await query.order("step_order", { ascending: true });
  const parsed = publicImageRowsSchema.safeParse(data);
  if (error || !parsed.success) return new Map<number, string>();

  return new Map(parsed.data.map((row) => [
    row.step_order,
    supabase.storage.from(row.storage_bucket).getPublicUrl(row.storage_key).data.publicUrl,
  ]));
}

/** Lê as imagens que colaboradores, inclusive visitantes sem login, tornaram públicas. */
export async function getPublicGuideImages(
  guideSlug: string,
  applicationSlug: string | null,
  operatingSystem: OperatingSystem,
  applicationCategory?: string,
) {
  const specificImages = await loadPublicGuideImages(guideSlug, applicationSlug, operatingSystem);
  if (!shouldUseAndroidImageFallback(operatingSystem, applicationCategory)) return specificImages;
  const androidImages = await loadPublicGuideImages(guideSlug, applicationSlug, "android");
  return mergePublicGuideImages(specificImages, androidImages);
}
