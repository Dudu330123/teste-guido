import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OsSelector } from "./os-selector";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("seletor de celular", () => {
  beforeEach(() => { localStorage.clear(); push.mockClear(); });

  it("oferece controles nomeados e confirma a escolha do iPhone", async () => {
    const user = userEvent.setup();
    const { container } = render(<OsSelector taskSlug="pagar-boleto" />);
    const android = screen.getByRole("radio", { name: /android/i });
    const ios = screen.getByRole("radio", { name: /iphone/i });
    expect(android).toBeChecked();
    expect(container.querySelectorAll("img")).toHaveLength(2);
    await user.click(ios);
    expect(ios).toBeChecked();
    await user.click(screen.getByRole("button", { name: /próximo/i }));
    expect(localStorage.getItem("guido:preferred-os")).toBe("ios");
    expect(push).toHaveBeenCalledWith("/guias/pagar-boleto?os=ios");
  });

  it("mantém o aplicativo escolhido na abertura do guia", async () => {
    const user = userEvent.setup();
    render(<OsSelector taskSlug="pagar-boleto" applicationOptions={[
      { slug: "caixa", name: "Caixa" },
      { slug: "nubank", name: "Nubank" },
    ]} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Qual aplicativo você usa?" }), "nubank");
    await user.click(screen.getByRole("button", { name: /próximo/i }));
    expect(push).toHaveBeenCalledWith("/guias/pagar-boleto?os=android&app=nubank");
  });

  it("permite mudar de celular pelo teclado com foco visível no card", async () => {
    const user = userEvent.setup();
    render(<OsSelector taskSlug="pagar-boleto" />);
    const android = screen.getByRole("radio", { name: /android/i });
    const ios = screen.getByRole("radio", { name: /iphone/i });

    await user.tab();
    expect(android).toHaveFocus();
    expect(android.closest("label")).toHaveClass("focus-within:outline");
    await user.keyboard("[ArrowUp]");
    expect(ios).toHaveFocus();
    expect(ios).toBeChecked();
  });
});
