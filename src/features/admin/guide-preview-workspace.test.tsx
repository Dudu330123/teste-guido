import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GuidePreviewWorkspace } from "./guide-preview-workspace";

const applications = [{ slug: "caixa", name: "Caixa", category: "Bancos" }];

describe("área de rascunhos locais da prévia", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => window.localStorage.clear());

  it("mostra o exemplo local e permite apagá-lo com confirmação", async () => {
    const user = userEvent.setup();
    render(<GuidePreviewWorkspace applications={applications} />);

    await user.click(screen.getByRole("tab", { name: /Fila de prints/ }));
    expect(await screen.findByText("Pagar um boleto")).toBeVisible();
    const deleteButton = screen.getByRole("button", { name: "Apagar rascunho: Pagar um boleto" });
    await user.click(deleteButton);

    const dialog = screen.getByRole("dialog", { name: "Apagar este rascunho?" });
    expect(dialog).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Apagar este rascunho?" })).not.toBeInTheDocument());
    expect(deleteButton).toHaveFocus();

    await user.click(deleteButton);
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
    await user.click(screen.getByRole("button", { name: "Validar e criar rascunho local" }));

    expect(await screen.findByRole("button", { name: "Continuar para adicionar prints" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Revisar roteiro" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Continuar para adicionar prints" }));
    expect(await screen.findByRole("heading", { name: "Fila de prints", level: 2 })).toHaveFocus();
    expect(screen.getByText("Rascunho local")).toBeVisible();
    expect(screen.getByText("1 etapa")).toBeVisible();
    await user.click(screen.getByRole("tab", { name: /Revisar/ }));
    expect(await screen.findByRole("heading", { name: "Revisar roteiro", level: 2 })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Consultar saldo", level: 3 })).toBeVisible();
  }, 15000);

  it("permite atualizar várias etapas da fila com confirmação", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<GuidePreviewWorkspace applications={applications} />);

    await user.click(screen.getByRole("tab", { name: /Fila de prints/ }));
    await screen.findByText("Pagar um boleto");
    await user.click(screen.getByRole("button", { name: "Abrir roteiro: Pagar um boleto" }));
    await user.click(screen.getByRole("checkbox", { name: /Selecionar etapa 1:/ }));
    await user.click(screen.getByRole("checkbox", { name: /Selecionar etapa 2:/ }));
    await user.click(screen.getByRole("button", { name: "Marcar selecionadas como recebidas" }));

    expect(confirm).toHaveBeenCalledWith(expect.stringContaining("marcar as etapas selecionadas como recebidas"));
    expect(within(screen.getByRole("tabpanel", { name: "Fila de prints" })).getAllByText("Imagem recebida", { exact: true })).toHaveLength(2);
    expect(screen.getByText("0 selecionadas")).toBeVisible();
  });
});
