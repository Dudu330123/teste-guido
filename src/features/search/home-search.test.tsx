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
  });

  it("abre diretamente uma tarefa em preparação pela barra de pesquisa", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "enviar áudio");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    expect(push).toHaveBeenCalledWith("/tarefas/enviar-audio-whatsapp");
  });

  it("abre o menu de bancos ao pesquisar uma ação geral de Pix", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "pix");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    expect(screen.getByRole("dialog", { name: "Escolha seu banco" })).toBeVisible();
    expect(push).not.toHaveBeenCalled();
  });

  it("abre o menu de bancos para uma tarefa bancária específica", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "identificar golpe bancário");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    expect(screen.getByRole("dialog", { name: "Escolha seu banco" })).toBeVisible();
    expect(push).not.toHaveBeenCalled();
  });

  it("preserva a ação pesquisada ao escolher Caixa", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "pix");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    await user.click(screen.getByRole("button", { name: /Caixa/ }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/tarefas/pix-caixa"));
    expect(screen.queryByRole("dialog", { name: "Escolha uma tarefa" })).not.toBeInTheDocument();
  });

  it("mantém o nome da tarefa genérica e o banco selecionado na rota", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "identificar golpe bancário");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    await user.click(screen.getByRole("button", { name: /Nubank/ }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/tarefas/identificar-golpe-bancario?app=nubank"));
  });

  it("começa sem categoria pré-selecionada e mantém a busca secundária", () => {
    render(<HomeSearch applications={applications} tasks={tasks} />);
    expect(screen.getByRole("heading", { name: "O que você precisa fazer?" })).toBeVisible();
    expect(screen.getByText("Encontre ajuda passo a passo para resolver tarefas do dia a dia.")).toBeVisible();
    expect(screen.getByRole("searchbox", { name: "Pesquisar ajuda" })).toBeVisible();
    expect(screen.getByPlaceholderText("Digite: Pix, boleto, senha...")).toBeVisible();
    expect(screen.getByRole("button", { name: "Pesquisar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Bancos/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /WhatsApp/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Gov.br/ })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Qual banco você usa?" })).not.toBeInTheDocument();
  });

  it("exibe os logos locais nas categorias correspondentes", () => {
    render(<HomeSearch applications={applications} tasks={tasks} />);

    expect(screen.getByRole("img", { name: "Logo do WhatsApp" }).getAttribute("src"))
      .toContain("%2Fimages%2Flogos%2Fwhatsapp-home.png");
    expect(screen.getByRole("img", { name: "Logo do Gov.br" }).getAttribute("src"))
      .toContain("%2Fimages%2Flogos%2Fgov-br-home.webp");
  });

  it("preenche a busca ao escolher uma sugestão rápida", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: "Pix" }));

    expect(screen.getByRole("searchbox", { name: "Pesquisar ajuda" })).toHaveValue("Pix");
    await waitFor(() => expect(screen.getByRole("searchbox", { name: "Pesquisar ajuda" })).toHaveFocus());
    expect(push).not.toHaveBeenCalled();
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
    expect(screen.getByRole("dialog", { name: "Escolha uma tarefa" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Fazer Pix/ })).toHaveAttribute("href", "/tarefas/pix-caixa");
    expect(screen.queryByRole("heading", { name: "Em preparação" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fechar lista de tarefas" })).toHaveFocus();
  });

  it("abre diretamente o menu de tarefas reais de WhatsApp", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.click(screen.getByRole("button", { name: /WhatsApp/ }));
    expect(screen.getByRole("dialog", { name: "Escolha uma tarefa" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Enviar um áudio/ })).toHaveAttribute("href", "/tarefas/enviar-audio-whatsapp");
    expect(screen.queryByRole("button", { name: /Ver todas as tarefas/ })).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.getByRole("heading", { name: "Escolha uma categoria" })).toBeVisible());
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
    expect(screen.getByRole("dialog", { name: "Escolha uma tarefa" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Fazer Pix/ })).toBeVisible();
  });

  it("abre o menu de tarefas diretamente para categorias com poucas opções", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.click(screen.getByRole("button", { name: /Gov.br/ }));
    expect(screen.getByRole("dialog", { name: "Escolha uma tarefa" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Acessar o Gov.br/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "Fechar lista de tarefas" })).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.getByRole("button", { name: /Gov.br/ })).toHaveFocus());
  });

  it("troca categorias por quatro sugestões relevantes enquanto digita", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "pix");
    const suggestionLinks = screen.getAllByRole("link");
    expect(suggestionLinks).toHaveLength(4);
    expect(suggestionLinks.every((link) => link.classList.contains("home-task-card"))).toBe(true);
    expect(screen.queryByRole("heading", { name: "Escolha por onde começar" })).not.toBeInTheDocument();
  });

  it("mostra quatro sugestões de Pix ao digitar um erro comum", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "poki");

    const suggestionLinks = screen.getAllByRole("link");
    expect(suggestionLinks).toHaveLength(4);
    expect(suggestionLinks.some((link) => /pix/i.test(link.textContent ?? ""))).toBe(true);
  });

  it("mantém a grafia digitada e sugere o guia mais próximo", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    const searchbox = screen.getByRole("searchbox", { name: "Pesquisar ajuda" });

    await user.type(searchbox, "Boleta");

    expect(searchbox).toHaveValue("Boleta");
    expect(screen.getByRole("link", { name: /Pagar um boleto/ })).toBeVisible();
    expect(screen.getByText("Talvez você esteja procurando:")).toBeVisible();
  });

  it("abre o menu ao selecionar uma sugestão bancária", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "pix");
    await user.click(screen.getAllByRole("link")[0]);
    expect(screen.getByRole("dialog", { name: "Escolha seu banco" })).toBeVisible();
    expect(push).not.toHaveBeenCalled();
  });

  it("abre o menu de bancos mesmo com um erro comum em boleto", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "boletu");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    expect(screen.getByRole("dialog", { name: "Escolha seu banco" })).toBeVisible();
    expect(push).not.toHaveBeenCalled();
  });

  it("mostra uma orientação clara quando não encontra e remove ao editar", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    const searchbox = screen.getByRole("searchbox", { name: "Pesquisar ajuda" });
    await user.type(searchbox, "xyz inexistente");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    expect(screen.getByText("Não encontramos esse guia.")).toBeVisible();
    expect(screen.getByText("Tente escrever de outra forma.")).toBeVisible();
    await user.clear(searchbox);
    expect(screen.queryByText("Não encontramos esse guia.")).not.toBeInTheDocument();
  });

  it("mostra sugestões relevantes ao digitar pix com letras repetidas (pixxxx)", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "pixxxx");

    const suggestionLinks = screen.getAllByRole("link");
    expect(suggestionLinks).toHaveLength(4);
    expect(suggestionLinks.some((link) => /pix/i.test(link.textContent ?? ""))).toBe(true);
    expect(screen.getByText("Talvez você esteja procurando:")).toBeVisible();
    expect(screen.queryByText("Não encontramos esse guia.")).not.toBeInTheDocument();
  });

  it("abre o menu de bancos ao submeter busca com repetição (pixxxx)", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "pixxxx");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    expect(screen.getByRole("dialog", { name: "Escolha seu banco" })).toBeVisible();
    expect(push).not.toHaveBeenCalled();
  });

  it("não exibe guias e mostra orientação para casos extremos sem sentido (asdfghjk)", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "asdfghjk");

    expect(screen.getByText("Não encontramos esse guia.")).toBeVisible();
    expect(screen.getByText("Tente escrever de outra forma.")).toBeVisible();
    expect(screen.queryByText("Talvez você esteja procurando:")).not.toBeInTheDocument();
  });

  it("exibe 'Banco' como rótulo em cima de todos os guias bancários nas sugestões", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "pixxxx");

    const suggestionLinks = screen.getAllByRole("link");
    expect(suggestionLinks).toHaveLength(4);
    suggestionLinks.forEach((link) => {
      const topLabel = link.querySelector("span:first-child");
      expect(topLabel?.textContent).toBe("Banco");
    });
  });

  it("mostra Bloquear cartão para PicPay mas não para Bradesco no menu de tarefas", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<HomeSearch applications={applications} tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: /Bancos/ }));
    await user.click(screen.getByRole("button", { name: /PicPay/ }));
    expect(screen.getByRole("dialog", { name: "Escolha uma tarefa" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Bloquear cartão/ })).toHaveAttribute("href", "/tarefas/bloquear-cartao-picpay");
    expect(screen.getByRole("link", { name: /Encontrar atendimento oficial/ })).toHaveAttribute("href", "/tarefas/falar-atendimento-banco-app-picpay");

    unmount();
    render(<HomeSearch applications={applications} tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: /Bancos/ }));
    await user.click(screen.getByRole("button", { name: /Bradesco/ }));
    expect(screen.getByRole("dialog", { name: "Escolha uma tarefa" })).toBeVisible();
    expect(screen.queryByRole("link", { name: /Bloquear cartão/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Encontrar atendimento oficial/ })).not.toBeInTheDocument();
  });
});
