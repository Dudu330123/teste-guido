import { describe, expect, it } from "vitest";
import {
  createGuidePreviewDraft,
  createGuidePreviewExport,
  getReviewStatus,
  normalizeGuidePreviewDraft,
  normalizeGuidePreviewExport,
} from "./guide-preview-draft";

const guide = {
  applicationSlug: "gmail",
  title: "Recuperar a senha",
  slug: "recuperar-senha",
  description: "Aprenda a encontrar a recuperação oficial.",
  difficulty: "easy" as const,
  safetyWarning: "Não compartilhe códigos.",
  appVersion: "genérica",
  guideVersion: "1.0",
  estimatedMinutes: 5,
  searchTerms: ["senha"],
  steps: [
    {
      title: "Abra o Gmail",
      instruction: "Toque no aplicativo oficial do Gmail.",
      imageAlt: "Tela inicial demonstrativa do Gmail.",
      warning: "",
      confirmationMessage: "",
    },
    {
      title: "Procure a recuperação",
      instruction: "Toque em Esqueci minha senha.",
      imageAlt: "Tela demonstrativa de recuperação sem dados reais.",
      warning: "Não informe códigos ao Guido.",
      confirmationMessage: "",
    },
  ],
};

describe("contrato de rascunho local", () => {
  it("gera IDs determinísticos para tarefa, guia e etapas", () => {
    const first = createGuidePreviewDraft({ guide, applicationName: "Gmail", applicationCategory: "Comunicação", updatedAt: "2026-08-28T12:00:00.000Z" });
    const second = createGuidePreviewDraft({ guide, applicationName: "Gmail", applicationCategory: "Comunicação", updatedAt: "2026-08-29T12:00:00.000Z" });

    expect(first.taskId).toBe("task-gmail-recuperar-senha");
    expect(first.guideId).toBe("guide-task-gmail-recuperar-senha-1-0");
    expect(first.steps.map((step) => step.id)).toEqual(second.steps.map((step) => step.id));
    expect(first.steps.map((step) => step.editorialKey)).toEqual([
      "recuperar-senha.step.01",
      "recuperar-senha.step.02",
    ]);
    expect(first.searchTerms).toEqual(["senha"]);
    expect(first.safetyWarning).toBe("Não compartilhe códigos.");
  });

  it("calcula a revisão a partir do status das imagens", () => {
    const draft = createGuidePreviewDraft({ guide, applicationName: "Gmail", applicationCategory: "Comunicação" });
    expect(draft.reviewStatus).toBe("awaiting-images");

    const received = draft.steps.map((step) => ({ ...step, imageStatus: "received" as const }));
    expect(getReviewStatus(received)).toBe("in-review");

    const validated = received.map((step) => ({ ...step, imageStatus: "validated" as const }));
    expect(getReviewStatus(validated)).toBe("ready-for-human-review");
  });

  it("exporta e importa o mesmo contrato sem perder as chaves editoriais", () => {
    const draft = createGuidePreviewDraft({ guide, applicationName: "Gmail", applicationCategory: "Comunicação" });
    const imported = normalizeGuidePreviewExport(createGuidePreviewExport([draft]));

    expect(imported).toHaveLength(1);
    expect(imported[0]?.source).toBe("imported");
    expect(imported[0]?.taskId).toBe(draft.taskId);
    expect(imported[0]?.steps[1]?.editorialKey).toBe("recuperar-senha.step.02");
  });

  it("rejeita exportações incompatíveis ou etapas incompletas", () => {
    expect(normalizeGuidePreviewExport({ format: "outro-formato", schemaVersion: 1, guides: [] })).toEqual([]);
    expect(normalizeGuidePreviewDraft({
      applicationSlug: "gmail",
      slug: "sem-etapa",
      title: "Sem etapa",
      steps: [{ title: "", instruction: "", imageAlt: "" }],
    })).toBeNull();
  });

  it("mantém compatibilidade com rascunhos antigos sem termos de busca", () => {
    const normalized = normalizeGuidePreviewDraft({
      applicationSlug: "gmail",
      slug: "recuperar-senha",
      title: "Recuperar a senha",
      description: "Aprenda a encontrar a recuperação oficial.",
      steps: [{ title: "Abra o Gmail", instruction: "Toque no aplicativo oficial.", imageAlt: "Tela inicial." }],
    });

    expect(normalized?.searchTerms).toEqual([]);
    expect(normalized?.safetyWarning).toBe("");
  });
});
