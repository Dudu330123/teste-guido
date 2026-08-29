import { describe, expect, it } from "vitest";
import { normalizeApplicationCreationInput } from "./application-creation-validation";

const categoryId = "00000000-0000-4000-8000-000000000010";

describe("validação de criação de aplicativos", () => {
  it("aceita os dados editoriais de um aplicativo com categoria existente", () => {
    const result = normalizeApplicationCreationInput({
      name: "Caixa Digital",
      slug: "caixa-digital",
      categoryId,
      description: "Serviços do aplicativo bancário.",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.categoryId).toBe(categoryId);
  });

  it("rejeita slug inválido e descrição acima do limite do banco", () => {
    const result = normalizeApplicationCreationInput({
      name: "Caixa Digital",
      slug: "Caixa Digital",
      categoryId,
      description: "x".repeat(501),
    });

    expect(result.success).toBe(false);
  });

  it("rejeita categoria que não seja um UUID de categoria real", () => {
    const result = normalizeApplicationCreationInput({
      name: "Aplicativo novo",
      slug: "aplicativo-novo",
      categoryId: "bancos",
      description: "Um aplicativo de demonstração.",
    });

    expect(result.success).toBe(false);
  });
});

