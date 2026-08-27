import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthShell } from "./auth-shell";

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <header data-testid="site-header" />,
}));

describe("estrutura de autenticação", () => {
  it("mantém o formulário dentro do shell visual compartilhado", () => {
    const { container } = render(
      <AuthShell title="Entrar" description="A conta é opcional.">
        <form aria-label="Formulário de acesso"><input aria-label="E-mail" /></form>
      </AuthShell>,
    );

    expect(container.querySelector("main")).toHaveClass("guido-home", "internal-page");
    expect(screen.getByTestId("site-header")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Entrar" })).toBeVisible();
    expect(screen.getByRole("form", { name: "Formulário de acesso" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Voltar ao início/i })).toHaveAttribute("href", "/");
  });
});
