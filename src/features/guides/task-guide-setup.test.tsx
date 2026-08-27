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

    expect(screen.getByRole("radio", { name: /samsung/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /iphone/i })).not.toBeChecked();
    expect(screen.getByText("Samsung selecionado")).toBeVisible();
    expect(screen.getByRole("button", { name: "Abrir guia para Samsung" })).toBeEnabled();
  });

  it("atualiza a escolha, salva o sistema e abre o guia correto", async () => {
    const user = userEvent.setup();
    render(<TaskGuideSetup {...defaultProps} />);

    await user.click(screen.getByRole("radio", { name: /iphone/i }));

    expect(screen.getByText("iPhone selecionado")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Abrir guia para iPhone" }));

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

    expect(iphone).toBeChecked();
    expect(iphone).toHaveFocus();
    expect(screen.getByRole("button", { name: "Abrir guia para iPhone" })).toBeEnabled();
  });
});
