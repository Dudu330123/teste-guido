import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { HomeToolbar } from "./home-toolbar";
import { AccessibilityProvider } from "@/features/accessibility/accessibility-context";

describe("controles da página inicial", () => {
  afterEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.themePreference;
    delete document.documentElement.dataset.guidoColor;
    delete document.documentElement.dataset.guidoPosition;
    delete document.documentElement.dataset.guideAccent;
    delete document.documentElement.dataset.fontSize;
    document.documentElement.style.removeProperty("color-scheme");
  });

  it("abre o painel grande de configurações e fecha pelo X", async () => {
    const user = userEvent.setup();
    render(<HomeToolbar />);

    await user.click(screen.getByRole("button", { name: "Abrir configurações" }));
    expect(screen.getByRole("dialog", { name: "Configurações do Guido" })).toBeVisible();
    expect(screen.getByRole("button", { name: /^Como usar o Guido/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /^Pedir um guia/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /^Mudar a cor dos destaques dos passos/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "Fechar configurações" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Fechar configurações" }));
    expect(screen.queryByRole("dialog", { name: "Configurações do Guido" })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Abrir configurações" })).toHaveFocus());
  });

  it("aplica as preferências visuais e o modo fácil pelo painel", async () => {
    const user = userEvent.setup();
    render(<AccessibilityProvider><HomeToolbar /></AccessibilityProvider>);

    await user.click(screen.getByRole("button", { name: "Abrir configurações" }));
    await user.click(screen.getByRole("button", { name: /Mudar a cor dos destaques dos passos/ }));
    expect(screen.getByRole("dialog", { name: "Cor dos destaques dos passos" })).toBeVisible();
    expect(screen.getByLabelText("Prévia dos destaques na cor Azul")).toBeVisible();
    expect(screen.getAllByRole("radio")).toHaveLength(9);
    await user.click(screen.getByRole("radio", { name: "Roxo" }));
    expect(document.documentElement).toHaveAttribute("data-guide-accent", "purple");
    expect(window.localStorage.getItem("guido-accent")).toBe("purple");
    expect(screen.getByRole("radio", { name: "Roxo (selecionado)" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByLabelText("Prévia dos destaques na cor Roxo")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Voltar para configurações" }));
    expect(screen.getByRole("button", { name: /Mudar a cor dos destaques dos passos/ })).toBeVisible();

    await user.click(screen.getByRole("button", { name: /^Ativar modo fácil de ler/ }));
    expect(document.documentElement).toHaveAttribute("data-font-size", "large");
    expect(screen.queryByRole("button", { name: /^Voltar ao modo detalhado/ })).not.toBeInTheDocument();
  });

  it("mantém nove cores de destaque e restaura a escolha ao reabrir", async () => {
    const user = userEvent.setup();
    render(<HomeToolbar />);

    await user.click(screen.getByRole("button", { name: "Abrir configurações" }));
    await user.click(screen.getByRole("button", { name: /Mudar a cor dos destaques dos passos/ }));

    await user.click(screen.getByRole("radio", { name: "Verde" }));
    expect(document.documentElement).toHaveAttribute("data-guide-accent", "green");
    await user.click(screen.getByRole("radio", { name: "Laranja" }));
    expect(document.documentElement).toHaveAttribute("data-guide-accent", "orange");
    await user.click(screen.getByRole("radio", { name: "Amarelo" }));
    expect(document.documentElement).toHaveAttribute("data-guide-accent", "yellow");

    await user.click(screen.getByRole("button", { name: "Voltar para configurações" }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Mudar a cor dos destaques dos passos/ })).toHaveFocus());
    expect(screen.getByRole("button", { name: /Mudar a cor dos destaques dos passos/ })).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Mudar a cor dos destaques dos passos/ }));
    expect(screen.getByRole("radio", { name: "Amarelo (selecionado)" })).toHaveAttribute("aria-checked", "true");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Cor dos destaques dos passos" })).not.toBeInTheDocument();
  });

  it("abre a tela de aparência, entra em Cor e troca a cor do Guido imediatamente", async () => {
    const user = userEvent.setup();
    render(<HomeToolbar />);

    await user.click(screen.getByRole("button", { name: "Abrir configurações" }));
    await user.click(screen.getByRole("button", { name: /^Mudar a aparência do Guido/ }));

    expect(screen.getByRole("dialog", { name: "Aparência do Guido" })).toBeVisible();
    expect(screen.getByRole("button", { name: /^Cor/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /^Posição/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Em desenvolvimento/ })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /^Cor/ }));
    expect(screen.getByRole("dialog", { name: "Cor do Guido" })).toBeVisible();
    expect(screen.getByText("Cor atual:").parentElement).toHaveTextContent("Azul");
    expect(screen.getAllByRole("radio")).toHaveLength(7);
    expect(screen.getByRole("radio", { name: "Azul (selecionado)" })).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("radio", { name: "Roxo" }));

    expect(document.documentElement).toHaveAttribute("data-guido-color", "purple");
    expect(window.localStorage.getItem("guido-color")).toBe("purple");
    expect(screen.getByRole("radio", { name: "Roxo (selecionado)" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Cor atual:").parentElement).toHaveTextContent("Roxo");
    expect(screen.getByLabelText("Prévia do Guido na cor Roxo")).toBeVisible();
  });

  it("oferece oito cores para o Guido e salva uma das novas opções", async () => {
    const user = userEvent.setup();
    render(<HomeToolbar />);

    await user.click(screen.getByRole("button", { name: "Abrir configurações" }));
    await user.click(screen.getByRole("button", { name: /^Mudar a aparência do Guido/ }));
    await user.click(screen.getByRole("button", { name: /^Cor/ }));

    expect(screen.getByRole("radio", { name: "Amarelo" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "Vermelho" })).toBeVisible();
    expect(screen.queryByRole("radio", { name: "Preto" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Rosa" })).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Azul + Dourado" })).toBeVisible();
    expect(screen.getAllByRole("radio")).toHaveLength(7);

    await user.click(screen.getByRole("radio", { name: "Amarelo" }));
    expect(document.documentElement).toHaveAttribute("data-guido-color", "yellow");
    expect(window.localStorage.getItem("guido-color")).toBe("yellow");
  });

  it("permite escolher a pose do Guido e persiste a escolha", async () => {
    const user = userEvent.setup();
    render(<HomeToolbar />);

    await user.click(screen.getByRole("button", { name: "Abrir configurações" }));
    await user.click(screen.getByRole("button", { name: /^Mudar a aparência do Guido/ }));
    await user.click(screen.getByRole("button", { name: /^Posição/ }));

    expect(screen.getByRole("dialog", { name: "Posição do Guido" })).toBeVisible();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(screen.getByRole("radio", { name: "Pose padrão (selecionado)" })).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("radio", { name: "Guido acenando" }));

    expect(document.documentElement).toHaveAttribute("data-guido-position", "acenando");
    expect(window.localStorage.getItem("guido-position")).toBe("acenando");
    expect(screen.getByRole("radio", { name: "Guido acenando (selecionado)" })).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("button", { name: "Voltar para configurações" }));
    expect(screen.getByRole("dialog", { name: "Aparência do Guido" })).toBeVisible();
  });

  it("volta da aparência para as configurações e mantém a escolha ao reabrir", async () => {
    const user = userEvent.setup();
    render(<HomeToolbar />);

    await user.click(screen.getByRole("button", { name: "Abrir configurações" }));
    await user.click(screen.getByRole("button", { name: /^Mudar a aparência do Guido/ }));
    await user.click(screen.getByRole("button", { name: /^Cor/ }));
    await user.click(screen.getByRole("radio", { name: "Verde" }));
    await user.click(screen.getByRole("button", { name: "Voltar para configurações" }));

    expect(screen.getByRole("dialog", { name: "Aparência do Guido" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Voltar para configurações" }));

    expect(screen.getByRole("dialog", { name: "Configurações do Guido" })).toBeVisible();
    await waitFor(() => expect(screen.getByRole("button", { name: /^Mudar a aparência do Guido/ })).toHaveFocus());
    expect(screen.getByRole("button", { name: /^Mudar a aparência do Guido/ })).toHaveTextContent("Cor atual");

    await user.click(screen.getByRole("button", { name: /^Mudar a aparência do Guido/ }));
    await user.click(screen.getByRole("button", { name: /^Cor/ }));
    expect(screen.getByRole("radio", { name: "Verde (selecionado)" })).toHaveAttribute("aria-checked", "true");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Aparência do Guido" })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Abrir configurações" })).toHaveFocus());
  });

  it("usa Pedir um guia para abrir o assistente", async () => {
    const user = userEvent.setup();
    render(<HomeToolbar />);

    await user.click(screen.getByRole("button", { name: "Abrir configurações" }));
    await user.click(screen.getByRole("button", { name: /^Pedir um guia/ }));
    expect(screen.getByRole("dialog", { name: "Pedir um guia" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "O que você quer aprender?" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Criar guia/ })).toBeVisible();
    expect(screen.queryByText(/Continuar com Google/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Entre para pedir seu guia/i)).not.toBeInTheDocument();
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
    expect(screen.getByRole("link", { name: "Criar e editar guias" })).toHaveAttribute("href", "/admin/guias/preview");
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

  it("destaca a central de criação e edição de guias", () => {
    render(<HomeToolbar activePage="guides" />);

    expect(screen.getByRole("link", { name: "Criar e editar guias" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Enviar print" })).not.toBeInTheDocument();
  });

  it("mantém todas as opções na página inicial", () => {
    render(<HomeToolbar activePage="home" />);

    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Sobre" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Explorar" })).toHaveAttribute("href", "/explorar");
    expect(screen.getByRole("link", { name: "Criar e editar guias" })).toHaveAttribute("href", "/admin/guias/preview");
  });

  it("indica Sobre enquanto a ajuda está aberta", async () => {
    const user = userEvent.setup();
    render(<HomeToolbar />);

    const about = screen.getByRole("button", { name: "Sobre" });
    expect(about).not.toHaveAttribute("aria-current");
    await user.click(about);

    expect(screen.getByRole("button", { name: "Sobre" })).toHaveAttribute("aria-current", "page");
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

  it("exibe o botão Guido e Entrar na página inicial, mas oculta nas páginas internas", () => {
    const { unmount } = render(<HomeToolbar />);
    expect(screen.getByRole("button", { name: "Falar com o Guido por voz" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
    unmount();

    render(<HomeToolbar isInternal />);
    expect(screen.queryByRole("button", { name: "Falar com o Guido por voz" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
  });

  it("exibe o botão de alternar tema somente na página inicial, mas oculta nas páginas internas e explorar", () => {
    const { unmount } = render(<HomeToolbar />);
    expect(screen.getByRole("button", { name: "Alternar entre modo claro e escuro" })).toBeInTheDocument();
    unmount();

    const { unmount: unmountInternal } = render(<HomeToolbar isInternal />);
    expect(screen.queryByRole("button", { name: "Alternar entre modo claro e escuro" })).not.toBeInTheDocument();
    unmountInternal();

    render(<HomeToolbar activePage="explore" />);
    expect(screen.queryByRole("button", { name: "Alternar entre modo claro e escuro" })).not.toBeInTheDocument();
  });
});
