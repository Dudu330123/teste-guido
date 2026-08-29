import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GuidePreviewWorkspace } from "./guide-preview-workspace";

const applications = [{ slug: "caixa", name: "Caixa", category: "Bancos" }];

describe("área de rascunhos locais da prévia", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => window.localStorage.clear());

  it("mostra o exemplo local e permite apagá-lo com confirmação", async () => {
    const user = userEvent.setup();
    render(<GuidePreviewWorkspace applications={applications} />);

    expect(await screen.findByText("Pagar um boleto")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Apagar rascunho: Pagar um boleto" }));

    expect(screen.getByRole("alertdialog", { name: "Confirmar exclusão de Pagar um boleto" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Confirmar apagar rascunho: Pagar um boleto" }));

    expect(screen.queryByText("Pagar um boleto")).not.toBeInTheDocument();
    expect(screen.getByText("Nenhum rascunho local")).toBeVisible();
  });

  it("adiciona à lista o guia validado no formulário", async () => {
    const user = userEvent.setup();
    render(<GuidePreviewWorkspace applications={applications} />);

    await user.type(screen.getByRole("textbox", { name: "Nome do guia" }), "Consultar saldo");
    await user.type(screen.getByRole("textbox", { name: "Descrição" }), "Aprenda a localizar o saldo.");
    await user.type(screen.getByRole("textbox", { name: "Título do passo" }), "Abra o aplicativo");
    await user.type(screen.getByRole("textbox", { name: "Instrução" }), "Toque no aplicativo oficial.");
    await user.type(screen.getByRole("textbox", { name: "Descrição da imagem esperada" }), "Tela demonstrativa segura.");
    await user.click(screen.getByRole("button", { name: "Validar prévia local" }));

    expect(await screen.findByRole("heading", { name: "Consultar saldo", level: 2 })).toBeVisible();
    expect(screen.getByText("Rascunho local")).toBeVisible();
    expect(screen.getByText("1 etapa")).toBeVisible();
  }, 15000);
});
