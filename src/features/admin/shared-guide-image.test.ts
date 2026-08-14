import { describe, expect, it } from "vitest";
import { extensionForGuideImage, guideImageContextSchema } from "./shared-guide-image";

describe("contrato dos prints compartilhados", () => {
  it("aceita somente um contexto conhecido e limitado", () => {
    expect(guideImageContextSchema.safeParse({
      guideSlug: "pagar-boleto",
      applicationSlug: "caixa",
      operatingSystem: "android",
      stepId: "boleto-android-1",
      stepOrder: 1,
    }).success).toBe(true);

    expect(guideImageContextSchema.safeParse({
      guideSlug: "../../segredo",
      applicationSlug: null,
      operatingSystem: "windows",
      stepId: "passo 1",
      stepOrder: 0,
    }).success).toBe(false);
  });

  it("deriva a extensão a partir do MIME validado, não do nome enviado", () => {
    expect(extensionForGuideImage("image/png")).toBe("png");
    expect(extensionForGuideImage("image/jpeg")).toBe("jpg");
    expect(extensionForGuideImage("image/webp")).toBe("webp");
  });
});
