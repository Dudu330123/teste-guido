import { describe, expect, it } from "vitest";
import { validateGuideImageDimensions, validateGuideImageFile } from "./guide-image-validation";

describe("validação de prints dos guias", () => {
  it("aceita os formatos leves definidos para o Storage", () => {
    expect(validateGuideImageFile({ type: "image/webp", size: 400_000 })).toBeNull();
    expect(validateGuideImageFile({ type: "image/png", size: 400_000 })).toBeNull();
  });

  it("rejeita formato desconhecido e arquivo acima de 10 MB", () => {
    expect(validateGuideImageFile({ type: "image/svg+xml", size: 500 })).toContain("PNG");
    expect(validateGuideImageFile({ type: "image/jpeg", size: 11 * 1024 * 1024 })).toContain("10 MB");
  });

  it("limita dimensões para evitar imagens desnecessariamente pesadas", () => {
    expect(validateGuideImageDimensions({ width: 837, height: 1880 })).toBeNull();
    expect(validateGuideImageDimensions({ width: 1080, height: 2400 })).toBeNull();
    expect(validateGuideImageDimensions({ width: 9000, height: 1880 })).toContain("8192");
  });
});
