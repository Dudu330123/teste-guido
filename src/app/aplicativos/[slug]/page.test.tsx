import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationPage from "./page";

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <header />,
}));

describe("página do aplicativo bancário", () => {
  it("abre o roteiro compartilhado quando a tarefa específica ainda não tem passos", async () => {
    render(await ApplicationPage({ params: Promise.resolve({ slug: "caixa" }) }));

    const boletoCard = screen.getByRole("heading", { name: "Pagar boleto" }).closest("article");
    expect(boletoCard).not.toBeNull();
    expect(within(boletoCard!).getByText("Demonstração educativa disponível")).toBeVisible();
    expect(within(boletoCard!).getByRole("link", { name: "Escolher meu celular" })).toHaveAttribute(
      "href",
      "/tarefas/pagar-boleto?app=caixa",
    );
  });

  it("mantém em preparação quando não existe roteiro compartilhado utilizável", async () => {
    render(await ApplicationPage({ params: Promise.resolve({ slug: "caixa" }) }));

    const pixCard = screen.getByRole("heading", { name: "Fazer Pix" }).closest("article");
    expect(pixCard).not.toBeNull();
    expect(within(pixCard!).getByText("Guia em preparação")).toBeVisible();
    expect(within(pixCard!).queryByRole("link", { name: "Escolher meu celular" })).not.toBeInTheDocument();
  });
});
