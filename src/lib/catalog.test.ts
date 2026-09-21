import { describe, expect, it } from "vitest";
import {
  canOpenGuideVersion,
  findSharedBankTask,
  mergeCatalogWithFallback,
  parseSupabaseCatalogRows,
  parseSupabaseGuideRow,
  parseSupabaseUploadGuides,
} from "./catalog";

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
  public_for_upload: true,
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
    image_context_slug: "pagar-boleto",
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

describe("catálogo do Supabase", () => {
  it("abre rascunhos colaborativos somente como prévia", () => {
    expect(canOpenGuideVersion("draft", false, true)).toBe(true);
    expect(canOpenGuideVersion("draft", false, false)).toBe(false);
    expect(canOpenGuideVersion("published", false, false)).toBe(true);
  });

  it("aceita timestamps reais do Supabase e libera a prévia colaborativa", () => {
    const catalog = parseSupabaseCatalogRows([{
      id: ids.application,
      name: "Gov.br",
      slug: "gov-br",
      description: "Serviços públicos.",
      status: "published",
      is_demo: false,
      created_at: "2026-08-13T17:48:38.658249+00:00",
      updated_at: "2026-08-25T23:09:58.604393+00:00",
      categories: { name: "Serviços públicos" },
    }], [{
      id: ids.tutorial,
      application_id: ids.application,
      title: "Acessar o Gov.br",
      slug: "acessar-gov-br",
      description: "Aprenda a acessar.",
      difficulty: "easy",
      safety_warning: "Não compartilhe sua senha.",
      status: "published",
      is_demo: false,
      image_context_slug: "acessar-gov-br",
      tutorial_search_terms: [{ term: "entrar gov" }],
      guide_versions: [{ status: "draft", public_for_upload: true }],
    }]);

    expect(catalog?.tasks[0]?.availability).toBe("demo");
    expect(catalog?.applications[0]?.createdAt).toContain("+00:00");
  });

  it("converte uma linha validada para o visualizador", () => {
    const content = parseSupabaseGuideRow(row);
    expect(content?.application.category).toBe("Serviços financeiros");
    expect(content?.guide.id).toBe(ids.guide);
    expect(content?.task.availability).toBe("demo");
    expect(content?.imageContext).toEqual({
      applicationSlug: null,
      guideSlug: "pagar-boleto",
    });
    expect(content?.task.searchTerms).toEqual(["boleto"]);
  });

  it("rejeita relações incompletas e plataformas inválidas", () => {
    expect(parseSupabaseGuideRow({ ...row, tutorials: null })).toBeNull();
    expect(parseSupabaseGuideRow({ ...row, platform: "windows" })).toBeNull();
  });

  it("mantém conteúdo local em preparação sem duplicar o conteúdo remoto", () => {
    const fallbackApplication = {
      id: "local-app", name: "Banco", slug: "banco", description: "Local", category: "Banco",
      logoPath: "/images/logos/banco.png", searchTerms: ["local"], status: "available" as const, createdAt: "", updatedAt: "",
    };
    const remoteApplication = {
      ...fallbackApplication,
      id: ids.application,
      description: "Remoto",
      logoPath: null,
      searchTerms: ["remoto"],
    };
    const fallbackTask = {
      id: "local-task", applicationId: "local-app", title: "Boleto", slug: "boleto",
      description: "Local", difficulty: "easy" as const, safetyWarning: "", searchTerms: [],
      availability: "preparing" as const, status: "draft" as const,
    };
    const merged = mergeCatalogWithFallback(
      { applications: [remoteApplication], tasks: [] },
      { applications: [fallbackApplication], tasks: [fallbackTask] },
    );
    expect(merged.applications).toEqual([{
      ...remoteApplication,
      logoPath: fallbackApplication.logoPath,
      searchTerms: ["local", "remoto"],
    }]);
    expect(merged.tasks[0]?.applicationId).toBe(ids.application);
  });

  it("preserva a ação editorial ao substituir uma tarefa local pela versão remota", () => {
    const application = {
      id: "remote-bank", name: "Banco", slug: "banco", description: "Banco", category: "Bancos",
      logoPath: null, searchTerms: [], status: "available" as const, createdAt: "", updatedAt: "",
    };
    const localTask = {
      id: "local-task", applicationId: "local-bank", actionId: "pix", title: "Fazer Pix", slug: "pix-banco",
      description: "Local", difficulty: "easy" as const, safetyWarning: "", searchTerms: [],
      availability: "preparing" as const, status: "draft" as const,
    };
    const remoteTask = { ...localTask, id: "remote-task", applicationId: application.id, actionId: undefined };
    const merged = mergeCatalogWithFallback(
      { applications: [application], tasks: [remoteTask] },
      { applications: [{ ...application, id: "local-bank" }], tasks: [localTask] },
    );

    expect(merged.tasks[0]?.actionId).toBe("pix");
  });

  it("encontra o roteiro compartilhado sem depender do ID local do aplicativo", () => {
    const sharedApplication = {
      id: ids.application, name: "Banco — demonstração", slug: "banco-demonstracao", description: "Genérico",
      category: "Bancos", logoPath: null, searchTerms: [], status: "available" as const, createdAt: "", updatedAt: "",
    };
    const sharedTask = {
      id: ids.tutorial, applicationId: ids.application, actionId: "pix", title: "Fazer Pix", slug: "fazer-pix",
      description: "Genérico", difficulty: "easy" as const, safetyWarning: "", searchTerms: [],
      availability: "demo" as const, status: "draft" as const,
    };

    expect(findSharedBankTask({ applications: [sharedApplication], tasks: [sharedTask] }, "pix"))
      .toEqual(sharedTask);
  });

  it("preserva a chave editorial dos passos usados pelos prints", () => {
    const uploadGuides = parseSupabaseUploadGuides([{
      id: ids.guide,
      platform: "android",
      public_for_upload: true,
      tutorials: {
        title: "Pagar um boleto",
        slug: "pagar-boleto",
        applications: {
          is_demo: true,
          categories: { name: "Serviços financeiros" },
        },
      },
      steps: [{
        position: 1,
        editorial_key: "guide-pagar-boleto-android-step-1",
        title: "Abra o aplicativo",
        instruction: "Abra somente o aplicativo oficial.",
        image_alt: "Tela fictícia.",
        warning: null,
        confirmation_message: null,
      }],
    }]);

    expect(uploadGuides?.[0]?.category).toBe("bank");
    expect(uploadGuides?.[0]?.stepsByOperatingSystem.android[0]?.id)
      .toBe("guide-pagar-boleto-android-step-1");
  });
});
