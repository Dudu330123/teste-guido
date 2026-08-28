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
    render(<OsSelector taskSlug="pagar-boleto" />);
    const other = screen.getByRole("radio", { name: /outro/i });
    const ios = screen.getByRole("radio", { name: /iphone/i });
    expect(other).toBeChecked();
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

  it("preserva o banco escolhido ao reutilizar um roteiro genérico", async () => {
    const user = userEvent.setup();
    render(<OsSelector taskSlug="fazer-pix" initialApplicationSlug="caixa" />);

    await user.click(screen.getByRole("button", { name: /próximo/i }));

    expect(push).toHaveBeenCalledWith("/guias/fazer-pix?os=android&app=caixa");
  });

  it("leva o contexto de retorno até o guia", async () => {
    const user = userEvent.setup();
    render(<OsSelector taskSlug="pix-nubank" returnTo="/explorar?q=Pix" />);

    await user.click(screen.getByRole("button", { name: /próximo/i }));

    expect(push).toHaveBeenCalledWith("/guias/pix-nubank?os=android&returnTo=%2Fexplorar%3Fq%3DPix");
  });
});
