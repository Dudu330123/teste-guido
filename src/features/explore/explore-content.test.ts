import { describe, expect, it } from "vitest";
import type { Application, Task } from "@/types/content";
import { buildExploreItems, filterExploreItems, getExploreGuideHref, selectPopularItems } from "./explore-content";

const applications: Application[] = [
  { id: "bank", name: "Banco", slug: "banco", description: "Conta", category: "Serviços financeiros", logoPath: null, searchTerms: ["pix"], status: "available", createdAt: "", updatedAt: "" },
  { id: "gov", name: "Gov.br", slug: "gov-br", description: "Governo", category: "Serviços públicos", logoPath: null, searchTerms: ["governo"], status: "available", createdAt: "", updatedAt: "" },
];
const tasks: Task[] = [
  { id: "two", applicationId: "gov", title: "Recuperar senha", slug: "recuperar", description: "Acesso", difficulty: "easy", safetyWarning: "", searchTerms: ["senha"], availability: "available", status: "published" },
  { id: "one", applicationId: "bank", title: "Fazer Pix", slug: "pix", description: "Transferência", difficulty: "easy", safetyWarning: "", searchTerms: ["dinheiro"], availability: "available", status: "published" },
];

describe("catálogo da página Explorar", () => {
  it("ordena alfabeticamente e filtra por texto ou categoria", () => {
    const items = buildExploreItems(applications, tasks);
    expect(items.map(({ task }) => task.title)).toEqual(["Fazer Pix", "Recuperar senha"]);
    expect(filterExploreItems(items, "governo senha", "").map(({ task }) => task.id)).toEqual(["two"]);
    expect(filterExploreItems(items, "", "Serviços financeiros").map(({ task }) => task.id)).toEqual(["one"]);
  });

  it("não trata um apelido do aplicativo como assunto de todas as tarefas", () => {
    const applicationWithTopicAlias: Application = {
      ...applications[0],
      id: "wallet",
      name: "Carteira",
      searchTerms: ["carteira pix"],
    };
    const unrelatedTask: Task = {
      ...tasks[0],
      id: "card",
      applicationId: "wallet",
      title: "Bloquear cartão",
      searchTerms: ["cartão perdido", "carteira pix"],
    };

    expect(filterExploreItems(buildExploreItems([applicationWithTopicAlias], [unrelatedTask]), "pix", "")).toEqual([]);
  });

  it("ordena os mais acessados por contagem e usa destaque quando não há métricas", () => {
    const items = buildExploreItems(applications, tasks);
    expect(selectPopularItems(items, new Map([["two", 8], ["one", 2]])).items[0]?.task.id).toBe("two");
    expect(selectPopularItems(items, new Map()).measured).toBe(false);
  });

  it("mantém tarefas específicas em preparação no próprio contexto", () => {
    const applicationTask: Task = {
      ...tasks[1],
      applicationId: "bank",
      actionId: "pix",
      slug: "pix-nubank",
      availability: "preparing",
    };

    expect(getExploreGuideHref({ application: applications[0], task: applicationTask })).toBe("/tarefas/pix-nubank");
  });

  it("mantém tarefas genéricas demonstrativas apontando para a ação", () => {
    const genericTask: Task = {
      ...tasks[1],
      applicationId: "app-demo-bancos",
      actionId: "pix",
      slug: "fazer-pix",
      availability: "preparing",
    };
    const genericApplication: Application = {
      ...applications[0],
      id: "app-demo-bancos",
      slug: "banco-demonstracao",
    };

    expect(getExploreGuideHref({ application: genericApplication, task: genericTask })).toBe("/acoes/pix");
  });
});
