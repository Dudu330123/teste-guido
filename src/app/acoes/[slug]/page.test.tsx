import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ActionPage from "./page";

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <header />,
}));

describe("página de ação", () => {
  it("lista um banco e aponta para a tarefa específica da ação", async () => {
    render(await ActionPage({ params: Promise.resolve({ slug: "pix" }) }));

    const nubankCard = screen.getByRole("heading", { name: "Nubank" }).closest("article");
    expect(nubankCard).not.toBeNull();
    expect(within(nubankCard!).getByText(/O guia de Nubank ainda está em revisão/)).toBeVisible();
    expect(within(nubankCard!).getByRole("link")).toHaveAttribute("href", "/tarefas/pix-nubank");
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
});
