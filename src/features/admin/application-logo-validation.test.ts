import { describe, expect, it } from "vitest";
import { validateApplicationLogoDimensions, validateApplicationLogoFile } from "./application-logo-validation";

describe("validação do logotipo do aplicativo", () => {
  it("aceita formatos de imagem leves", () => {
    expect(validateApplicationLogoFile({ type: "image/png", size: 120_000 })).toBeNull();
    expect(validateApplicationLogoFile({ type: "image/jpeg", size: 120_000 })).toBeNull();
    expect(validateApplicationLogoFile({ type: "image/webp", size: 120_000 })).toBeNull();
  });

  it("recusa formatos e arquivos acima do limite", () => {
    expect(validateApplicationLogoFile({ type: "image/svg+xml", size: 120_000 })).toMatch(/PNG, JPG ou WebP/);
    expect(validateApplicationLogoFile({ type: "image/png", size: 2 * 1024 * 1024 + 1 })).toMatch(/2 MB/);
  });

  it("valida as dimensões da imagem", () => {
    expect(validateApplicationLogoDimensions(512, 512)).toBeNull();
    expect(validateApplicationLogoDimensions(64, 64)).toMatch(/128/);
    expect(validateApplicationLogoDimensions(4096, 4096)).toMatch(/2048/);
  });
});
