import { describe, expect, it } from "vitest";
import { getGuideCompleteness, type GuideCompletenessInput } from "./guide-completeness";

const completeStep = {
  title: "Abra o aplicativo",
  instruction: "Toque no aplicativo oficial.",
  imageAlt: "Tela inicial demonstrativa.",
  imageStatus: "validated" as const,
};

function input(overrides: Partial<GuideCompletenessInput> = {}): GuideCompletenessInput {
  return {
    applicationId: "app-caixa",
    categoryId: "category-finance",
    title: "Pagar um boleto",
    description: "Reconheça as etapas.",
    searchTerms: ["boleto"],
    stepsByPlatform: { android: [completeStep] },
    requiredPlatforms: ["android"],
    ...overrides,
  };
}

describe("completude editorial do guia", () => {
  it("marca metadados ausentes como incompletos", () => {
    const result = getGuideCompleteness(input({ categoryId: null, searchTerms: [] }));

    expect(result.status).toBe("incomplete");
    expect(result.reason).toBe("metadata");
  });

  it("marca roteiro sem etapas ou sem texto como incompleto", () => {
    const result = getGuideCompleteness(input({
      stepsByPlatform: { android: [{ ...completeStep, instruction: "" }] },
    }));

    expect(result.status).toBe("incomplete");
    expect(result.reason).toBe("steps");
    expect(result.totalSteps).toBe(1);
  });

  it("diferencia print recebido de print validado", () => {
    const received = getGuideCompleteness(input({
      stepsByPlatform: { android: [{ ...completeStep, imageStatus: "received" }] },
    }));

    expect(received.reason).toBe("images");
    expect(received.stepsWithImages).toBe(1);
    expect(received.validatedImages).toBe(0);
  });

  it("calcula cobertura por plataforma e conclui somente com todos os prints validados", () => {
    const result = getGuideCompleteness(input({
      stepsByPlatform: { android: [completeStep], ios: [completeStep] },
      requiredPlatforms: ["android", "ios"],
    }));

    expect(result.status).toBe("complete");
    expect(result.reason).toBe("complete");
    expect(result.platformCoverage).toEqual({
      android: { totalSteps: 1, stepsWithImages: 1, validatedImages: 1 },
      ios: { totalSteps: 1, stepsWithImages: 1, validatedImages: 1 },
    });
  });

  it("permite separar completude editorial de revisão humana", () => {
    const result = getGuideCompleteness(input({ requireHumanReview: true, humanValidated: false }));

    expect(result.status).toBe("incomplete");
    expect(result.reason).toBe("review");
  });
});
