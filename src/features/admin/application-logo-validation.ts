export const applicationLogoRules = {
  acceptedTypes: ["image/png", "image/jpeg", "image/webp"] as const,
  maxBytes: 2 * 1024 * 1024,
  minDimension: 128,
  maxDimension: 2048,
};

export function validateApplicationLogoFile(file: Pick<File, "size" | "type">) {
  if (!applicationLogoRules.acceptedTypes.includes(file.type as typeof applicationLogoRules.acceptedTypes[number])) {
    return "Use uma imagem PNG, JPG ou WebP.";
  }
  if (file.size <= 0) return "O arquivo selecionado está vazio.";
  if (file.size > applicationLogoRules.maxBytes) return "A imagem deve ter no máximo 2 MB.";
  return null;
}

export function validateApplicationLogoDimensions(width: number, height: number) {
  if (!Number.isInteger(width) || !Number.isInteger(height)) return "Não foi possível verificar o tamanho da imagem.";
  if (width < applicationLogoRules.minDimension || height < applicationLogoRules.minDimension) {
    return "A imagem precisa ter pelo menos 128 × 128 pixels.";
  }
  if (width > applicationLogoRules.maxDimension || height > applicationLogoRules.maxDimension) {
    return "A imagem deve ter no máximo 2048 × 2048 pixels.";
  }
  return null;
}
