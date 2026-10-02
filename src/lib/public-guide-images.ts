import type { GuideStep, OperatingSystem } from "@/types/content";
import { getLocalGuideImages } from "@/data/local-guide-images";

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

/**
 * As imagens do MVP são assets versionados no próprio site.
 * A associação fica no manifesto gerado por `npm run importar-imagens`;
 * nenhum visitante consegue publicar ou substituir uma tela em produção.
 */
export async function getPublicGuideImages(
  guideSlug: string,
  _applicationSlug: string | null,
  _operatingSystem: OperatingSystem,
) {
  const localImages = getLocalGuideImages(guideSlug);
  return new Map(
    Object.entries(localImages).map(([order, imagePath]) => [Number(order), imagePath]),
  );
}
