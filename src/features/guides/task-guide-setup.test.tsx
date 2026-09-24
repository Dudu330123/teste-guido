import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskGuideSetup } from "./task-guide-setup";

const push = vi.fn();
const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, back }),
}));

const defaultProps = {
  taskId: "task-pagar-boleto",
  taskSlug: "pagar-boleto",
  taskTitle: "Pagar um boleto",
  description: "Aprenda a reconhecer as etapas comuns.",
  safetyWarning: "Nunca compartilhe sua senha.",
  application: { slug: "caixa", name: "Caixa", logoPath: "/images/logos/caixa.png" },
  applicationOptions: [
    { slug: "caixa", name: "Caixa", logoPath: "/images/logos/caixa.png" },
    { slug: "itau", name: "Itaú", logoPath: "/images/logos/itau.webp" },
  ],
};

describe("preparação do guia", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    back.mockClear();
  });

  it("mantém duas opções visíveis e identifica a seleção atual", () => {
    render(<TaskGuideSetup {...defaultProps} />);

    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getAllByRole("radio").filter((radio) => (radio as HTMLInputElement).checked)).toHaveLength(1);
    expect(screen.getAllByRole("img", { name: /Sistema (Android|iOS)/ })).toHaveLength(2);
    expect(screen.queryByRole("combobox", { name: /aplicativo/i })).not.toBeInTheDocument();

    expect(screen.getByRole("button", { name: /continuar com/i })).toBeEnabled();
  });

  it("mantém somente Android/Outro e iPhone/iOS na tela inicial", () => {
    render(<TaskGuideSetup {...defaultProps} />);

    expect(screen.getByRole("radio", { name: "Android / Outro" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "iPhone" })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Moto G" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "LG" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Xiaomi" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Realme" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Trocar celular" })).not.toBeInTheDocument();
  });

  it("identifica o aplicativo escolhido sem alterar o nome da tarefa", () => {
    render(<TaskGuideSetup {...defaultProps} selectedApplicationSlug="itau" />);

    expect(screen.getByText("Itaú")).toBeVisible();
    expect(screen.getByText("Pagar um boleto")).toBeVisible();
  });

  it("retorna para a página inicial ao clicar em voltar", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /voltar para a página inicial/i }));

    expect(push).toHaveBeenCalledWith("/");
    expect(back).not.toHaveBeenCalled();
  });

  it("seleciona iPhone e continua com o sistema iOS", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} />);

    await user.click(screen.getByRole("radio", { name: "iPhone" }));
    expect(screen.getByRole("radio", { name: "iPhone" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Continuar com iPhone" }));

    expect(localStorage.getItem("guido:preferred-os")).toBe("ios");
    expect(push).toHaveBeenCalledWith("/guias/pagar-boleto?os=ios&app=caixa");
  });

  it("desabilita Continuar quando o guia ainda está em preparação", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} canContinue={false} />);

    const continueButton = screen.getByRole("button", { name: /continuar com/i });
    expect(continueButton).toBeDisabled();
    await user.click(continueButton);
    expect(push).not.toHaveBeenCalled();
  });

  it("permite trocar de celular com as setas do teclado", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} />);
    // Aguarda o sorteio do par inicial terminar antes de capturar os radios.
    await new Promise((resolve) => window.setTimeout(resolve, 50));

    const radios = screen.getAllByRole("radio");
    const first = radios[0];
    const second = radios[1];
    if (!first || !second) throw new Error("O seletor precisa renderizar duas opções.");
    const firstName = first.getAttribute("aria-label");
    const secondName = second.getAttribute("aria-label");
    first.focus();
    await user.keyboard("{ArrowRight}");

    // A seleção deve avançar para o próximo aparelho via teclado.
    expect(second).toBeChecked();
    expect(first).not.toBeChecked();

    // O botão deve refletir a nova seleção após navegar com teclado
    // (foco no input via rAF não é verificável em jsdom, mas a seleção é)
    expect(screen.getByRole("button", { name: new RegExp(`continuar com ${secondName ?? firstName ?? ""}`, "i") })).toBeEnabled();
  });

  it("abre o modal de troca de banco ao clicar no breadcrumb e atualiza o banco escolhido", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} />);

    // Verifica que o breadcrumb inicial mostra Caixa
    expect(screen.getByRole("button", { name: /Banco atual: Caixa/i })).toBeInTheDocument();

    // Clica no breadcrumb para abrir o modal
    await user.click(screen.getByRole("button", { name: /Banco atual: Caixa/i }));

    // Modal deve estar visível
    const dialog = screen.getByRole("dialog", { name: "Trocar de banco" });
    expect(dialog).toBeVisible();
    expect(screen.getByText(/Escolha seu banco para continuar o guia de/i)).toBeInTheDocument();

    // Opções disponíveis
    expect(screen.getByRole("button", { name: /Itaú/i })).toBeInTheDocument();
    expect(screen.getByText("Banco atual")).toBeInTheDocument();

    // Clica em Itaú
    await user.click(screen.getByRole("button", { name: /Itaú/i }));

    // Modal deve fechar e breadcrumb agora reflete Itaú
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Banco atual: Itaú/i })).toBeInTheDocument();

    // Clica em Continuar com iPhone e confirma que o guia vai abrir com Itaú
    await user.click(screen.getByRole("button", { name: /Continuar com/i }));
    expect(push).toHaveBeenCalledWith("/guias/pagar-boleto?os=ios&app=itau");
  });

  it("fecha o modal com Escape sem trocar o banco", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /Banco atual: Caixa/i }));
    expect(screen.getByRole("dialog", { name: "Trocar de banco" })).toBeVisible();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Banco atual: Caixa/i })).toBeInTheDocument();
  });

  it("abre o modal de trocar tarefa para o WhatsApp e atualiza a seleção para continuar", async () => {
    const user = userEvent.setup();
    const whatsappProps = {
      taskId: "task-fazer-chamada-whatsapp",
      taskSlug: "fazer-chamada-whatsapp",
      taskTitle: "Fazer uma chamada",
      description: "Aprenda a iniciar uma ligação pelo WhatsApp.",
      safetyWarning: "Guia em preparação.",
      application: { slug: "whatsapp", name: "WhatsApp", logoPath: "/images/logos/whatsapp-home.png" },
      taskOptions: [
        { id: "task-fazer-chamada-whatsapp", slug: "fazer-chamada-whatsapp", title: "Fazer uma chamada" },
        { id: "task-enviar-audio-whatsapp", slug: "enviar-audio-whatsapp", title: "Enviar um áudio" },
        { id: "task-bloquear-contato-whatsapp", slug: "bloquear-contato-whatsapp", title: "Bloquear um contato" },
      ],
    };

    render(<TaskGuideSetup {...whatsappProps} />);

    // Breadcrumb deve ser um botão clicável com o nome da tarefa atual
    const crumbButton = screen.getByRole("button", { name: /Aplicativo: WhatsApp\. Tarefa atual: Fazer uma chamada/i });
    expect(crumbButton).toBeInTheDocument();

    // Clica para abrir o modal de tarefas
    await user.click(crumbButton);

    const dialog = screen.getByRole("dialog", { name: "Trocar de tarefa" });
    expect(dialog).toBeVisible();
    expect(screen.getByText(/Escolha o que você quer fazer no/i)).toBeInTheDocument();
    expect(screen.getByText("Tarefa atual")).toBeInTheDocument();

    // Seleciona "Enviar um áudio"
    await user.click(screen.getByRole("button", { name: /Enviar um áudio/i }));

    // Modal fecha e o breadcrumb é atualizado
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Aplicativo: WhatsApp\. Tarefa atual: Enviar um áudio/i })).toBeInTheDocument();

    // Clica em Continuar e verifica navegação para a nova tarefa
    const continueBtn = screen.getByRole("button", { name: /continuar com/i });
    expect(continueBtn).toBeEnabled();
    await user.click(continueBtn);
    expect(push).toHaveBeenCalledWith("/guias/enviar-audio-whatsapp?os=ios");
  });

  it("abre o modal de trocar tarefa para o Gov.br e atualiza a seleção", async () => {
    const user = userEvent.setup();
    const govProps = {
      taskId: "task-acessar-gov-br",
      taskSlug: "acessar-gov-br",
      taskTitle: "Acessar o Gov.br",
      description: "Aprenda a localizar o acesso.",
      safetyWarning: "Guia em preparação.",
      application: { slug: "gov-br", name: "Gov.br", logoPath: "/images/logos/gov-br-home.webp" },
      taskOptions: [
        { id: "task-acessar-gov-br", slug: "acessar-gov-br", title: "Acessar o Gov.br" },
        { id: "task-recuperar-senha-gov-br", slug: "recuperar-senha-gov-br", title: "Recuperar a senha do Gov.br" },
      ],
    };

    render(<TaskGuideSetup {...govProps} />);

    const crumbButton = screen.getByRole("button", { name: /Aplicativo: Gov\.br\. Tarefa atual: Acessar o Gov\.br/i });
    await user.click(crumbButton);

    const dialog = screen.getByRole("dialog", { name: "Trocar de tarefa" });
    expect(dialog).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Recuperar a senha do Gov\.br/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Aplicativo: Gov\.br\. Tarefa atual: Recuperar a senha do Gov\.br/i })).toBeInTheDocument();

    const continueBtn = screen.getByRole("button", { name: /continuar com/i });
    expect(continueBtn).toBeEnabled();
    await user.click(continueBtn);
    expect(push).toHaveBeenCalledWith("/guias/recuperar-senha-gov-br?os=ios");
  });
});
