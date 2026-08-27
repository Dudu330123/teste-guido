import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { HomeSearch } from "./home-search";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("busca da página inicial", () => {
  beforeEach(() => push.mockClear());

  it("abre diretamente uma tarefa em preparação pela barra de pesquisa", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);

    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "enviar áudio");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));

    expect(push).toHaveBeenCalledWith("/aplicativos/whatsapp?returnTo=%2F");
    expect(screen.queryByRole("heading", { name: /Resultados para/i })).not.toBeInTheDocument();
  });

  it("prioriza a ação geral de Pix antes de uma tarefa específica", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);

    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "pix");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));

    expect(push).toHaveBeenCalledWith("/acoes/pix?returnTo=%2F");
  });

  it("mostra somente a busca antes de uma pesquisa", () => {
    render(<HomeSearch applications={applications} tasks={tasks} />);

    expect(screen.getByRole("heading", { name: "Encontre o manual.Siga os passos.Resolva." })).toBeVisible();
    expect(screen.getByText(/Tutoriais práticos e passo a passo/)).toBeVisible();
    expect(screen.getByRole("searchbox", { name: "Pesquisar ajuda" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Bancos: Tutoriais sobre seu banco" })).toHaveAttribute("href", "/explorar?categoria=Bancos");
    expect(screen.getByRole("link", { name: "WhatsApp: Dicas e funções essenciais" })).toHaveAttribute("href", "/explorar?q=WhatsApp");
    expect(screen.getByRole("link", { name: "Gov.br: Serviços e acessos do governo" })).toHaveAttribute("href", "/explorar?q=Gov.br");
    expect(screen.getByRole("link", { name: "PIX: Guias sobre pagamentos Pix" })).toHaveAttribute("href", "/explorar?q=Pix");
    expect(screen.queryByText(/Sugestões rápidas/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Resultados para/i })).not.toBeInTheDocument();
  });

  it("faz o exemplo comum de boleto abrir diretamente a próxima tela", () => {
    render(<HomeSearch applications={applications} tasks={tasks} />);

    expect(screen.getByRole("link", { name: "Bancos: Tutoriais sobre seu banco" })).toHaveAttribute("href", "/explorar?categoria=Bancos");
  });

  it("leva uma busca ampla de serviços financeiros ao filtro de bancos", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);

    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "serviços financeiros");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));

    expect(push).toHaveBeenCalledWith("/explorar?categoria=Bancos");
  });

  it("troca os exemplos por sugestões relacionadas enquanto o usuário digita", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);

    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "pix");

    expect(screen.getByRole("link", { name: "Pix: Fazer Pix" })).toHaveAttribute("href", "/acoes/pix?returnTo=%2F");
    expect(screen.getByRole("link", { name: "Comprovante: Ver comprovante Pix" })).toHaveAttribute("href", "/acoes/comprovante?returnTo=%2F");
    expect(screen.getByRole("link", { name: "Pix: Cobrar via Pix" })).toHaveAttribute("href", "/acoes/pix?returnTo=%2F");
    expect(screen.queryByRole("link", { name: "Banco: Como pagar um boleto?" })).not.toBeInTheDocument();
  });

  it("prioriza a ação geral por um erro comum", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);

    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "boletu");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));

    expect(push).toHaveBeenCalledWith("/acoes/boleto?returnTo=%2F");
  });

  it("mostra uma mensagem simples quando não encontra e a remove ao editar", async () => {
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
