import { describe, expect, it } from "vitest";
import { normalizeGuideCreationInput, slugifyGuideTitle } from "./guide-creation-validation";

const validGuide = {
  applicationSlug: "caixa",
  title: "Consultar saldo",
  slug: "consultar-saldo",
  description: "Aprenda a localizar o saldo sem compartilhar seus dados.",
  difficulty: "easy" as const,
  safetyWarning: "Nunca informe sua senha ao Guido.",
  appVersion: "genérica",
  guideVersion: "0.1",
  estimatedMinutes: 4,
  searchTerms: ["saldo", "consultar saldo", "saldo"],
  steps: [{
    title: "Abra o aplicativo",
    instruction: "Toque no aplicativo oficial.",
    imageAlt: "Tela inicial fictícia do aplicativo.",
    warning: "",
    confirmationMessage: "",
  }],
};

describe("validação de criação de guias", () => {
  it("normaliza termos repetidos e mantém campos opcionais seguros", () => {
    const result = normalizeGuideCreationInput(validGuide);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.searchTerms).toEqual(["saldo", "consultar saldo"]);
      expect(result.data.steps[0]?.warning).toBe("");
    }
  });

  it("rejeita um guia sem passos ou com slug fora do contrato do banco", () => {
    expect(normalizeGuideCreationInput({ ...validGuide, steps: [] }).success).toBe(false);
    expect(normalizeGuideCreationInput({ ...validGuide, slug: "Consultar Saldo" }).success).toBe(false);
  });

  it("gera identificadores compatíveis com as constraints do PostgreSQL", () => {
    expect(slugifyGuideTitle("Pagar um boleto — Caixa")).toBe("pagar-um-boleto-caixa");
    expect(slugifyGuideTitle("   ")).toBe("novo-guia");
  });
});
