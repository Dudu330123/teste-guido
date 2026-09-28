import { describe, expect, it } from "vitest";
import { fixMojibake } from "./text-utils";

describe("fixMojibake", () => {
  it("corrige caracteres acentuados corrompidos por encoding duplo", () => {
    expect(fixMojibake("Enviar um Ã¡udio")).toBe("Enviar um áudio");
    expect(fixMojibake("ConfiguraÃ§Ã£o")).toBe("Configuração");
    expect(fixMojibake("VocÃª")).toBe("Você");
    expect(fixMojibake("CartÃ£o")).toBe("Cartão");
  });

  it("preserva textos normais em português com acentos corretos", () => {
    expect(fixMojibake("Enviar um áudio")).toBe("Enviar um áudio");
    expect(fixMojibake("Acesso ao banco Nubank")).toBe("Acesso ao banco Nubank");
  });

  it("trata valores nulos, indefinidos e strings vazias com segurança", () => {
    expect(fixMojibake("")).toBe("");
    expect(fixMojibake(null)).toBe("");
    expect(fixMojibake(undefined)).toBe("");
  });
});
