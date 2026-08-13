export const guideImageRules = {
  acceptedTypes: ["image/png", "image/jpeg", "image/webp"],
  maxBytes: 10 * 1024 * 1024,
  maxDimension: 8192,
} as const;

export interface ImageDimensions {
  width: number;
  height: number;
}

export function validateGuideImageFile(file: Pick<File, "type" | "size">): string | null {
  if (!guideImageRules.acceptedTypes.includes(file.type as (typeof guideImageRules.acceptedTypes)[number])) {
    return "Use uma imagem PNG, JPEG ou WebP.";
  }
  if (file.size <= 0 || file.size > guideImageRules.maxBytes) {
    return "A imagem deve ter no máximo 10 MB.";
  }
  return null;
}

export function validateGuideImageDimensions({ width, height }: ImageDimensions): string | null {
  if (width < 1 || height < 1) return "Não foi possível identificar as dimensões da imagem.";
  if (width > guideImageRules.maxDimension || height > guideImageRules.maxDimension) {
    return "A imagem pode ter no máximo 8192 × 8192 pixels.";
  }
  return null;
}

export async function readImageDimensions(file: Blob): Promise<ImageDimensions> {
  const bitmap = await createImageBitmap(file);
  const dimensions = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return dimensions;
}
