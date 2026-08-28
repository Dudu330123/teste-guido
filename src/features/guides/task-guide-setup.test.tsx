import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskGuideSetup } from "./task-guide-setup";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
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
  });

  it("mantém as duas opções de celular visíveis e identifica a seleção atual", () => {
    render(<TaskGuideSetup {...defaultProps} />);

    // Ambas as opções devem estar presentes no radiogroup
    expect(screen.getByRole("radio", { name: /samsung/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /iphone/i })).not.toBeChecked();
    expect(screen.queryByRole("combobox", { name: /aplicativo/i })).not.toBeInTheDocument();

    // O botão principal usa aria-label dinâmico com o nome do dispositivo selecionado
    // No novo design o botão diz "Continuar" visualmente e tem aria-label "Continuar com Samsung"
    expect(screen.getByRole("button", { name: /continuar com samsung/i })).toBeEnabled();
  });

  it("identifica o aplicativo escolhido sem alterar o nome da tarefa", () => {
    render(<TaskGuideSetup {...defaultProps} selectedApplicationSlug="itau" />);

    expect(screen.getByText("Itaú")).toBeVisible();
    expect(screen.getByText("Pagar um boleto")).toBeVisible();
  });

  it("desabilita Continuar quando o guia ainda está em preparação", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} canContinue={false} />);

    const continueButton = screen.getByRole("button", { name: /continuar com samsung/i });
    expect(continueButton).toBeDisabled();
    await user.click(continueButton);
    expect(push).not.toHaveBeenCalled();
  });

  it("atualiza a escolha, salva o sistema e abre o guia correto", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} />);

    await user.click(screen.getByRole("radio", { name: /iphone/i }));

    // Após selecionar iPhone, o botão deve refletir a nova seleção
    expect(screen.getByRole("button", { name: /continuar com iphone/i })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /continuar com iphone/i }));

    expect(localStorage.getItem("guido:preferred-os")).toBe("ios");
    expect(push).toHaveBeenCalledWith("/guias/pagar-boleto?os=ios&app=caixa");
  });

  it("permite trocar de celular com as setas do teclado", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} />);

    const samsung = screen.getByRole("radio", { name: /samsung/i });
    const iphone = screen.getByRole("radio", { name: /iphone/i });
    samsung.focus();
    await user.keyboard("{ArrowRight}");

    // A seleção deve trocar para iPhone via navegação por teclado
    expect(iphone).toBeChecked();
    expect(samsung).not.toBeChecked();

    // O botão deve refletir a seleção do iPhone após navegar com teclado
    // (foco no input via rAF não é verificável em jsdom, mas a seleção é)
    expect(screen.getByRole("button", { name: /continuar com iphone/i })).toBeEnabled();
  });
});
