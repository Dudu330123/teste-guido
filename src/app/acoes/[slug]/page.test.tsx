import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ActionPage from "./page";

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <header />,
}));

describe("página de ação", () => {
  it("lista um banco e mantém a ação genérica até existir um guia específico publicado", async () => {
    render(await ActionPage({ params: Promise.resolve({ slug: "pix" }) }));

    const nubankCard = screen.getByRole("heading", { name: "Nubank" }).closest("article");
    expect(nubankCard).not.toBeNull();
    expect(within(nubankCard!).getByText(/O guia de Nubank ainda está em revisão/)).toBeVisible();
    expect(within(nubankCard!).getByRole("link")).toHaveAttribute("href", "/tarefas/fazer-pix?app=nubank");
  });

  it("mantém o link demonstrativo da ação de boleto", async () => {
    render(await ActionPage({ params: Promise.resolve({ slug: "boleto" }) }));

    const demoCard = screen.getByRole("heading", { name: "Banco — demonstração" }).closest("article");
    expect(demoCard).not.toBeNull();
    expect(within(demoCard!).getByRole("link", { name: "Abrir demonstração" })).toHaveAttribute(
      "href",
      "/tarefas/pagar-boleto",
    );
  });

  it("preserva o caminho do Explorar ao escolher o banco", async () => {
    render(await ActionPage({
      params: Promise.resolve({ slug: "pix" }),
      searchParams: Promise.resolve({ returnTo: "/explorar?q=Pix" }),
    }));

    expect(screen.getByRole("link", { name: /Voltar para tarefas/i })).toHaveAttribute("href", "/explorar?q=Pix");
    const nubankCard = screen.getByRole("heading", { name: "Nubank" }).closest("article");
    expect(within(nubankCard!).getByRole("link")).toHaveAttribute(
      "href",
      "/tarefas/fazer-pix?app=nubank&returnTo=%2Fexplorar%3Fq%3DPix",
    );
  });

  it("abre o guia de boleto no aparelho escolhido depois da seleção do banco", async () => {
    render(await ActionPage({
      params: Promise.resolve({ slug: "boleto" }),
      searchParams: Promise.resolve({ os: "ios" }),
    }));

    const caixaCard = screen.getByRole("heading", { name: "Caixa" }).closest("article");
    expect(caixaCard).not.toBeNull();
    expect(within(caixaCard!).getByRole("link", { name: "Abrir demonstração" })).toHaveAttribute(
      "href",
      "/guias/pagar-boleto?os=ios&app=caixa",
    );
  });
});
