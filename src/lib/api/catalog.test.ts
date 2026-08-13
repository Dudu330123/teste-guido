import { describe, expect, it } from "vitest";
import { parseGuideResponse } from "./catalog";

const validPayload = {
  data: {
    application: {
      id: "app-demo",
      name: "Banco — demonstração",
      slug: "banco-demonstracao",
      description: "Aplicativo fictício.",
      category: "Serviços financeiros",
      logoUrl: null,
      status: "draft",
    },
    tutorial: {
      id: "tutorial-demo",
      applicationId: "app-demo",
      applicationName: "Banco — demonstração",
      title: "Pagar um boleto",
      slug: "pagar-boleto",
      description: "Demonstração educativa.",
      difficulty: "medium",
      safetyWarning: "Não informe dados reais.",
      searchTerms: ["boleto"],
      status: "draft",
      isDemo: true,
    },
    guide: {
      id: "guide-demo-android",
      tutorialId: "tutorial-demo",
      platform: "android",
      appVersion: "genérica",
      guideVersion: "0.1-demo",
      lastReviewedAt: null,
      status: "draft",
      estimatedMinutes: 4,
    },
    steps: [{
      id: "step-1",
      guideId: "guide-demo-android",
      order: 1,
      title: "Abra o aplicativo",
      instruction: "Abra apenas o aplicativo oficial.",
      imageUrl: null,
      imageAlt: "Tela fictícia.",
      audioUrl: null,
      warning: null,
      confirmationMessage: null,
    }],
  },
};

describe("parseGuideResponse", () => {
  it("converte o contrato da API para os tipos atuais do visualizador", () => {
    const content = parseGuideResponse(validPayload);
    expect(content?.guide.operatingSystem).toBe("android");
    expect(content?.task.availability).toBe("demo");
    expect(content?.steps).toHaveLength(1);
  });

  it("rejeita respostas incompletas ou com plataforma inválida", () => {
    expect(parseGuideResponse({})).toBeNull();
    expect(parseGuideResponse({
      ...validPayload,
      data: { ...validPayload.data, guide: { ...validPayload.data.guide, platform: "windows" } },
    })).toBeNull();
  });
});

