import { describe, expect, it } from "vitest";
import { mergeCatalogWithFallback, parseSupabaseGuideRow } from "./catalog";

const ids = {
  application: "20000000-0000-4000-8000-000000000001",
  tutorial: "30000000-0000-4000-8000-000000000001",
  guide: "40000000-0000-4000-8000-000000000001",
  step: "50000000-0000-4000-8000-000000000001",
};

const row = {
  id: ids.guide,
  tutorial_id: ids.tutorial,
  platform: "android",
  app_version: "genérica",
  guide_version: "0.1-demo",
  reviewed_at: null,
  status: "draft",
  estimated_minutes: 4,
  tutorials: {
    id: ids.tutorial,
    application_id: ids.application,
    title: "Pagar um boleto",
    slug: "pagar-boleto",
    description: "Demonstração educativa.",
    difficulty: "medium",
    safety_warning: "Não informe dados reais.",
    status: "draft",
    is_demo: true,
    tutorial_search_terms: [{ term: "boleto" }],
    applications: {
      id: ids.application,
      name: "Banco — demonstração",
      slug: "banco-demonstracao",
      description: "Aplicativo fictício.",
      status: "draft",
      is_demo: true,
      categories: { name: "Serviços financeiros" },
    },
  },
  steps: [{
    id: ids.step,
    guide_version_id: ids.guide,
    position: 1,
    title: "Abra o aplicativo",
    instruction: "Abra somente o aplicativo oficial.",
    image_alt: "Tela fictícia.",
    warning: null,
    confirmation_message: null,
    step_media: [],
  }],
};

describe("catálogo Supabase", () => {
  it("converte uma linha validada para o visualizador", () => {
    const content = parseSupabaseGuideRow(row);
    expect(content?.application.category).toBe("Serviços financeiros");
    expect(content?.guide.id).toBe(ids.guide);
    expect(content?.task.searchTerms).toEqual(["boleto"]);
  });

  it("rejeita relações incompletas e plataformas inválidas", () => {
    expect(parseSupabaseGuideRow({ ...row, tutorials: null })).toBeNull();
    expect(parseSupabaseGuideRow({ ...row, platform: "windows" })).toBeNull();
  });

  it("mantém conteúdo local em preparação sem duplicar o conteúdo remoto", () => {
    const fallbackApplication = {
      id: "local-app", name: "Banco", slug: "banco", description: "Local", category: "Banco",
      logoPath: null, searchTerms: [], status: "available" as const, createdAt: "", updatedAt: "",
    };
    const remoteApplication = { ...fallbackApplication, id: ids.application, description: "Remoto" };
    const fallbackTask = {
      id: "local-task", applicationId: "local-app", title: "Boleto", slug: "boleto",
      description: "Local", difficulty: "easy" as const, safetyWarning: "", searchTerms: [],
      availability: "preparing" as const, status: "draft" as const,
    };
    const merged = mergeCatalogWithFallback(
      { applications: [remoteApplication], tasks: [] },
      { applications: [fallbackApplication], tasks: [fallbackTask] },
    );
    expect(merged.applications).toEqual([remoteApplication]);
    expect(merged.tasks[0]?.applicationId).toBe(ids.application);
  });
});
