import { describe, expect, it } from "vitest";
import { getGuide, getStepsForGuide } from "@/data/guides";
import {
  applyPublicGuideImages,
  mergePublicGuideImages,
  publicGuideImageScopes,
  shouldUseAndroidImageFallback,
} from "./public-guide-images";

describe("imagens públicas do guia", () => {
  const guide = getGuide("android")!;
  const steps = getStepsForGuide(guide.id);

  it("substitui somente os passos que receberam uma imagem", () => {
    const result = applyPublicGuideImages(steps, new Map([[1, "https://example.com/publica.png"]]));
    expect(result[0]?.imagePath).toBe("https://example.com/publica.png");
    expect(result[1]?.imagePath).toBe(steps[1]?.imagePath);
    expect(result[0]?.instruction).toBe(steps[0]?.instruction);
  });

  it("prioriza a imagem específica do iOS sobre a imagem Android compartilhada", () => {
    const result = applyPublicGuideImages(
      steps,
      mergePublicGuideImages(
        new Map([[1, "https://example.com/ios-step-1.png"]]),
        new Map([[1, "https://example.com/android-step-1.png"], [2, "https://example.com/android-step-2.png"]]),
      ),
    );

    expect(result[0]?.imagePath).toBe("https://example.com/ios-step-1.png");
    expect(result[1]?.imagePath).toBe("https://example.com/android-step-2.png");
  });

  it("mantém o comportamento atual quando não existe imagem em nenhum sistema", () => {
    const result = applyPublicGuideImages(steps, mergePublicGuideImages(new Map(), new Map()));

    expect(result.map((step) => step.imagePath)).toEqual(steps.map((step) => step.imagePath));
  });

  it("consulta o escopo compartilhado antes do escopo específico do aplicativo", () => {
    expect(publicGuideImageScopes("whatsapp")).toEqual([null, "whatsapp"]);
    expect(publicGuideImageScopes(null)).toEqual([null]);

    const recovered = mergePublicGuideImages(
      new Map([[2, "https://example.com/whatsapp-step-2.png"]]),
      new Map([[1, "https://example.com/legacy-step-1.png"], [2, "https://example.com/legacy-step-2.png"]]),
    );
    expect(recovered.get(1)).toBe("https://example.com/legacy-step-1.png");
    expect(recovered.get(2)).toBe("https://example.com/whatsapp-step-2.png");
  });

  it("não adiciona imagens iOS ao mapa usado pelo Android", () => {
    expect(shouldUseAndroidImageFallback("android", "Serviços financeiros")).toBe(false);
    expect(shouldUseAndroidImageFallback("ios", "Comunicação")).toBe(false);
    expect(shouldUseAndroidImageFallback("ios", "Serviços financeiros")).toBe(true);
  });
});
