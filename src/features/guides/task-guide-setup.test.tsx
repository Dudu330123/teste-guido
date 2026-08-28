import { render, screen, within } from "@testing-library/react";
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

  it("retorna do menu com o aparelho escolhido e mantém apenas duas opções", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Trocar celular" }));
    const dialog = screen.getByRole("dialog", { name: "Escolha o seu celular" });
    await user.click(within(dialog).getByRole("radio", { name: "Xiaomi" }));
    await user.click(within(dialog).getByRole("button", { name: "Continuar com Xiaomi" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByRole("radio", { name: "Xiaomi" })).toBeChecked();
    expect(push).not.toHaveBeenCalled();
  });

  it("identifica o aplicativo escolhido sem alterar o nome da tarefa", () => {
    render(<TaskGuideSetup {...defaultProps} selectedApplicationSlug="itau" />);

    expect(screen.getByText("Itaú")).toBeVisible();
    expect(screen.getByText("Pagar um boleto")).toBeVisible();
  });

  it("oferece retorno explícito para a página de origem", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} returnTo="/?q=boleto" />);

    await user.click(screen.getByRole("button", { name: /voltar para a página anterior/i }));

    expect(push).toHaveBeenCalledWith("/?q=boleto");
    expect(back).not.toHaveBeenCalled();
  });

  it("abre o menu de troca e continua com o aparelho escolhido", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Trocar celular" }));
    const dialog = screen.getByRole("dialog", { name: "Escolha o seu celular" });
    expect(dialog).toBeVisible();
    expect(within(dialog).getAllByRole("radio")).toHaveLength(6);
    await user.click(within(dialog).getByRole("radio", { name: "Samsung" }));
    expect(within(dialog).getByRole("radio", { name: "Samsung" })).toBeChecked();

    await user.click(within(dialog).getByRole("radio", { name: "iPhone" }));
    await user.click(within(dialog).getByRole("button", { name: "Continuar com iPhone" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
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

  it("atualiza a escolha pelo menu, salva o sistema e abre o guia correto", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Trocar celular" }));
    const dialog = screen.getByRole("dialog", { name: "Escolha o seu celular" });
    await user.click(within(dialog).getByRole("radio", { name: "iPhone" }));
    await user.click(within(dialog).getByRole("button", { name: "Continuar com iPhone" }));

    // Após escolher iPhone no menu, o botão da tela principal reflete a seleção.
    expect(screen.getByRole("button", { name: /continuar com iphone/i })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /continuar com iphone/i }));

    expect(localStorage.getItem("guido:preferred-os")).toBe("ios");
    expect(push).toHaveBeenCalledWith("/guias/pagar-boleto?os=ios&app=caixa");
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
