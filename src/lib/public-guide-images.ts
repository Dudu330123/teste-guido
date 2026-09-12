import { z } from "zod";
import type { GuideStep, OperatingSystem } from "@/types/content";
import { query } from "@/lib/db/client";
import { signedObjectUrl } from "@/lib/storage";

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

export function shouldUseAndroidImageFallback(operatingSystem: OperatingSystem) {
  // A coleção histórica possui vários guias apenas em Android. Enquanto uma
  // captura própria do iPhone não existir, ela é usada como referência visual.
  return operatingSystem === "ios";
}

/**
 * Preserva os uploads antigos, gravados sem application_slug, e permite que
 * uma imagem específica do aplicativo substitua a compartilhada por passo.
 */
export function publicGuideImageScopes(applicationSlug: string | null) {
  return applicationSlug ? [null, applicationSlug] as const : [null] as const;
}

async function loadPublicGuideImages(
  guideSlug: string,
  applicationSlug: string | null,
  operatingSystem: OperatingSystem,
) {
  try {
    const result = await query("select step_order, storage_bucket, storage_key from guide_public_images where guide_slug = $1 and operating_system = $2 and application_slug is not distinct from $3 order by step_order", [guideSlug, operatingSystem, applicationSlug]);
    const parsed = publicImageRowsSchema.safeParse(result.rows);
    if (!parsed.success) return new Map<number, string>();

    return new Map(parsed.data.map((row) => [row.step_order, signedObjectUrl(row.storage_bucket, row.storage_key, 24 * 60 * 60)]));
  } catch {
    return new Map<number, string>();
  }
}

async function loadScopedPublicGuideImages(
  guideSlug: string,
  applicationSlug: string | null,
  operatingSystem: OperatingSystem,
) {
  const imagesByScope = await Promise.all(
    publicGuideImageScopes(applicationSlug).map((scope) =>
      loadPublicGuideImages(guideSlug, scope, operatingSystem)),
  );
  return imagesByScope.reduce(
    (merged, current) => mergePublicGuideImages(current, merged),
    new Map<number, string>(),
  );
}

/** Lê as imagens que colaboradores, inclusive visitantes sem login, tornaram públicas. */
export async function getPublicGuideImages(
  guideSlug: string,
  applicationSlug: string | null,
  operatingSystem: OperatingSystem,
) {
  const selectedSystemImages = loadScopedPublicGuideImages(
    guideSlug,
    applicationSlug,
    operatingSystem,
  );
  if (!shouldUseAndroidImageFallback(operatingSystem)) {
    return selectedSystemImages;
  }

  const [specificImages, androidImages] = await Promise.all([
    selectedSystemImages,
    loadScopedPublicGuideImages(guideSlug, applicationSlug, "android"),
  ]);
  return mergePublicGuideImages(specificImages, androidImages);
}
