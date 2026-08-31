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

const whatsappProps = {
  taskId: "task-enviar-audio-whatsapp",
  taskSlug: "enviar-audio-whatsapp",
  taskTitle: "Enviar um áudio",
  description: "Aprenda a gravar e enviar uma mensagem de voz.",
  safetyWarning: "Guia em preparação.",
  application: { slug: "whatsapp", name: "WhatsApp", logoPath: "/images/logos/whatsapp.png" },
  taskOptions: [
    { id: "task-enviar-audio-whatsapp", slug: "enviar-audio-whatsapp", title: "Enviar um áudio", availability: "preparing" as const },
    { id: "task-fazer-chamada-whatsapp", slug: "fazer-chamada-whatsapp", title: "Fazer uma chamada", availability: "preparing" as const },
    { id: "task-bloquear-contato-whatsapp", slug: "bloquear-contato-whatsapp", title: "Bloquear um contato", availability: "preparing" as const },
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

  it("mantém somente Outro/Android e iPhone/iOS na tela inicial", () => {
    render(<TaskGuideSetup {...defaultProps} />);

    expect(screen.getByRole("radio", { name: "Outro" })).toBeInTheDocument();
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

  it("abre as tarefas do aplicativo e atualiza o contexto ao selecionar uma opção", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...whatsappProps} />);

    await user.click(screen.getByRole("button", { name: /selecionar tarefa.*whatsapp/i }));
    expect(screen.getByRole("menu", { name: "Tarefas de WhatsApp" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /Fazer uma chamada/ })).toBeInTheDocument();

    await user.click(screen.getByRole("menuitemradio", { name: /Fazer uma chamada/ }));

    expect(screen.getByRole("button", { name: /selecionar tarefa\. whatsapp: fazer uma chamada/i })).toBeInTheDocument();
    expect(screen.queryByRole("menu", { name: "Tarefas de WhatsApp" })).not.toBeInTheDocument();
  });

  it("oferece retorno explícito para a página de origem", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} returnTo="/?q=boleto" />);

    await user.click(screen.getByRole("button", { name: /voltar para a página anterior/i }));

    expect(push).toHaveBeenCalledWith("/?q=boleto");
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
});
