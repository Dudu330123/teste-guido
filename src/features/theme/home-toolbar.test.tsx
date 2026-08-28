import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { HomeToolbar } from "./home-toolbar";

describe("controles da página inicial", () => {
  afterEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.themePreference;
    document.documentElement.style.removeProperty("color-scheme");
  });

  it("abre e fecha as orientações de ajuda", async () => {
    const user = userEvent.setup();
    render(<HomeToolbar />);

    await user.click(screen.getByRole("button", { name: "Sobre" }));
    expect(screen.getByRole("dialog", { name: "Como usar o Guido" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Fechar ajuda" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("oferece login, mas não revela a administração ao visitante", () => {
    render(<HomeToolbar />);
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar");
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Tarefas automáticas" })).not.toBeInTheDocument();
  });

  it("mostra a administração somente quando o servidor confirma superadmin", () => {
    render(<HomeToolbar showAdmin />);
    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: "Tarefas automáticas" })).toHaveAttribute("href", "/admin/guias/preview");
  });

  it("liga a navegação à biblioteca e destaca a página ativa", () => {
    render(<HomeToolbar activePage="explore" />);
    expect(screen.getByRole("link", { name: "Explorar" })).toHaveAttribute("href", "/explorar");
    expect(screen.getByRole("link", { name: "Explorar" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current");
  });

  it("alterna e salva o modo de cor", async () => {
    const user = userEvent.setup();
    render(<HomeToolbar />);

    await user.click(screen.getByRole("button", { name: "Alternar entre modo claro e escuro" }));

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).toHaveAttribute("data-theme-preference", "dark");
    expect(window.localStorage.getItem("guido-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Alternar entre modo claro e escuro" })).toBeVisible();
  });

  it("volta ao modo claro no segundo clique sem abrir menu", async () => {
    const user = userEvent.setup();
    render(<HomeToolbar />);

    const themeButton = screen.getByRole("button", { name: "Alternar entre modo claro e escuro" });
    await user.click(themeButton);
    await user.click(themeButton);

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(window.localStorage.getItem("guido-theme")).toBe("light");
    expect(screen.queryByText("Escolha o tema")).not.toBeInTheDocument();
  });
});
