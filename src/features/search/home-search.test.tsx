import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { HomeSearch } from "./home-search";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("navegação guiada por categorias da página inicial", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("exibe o título e as quatro categorias com textos curtos", () => {
    render(<HomeSearch applications={applications} tasks={tasks} />);
    
    // Título principal em destaque
    expect(screen.getByRole("heading", { name: /Escolha uma categoria/i })).toBeVisible();
    expect(screen.getByText("TECNOLOGIA NO SEU RITMO")).toBeVisible();

    // Quatro cards principais com títulos diretos
    expect(screen.getByRole("button", { name: "Bancos" })).toBeVisible();
    expect(screen.getByRole("button", { name: "WhatsApp" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Gov.br" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Outros" })).toBeVisible();

    // Não deve conter subtítulos secundários nem barra de pesquisa
    expect(screen.queryByText("Pix, boleto e cartão")).not.toBeInTheDocument();
    expect(screen.queryByText("Mensagens e chamadas")).not.toBeInTheDocument();
    expect(screen.queryByText("Conta e serviços")).not.toBeInTheDocument();
    expect(screen.queryByText("Gmail e mais apps")).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryByText(/Não sei por onde começar/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/O que você quer aprender hoje\?/i)).not.toBeInTheDocument();
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

  it("abre diretamente o menu de tarefas reais de WhatsApp com textos curtos e subtítulo explicativo", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.click(screen.getByRole("button", { name: /WhatsApp/ }));
    expect(screen.getByRole("dialog", { name: "Escolha uma tarefa" })).toBeVisible();
    expect(screen.getByText("Escolha o que você quer aprender")).toBeVisible();
    expect(screen.getByRole("link", { name: /Enviar mensagem/ })).toHaveAttribute("href", "/tarefas/enviar-mensagem-texto-whatsapp");
    expect(screen.getByRole("link", { name: /Enviar um áudio/ })).toHaveAttribute("href", "/tarefas/enviar-audio-whatsapp");
    expect(screen.getByRole("link", { name: /Ouvir um áudio/ })).toHaveAttribute("href", "/tarefas/ouvir-audio-whatsapp");
    expect(screen.queryByRole("button", { name: /Ver todas as tarefas/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/passos simples/i)).not.toBeInTheDocument();

    // Testa o botão "Ver mais tarefas" no grupo Mensagens e Áudios
    const expandButtons = screen.getAllByRole("button", { name: /Ver mais tarefas/i });
    expect(expandButtons.length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /Fixar uma conversa/ })).not.toBeInTheDocument();

    // Ao clicar em Ver mais tarefas, a quarta tarefa aparece
    await user.click(expandButtons[0]);
    expect(screen.getByRole("link", { name: /Fixar uma conversa/ })).toHaveAttribute("href", "/tarefas/fixar-conversa-whatsapp");
    expect(screen.getByRole("button", { name: /Mostrar menos/i })).toBeVisible();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.getByRole("heading", { name: /Escolha uma categoria/i })).toBeVisible());
  });

  it("fecha o modal ao clicar na área escura externa (backdrop)", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.click(screen.getByRole("button", { name: /WhatsApp/ }));
    const dialog = screen.getByRole("dialog", { name: "Escolha uma tarefa" });
    expect(dialog).toBeVisible();

    // Clicar dentro do modal não fecha
    await user.click(dialog);
    expect(dialog).toBeVisible();

    // Clicar no backdrop externo fecha o modal
    const backdrop = document.querySelector(".home-bank-modal-backdrop") as HTMLElement;
    expect(backdrop).toBeInTheDocument();
    await user.click(backdrop);
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Escolha uma tarefa" })).not.toBeInTheDocument());
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
    const govBtn = screen.getByRole("button", { name: /Gov\.br/ });
    await user.click(govBtn);
    expect(screen.getByRole("dialog", { name: "Escolha uma tarefa" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Conta e Acesso" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Meu INSS" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Entrar no Gov\.br/ })).toBeVisible();
    expect(screen.getByRole("link", { name: /Prova de Vida/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "Fechar lista de tarefas" })).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(govBtn).toHaveFocus());
  });

  it("abre o modal de OUTROS com aplicativos como Gmail e fecha com Escape", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    const othersBtn = screen.getByRole("button", { name: /Outros/ });
    await user.click(othersBtn);

    expect(screen.getByRole("dialog", { name: "Escolha seu aplicativo" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Gmail/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /YouTube/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Google Fotos/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Uber/ })).toBeVisible();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(othersBtn).toHaveFocus());
  });

  it("seleciona Gmail no modal de OUTROS e exibe suas tarefas", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);
    await user.click(screen.getByRole("button", { name: /Outros/ }));
    await user.click(screen.getByRole("button", { name: /Gmail/ }));

    expect(screen.getByRole("dialog", { name: "Escolha uma tarefa" })).toBeVisible();
    expect(screen.getByText(/Ler e-mails recebidos/)).toBeVisible();
    expect(screen.getByText(/Escrever e enviar um novo e-mail/)).toBeVisible();
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
