import { describe, expect, it } from "vitest";
import { normalizeSearch, rankSearch, scoreSearch } from "./search-content";

describe("pontuação da busca", () => {
  it("normaliza acentos e encontra termos separados", () => {
    expect(normalizeSearch("Áudio no Itaú")).toBe("audio no itau");
    expect(scoreSearch("Aprenda a enviar um áudio", "enviar áudio")).toBeGreaterThan(0);
  });

  it("entende erros comuns de digitação para Pix", () => {
    expect(normalizeSearch("poki")).toBe("pix");
    expect(normalizeSearch("pok banco")).toBe("pix banco");
    expect(rankSearch(["Fazer Pix"], "poki", (item) => item, 4)).toEqual(["Fazer Pix"]);
  });

  it("prioriza correspondência exata e respeita o limite", () => {
    const items = ["boleto no banco", "pagar boleto", "segunda via de boleto"];
    expect(rankSearch(items, "pagar boleto", (item) => item, 2)).toEqual(["pagar boleto"]);
  });

  it("não retorna resultado quando falta um dos termos", () => {
    expect(scoreSearch("enviar mensagem escrita", "enviar áudio")).toBe(0);
  });
});
