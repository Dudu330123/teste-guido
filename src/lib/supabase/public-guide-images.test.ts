import { describe, expect, it } from "vitest";
import { getGuide, getStepsForGuide } from "@/data/guides";
import { applyPublicGuideImages } from "./public-guide-images";

describe("imagens públicas do guia", () => {
  it("substitui somente os passos que receberam uma imagem", () => {
    const guide = getGuide("android")!;
    const steps = getStepsForGuide(guide.id);
    const result = applyPublicGuideImages(steps, new Map([[1, "https://example.com/publica.png"]]));
    expect(result[0]?.imagePath).toBe("https://example.com/publica.png");
    expect(result[1]?.imagePath).toBe(steps[1]?.imagePath);
    expect(result[0]?.instruction).toBe(steps[0]?.instruction);
  });
});
