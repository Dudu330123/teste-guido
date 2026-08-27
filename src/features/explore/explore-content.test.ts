import { describe, expect, it } from "vitest";
import { applications as catalogApplications } from "@/data/applications";
import { tasks as catalogTasks } from "@/data/guides";
import type { Application, Task } from "@/types/content";
import {
  buildExploreItems,
  filterExploreItems,
  getExploreGuideHref,
  getExplorePresentationItems,
  groupFinancialExploreItems,
  removeExploreItems,
  selectPopularItems,
} from "./explore-content";

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

  it("agrupa ações financeiras no estado geral e aponta para a ação", () => {
    const items = buildExploreItems(catalogApplications, catalogTasks);
    const presentationItems = getExplorePresentationItems(items, "");
    const pixItems = presentationItems.filter((item) => item.action?.slug === "pix");

    expect(pixItems).toHaveLength(1);
    expect(getExploreGuideHref(pixItems[0]!)).toBe("/acoes/pix");
    expect(presentationItems.filter((item) => item.action).map((item) => item.action?.slug)).toEqual(expect.arrayContaining([
      "bloquear-cartao",
      "boleto",
      "comprovante",
      "limite",
      "pix",
      "saldo",
    ]));
    expect(presentationItems.filter((item) => item.action)).toHaveLength(6);
  });

  it("mantém tarefas específicas quando a busca identifica um banco", () => {
    const items = buildExploreItems(catalogApplications, catalogTasks);
    const nubankItems = getExplorePresentationItems(filterExploreItems(items, "nubank", ""), "nubank");
    const pixNubankItems = getExplorePresentationItems(filterExploreItems(items, "pix nubank", ""), "pix nubank");

    expect(nubankItems.filter((item) => item.application.slug === "nubank").map((item) => item.task.title)).toEqual([
      "Bloquear cartão",
      "Encontrar limite do cartão",
      "Fazer Pix",
      "Pagar boleto",
      "Ver comprovante",
      "Ver saldo",
    ]);
    expect(pixNubankItems).toHaveLength(1);
    expect(pixNubankItems[0]?.task.slug).toBe("pix-nubank");
    expect(getExploreGuideHref(pixNubankItems[0]!)).toBe("/tarefas/pix-nubank");
  });

  it("mantém as tarefas específicas de Gov.br e WhatsApp", () => {
    const items = buildExploreItems(catalogApplications, catalogTasks);

    expect(getExplorePresentationItems(filterExploreItems(items, "gov", ""), "gov")
      .every((item) => item.application.slug === "gov-br")).toBe(true);
    expect(getExplorePresentationItems(filterExploreItems(items, "whatsapp", ""), "whatsapp")
      .every((item) => item.application.slug === "whatsapp")).toBe(true);
  });

  it("não repete no catálogo inicial uma ação já exibida nos destaques", () => {
    const items = buildExploreItems(catalogApplications, catalogTasks);
    const initialItems = getExplorePresentationItems(items, "");
    const popularItems = groupFinancialExploreItems(items.filter((item) => item.task.slug === "pix-nubank"));
    const remainingItems = removeExploreItems(initialItems, popularItems);

    expect(popularItems).toHaveLength(1);
    expect(popularItems[0]?.action?.slug).toBe("pix");
    expect(remainingItems.some((item) => item.action?.slug === "pix")).toBe(false);
    expect(getExplorePresentationItems(filterExploreItems(items, "pix nubank", ""), "pix nubank")).toHaveLength(1);
  });
});
