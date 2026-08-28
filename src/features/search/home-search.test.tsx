import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { HomeSearch } from "./home-search";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("busca e navegação guiada da página inicial", () => {
  beforeEach(() => {
    push.mockClear();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("abre diretamente uma tarefa em preparação pela barra de pesquisa", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "enviar áudio");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    expect(push).toHaveBeenCalledWith("/aplicativos/whatsapp");
  });

  it("prioriza a ação geral de Pix antes de uma tarefa específica", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "pix");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    expect(push).toHaveBeenCalledWith("/acoes/pix");
  });

  it("começa sem categoria pré-selecionada e mantém a busca secundária", () => {
    render(<HomeSearch applications={applications} tasks={tasks} />);
    expect(screen.getByRole("heading", { name: "Como podemos ajudar?" })).toBeVisible();
    expect(screen.getByText(/Conte com o Guido/)).toBeVisible();
    expect(screen.getByRole("searchbox", { name: "Pesquisar ajuda" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Pesquisar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Bancos/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /WhatsApp/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Gov.br/ })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Qual banco você usa?" })).not.toBeInTheDocument();
  });

  it("não envia pesquisa vazia e libera o botão com texto útil", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    const searchbox = screen.getByRole("searchbox", { name: "Pesquisar ajuda" });
    const submit = screen.getByRole("button", { name: "Pesquisar" });
    await user.type(searchbox, "   ");
    expect(submit).toBeDisabled();
    await user.type(searchbox, "pix");
    expect(submit).toBeEnabled();
  });

  it("abre diretamente o menu de bancos e mostra tarefas reais após escolher um banco", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.click(screen.getByRole("button", { name: /Bancos/ }));
    expect(screen.getByRole("dialog", { name: "Escolha seu banco" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Banco Inter/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Mercado Pago/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Caixa/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Nubank/ })).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Caixa/ }));
    expect(screen.getByRole("heading", { name: "O que você quer fazer em Caixa?" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Fazer Pix/ })).toHaveAttribute("href", "/tarefas/pix-caixa");
    expect(screen.getByRole("button", { name: "← Trocar banco" })).toBeVisible();
  });

  it("troca a área por tarefas reais de WhatsApp e permite voltar", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.click(screen.getByRole("button", { name: /WhatsApp/ }));
    expect(screen.getByRole("heading", { name: "O que você quer fazer em WhatsApp?" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Enviar um áudio/ })).toHaveAttribute("href", "/tarefas/enviar-audio-whatsapp");
    await user.click(screen.getByRole("button", { name: "← Voltar" }));
    expect(screen.getByRole("heading", { name: "Escolha por onde começar" })).toBeVisible();
  });

  it("não rola a página quando o novo painel já está suficientemente visível", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
    const bounds = vi.spyOn(window.HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 300, top: 300, left: 0, right: 700, bottom: 620, width: 700, height: 320,
      toJSON: () => ({}),
    });
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.click(screen.getByRole("button", { name: /WhatsApp/ }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "O que você quer fazer em WhatsApp?" })).toBeVisible());
    expect(scrollIntoView).not.toHaveBeenCalled();
    bounds.mockRestore();
  });

  it("usa rolagem sem animação quando há pouco painel visível e movimento reduzido", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
    const bounds = vi.spyOn(window.HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 760, top: 760, left: 0, right: 700, bottom: 1080, width: 700, height: 320,
      toJSON: () => ({}),
    });
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)", media: query, onchange: null,
        addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
      })),
    });
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.click(screen.getByRole("button", { name: /WhatsApp/ }));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "nearest" }));
    bounds.mockRestore();
    Object.defineProperty(window, "matchMedia", { configurable: true, value: originalMatchMedia });
  });

  it("abre o menu de bancos, fecha com Escape e devolve o foco", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    const opener = screen.getByRole("button", { name: /Bancos/ });
    await user.click(opener);
    expect(screen.getByRole("dialog", { name: "Escolha seu banco" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Fechar lista de bancos" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it("seleciona um banco no modal e mostra suas tarefas", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.click(screen.getByRole("button", { name: /Bancos/ }));
    await user.click(screen.getByRole("button", { name: /Banco do Brasil/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "O que você quer fazer em Banco do Brasil?" })).toBeVisible();
  });

  it("troca categorias por sugestões sem quebrar os destinos existentes", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "pix");
    expect(screen.getByRole("link", { name: /Fazer Pix/ })).toHaveAttribute("href", "/acoes/pix");
    expect(screen.getByRole("link", { name: /Ver comprovante Pix/ })).toHaveAttribute("href", "/acoes/comprovante");
    expect(screen.queryByRole("heading", { name: "Escolha por onde começar" })).not.toBeInTheDocument();
  });

  it("prioriza a ação geral por um erro comum", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "boletu");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    expect(push).toHaveBeenCalledWith("/acoes/boleto");
  });

  it("mostra mensagem quando não encontra e remove ao editar", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    const searchbox = screen.getByRole("searchbox", { name: "Pesquisar ajuda" });
    await user.type(searchbox, "xyz inexistente");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    expect(screen.getByRole("heading", { name: "Ainda não encontramos “xyz inexistente”" })).toBeVisible();
    await user.clear(searchbox);
    expect(screen.queryByRole("heading", { name: /Ainda não encontramos/i })).not.toBeInTheDocument();
  });
});
