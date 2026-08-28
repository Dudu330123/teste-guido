import { describe, expect, it } from "vitest";
import { normalizeSearch, rankSearch, scoreSearch, type SearchDocument } from "./search-content";

const guideDocuments: SearchDocument[] = [
  { title: "Pagar um boleto", aliases: ["boleto", "pagar conta"] },
  { title: "Bloquear cartão", aliases: ["bloqueio cartao"] },
  { title: "Encontrar limite do cartão", aliases: ["limite cartao"] },
  { title: "Fazer Pix", aliases: ["transferencia pix"] },
  { title: "Ver comprovante", aliases: ["recibo", "comprovante pagamento"] },
  { title: "Ver saldo", aliases: ["saldo conta"] },
  { title: "Recuperar a senha do Gov.br", aliases: ["senha gov"] },
  { title: "Trocar senha do aplicativo", aliases: ["senha banco"] },
  { title: "Acessar o Gov.br", aliases: ["entrar gov"] },
  { title: "Bloquear um contato", aliases: ["WhatsApp", "bloquear pessoa"] },
  { title: "Enviar um áudio", aliases: ["WhatsApp", "mensagem de voz"] },
  { title: "Fazer uma chamada", aliases: ["WhatsApp", "ligacao"] },
  { title: "Identificar golpe bancário", aliases: ["golpe banco"] },
  { title: "O que fazer ao suspeitar de golpe", aliases: ["suspeita golpe"] },
];

function titlesFor(query: string, limit = 4) {
  return rankSearch(guideDocuments, query, (document) => document, limit).map((document) => document.title);
}

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

  it.each([
    ["boleto", "Pagar um boleto"],
    ["boleta", "Pagar um boleto"],
    ["boletoo", "Pagar um boleto"],
    ["BOLETO", "Pagar um boleto"],
    ["comprovamte", "Ver comprovante"],
    ["recibo", "Ver comprovante"],
    ["sando", "Ver saldo"],
    ["saldo", "Ver saldo"],
    ["pix", "Fazer Pix"],
    ["audio", "Enviar um áudio"],
    ["ligacao", "Fazer uma chamada"],
  ])("encontra %s sem exigir a grafia exata", (query, expectedTitle) => {
    expect(titlesFor(query, 1)).toEqual([expectedTitle]);
  });

  it("mantém várias tarefas relevantes para cartão, senha e golpe", () => {
    expect(titlesFor("cartao")).toEqual(["Bloquear cartão", "Encontrar limite do cartão"]);
    expect(titlesFor("senha")).toEqual(["Recuperar a senha do Gov.br", "Trocar senha do aplicativo"]);
    expect(titlesFor("golpe")).toEqual(["Identificar golpe bancário", "O que fazer ao suspeitar de golpe"]);
  });

  it("encontra Gov.br e WhatsApp por abreviações ou erro curto", () => {
    expect(titlesFor("gov")).toEqual(["Recuperar a senha do Gov.br", "Acessar o Gov.br"]);
    expect(titlesFor("watsapp")).toEqual(["Bloquear um contato", "Enviar um áudio", "Fazer uma chamada"]);
    expect(titlesFor("whats")).toEqual(["Bloquear um contato", "Enviar um áudio", "Fazer uma chamada"]);
  });

  it("não inventa resultado para uma palavra sem relação", () => {
    expect(titlesFor("dinossauro")).toEqual([]);
  });
});
