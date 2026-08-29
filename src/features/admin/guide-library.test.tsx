import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createGuidePreviewDraft, type GuidePreviewDraft } from "./guide-preview-draft";
import { GuideLibrary } from "./guide-library";

const applications = [
  { id: "app-caixa", slug: "caixa", name: "Caixa" },
  { id: "app-whatsapp", slug: "whatsapp", name: "WhatsApp" },
];

function makeDraft(overrides: Partial<GuidePreviewDraft> = {}): GuidePreviewDraft {
  const draft = createGuidePreviewDraft({
    guide: {
      applicationSlug: "caixa",
      title: "Pagar um boleto",
      slug: "pagar-boleto",
      description: "Reconheça as etapas sem confirmar o pagamento.",
      difficulty: "medium",
      safetyWarning: "Não informe sua senha.",
      appVersion: "genérica",
      guideVersion: "0.1",
      estimatedMinutes: 5,
      searchTerms: ["boleto", "pagamento"],
      steps: [{
        title: "Abra o aplicativo",
        instruction: "Toque no aplicativo oficial.",
        imageAlt: "Tela inicial demonstrativa.",
        warning: "",
        confirmationMessage: "",
      }],
    },
    applicationId: "app-caixa",
    applicationName: "Caixa",
    applicationCategory: "Serviços financeiros",
    updatedAt: "2026-08-28T12:00:00.000Z",
  });
  return { ...draft, ...overrides };
}

function completeDraft(overrides: Partial<GuidePreviewDraft> = {}) {
  const draft = makeDraft(overrides);
  const steps = draft.steps.map((step) => ({ ...step, imageStatus: "validated" as const }));
  return { ...draft, steps, reviewStatus: "ready-for-human-review" as const };
}

function renderLibrary(guides: GuidePreviewDraft[]) {
  return render(
    <GuideLibrary
      guides={guides}
      applications={applications}
      selectedId={null}
      pendingDeleteId={null}
      onSelect={vi.fn()}
      onRequestDelete={vi.fn()}
      onConfirmDelete={vi.fn()}
      onCancelDelete={vi.fn()}
    />,
  );
}

describe("biblioteca local de guias", () => {
  it("filtra por completude, aplicativo e termos de busca", async () => {
    const user = userEvent.setup();
    const complete = completeDraft();
    const whatsapp = completeDraft({
      id: "task-whatsapp-recuperar-conta",
      taskId: "task-whatsapp-recuperar-conta",
      guideId: "guide-task-whatsapp-recuperar-conta-0-1",
      applicationId: "app-whatsapp",
      applicationSlug: "whatsapp",
      applicationName: "WhatsApp",
      title: "Recuperar a conta",
      slug: "recuperar-conta",
      searchTerms: ["código", "conta"],
    });
    const incomplete = makeDraft({
      id: "task-caixa-consultar-saldo",
      taskId: "task-caixa-consultar-saldo",
      guideId: "guide-task-caixa-consultar-saldo-0-1",
      title: "Consultar saldo",
      slug: "consultar-saldo",
      searchTerms: ["saldo"],
    });
    renderLibrary([complete, whatsapp, incomplete]);

    expect(screen.getByRole("heading", { name: "Pagar um boleto", level: 3 })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Recuperar a conta", level: 3 })).toBeVisible();

    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "complete");
    expect(screen.getByRole("heading", { name: "Pagar um boleto", level: 3 })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Consultar saldo", level: 3 })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filtrar por aplicativo"), "app-whatsapp");
    expect(screen.getByRole("heading", { name: "Recuperar a conta", level: 3 })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Pagar um boleto", level: 3 })).not.toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox", { name: "Pesquisar tarefa" }));
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar tarefa" }), "código");
    expect(screen.getByRole("heading", { name: "Recuperar a conta", level: 3 })).toBeVisible();
  });

  it("oferece limpar filtros quando não há resultado", async () => {
    const user = userEvent.setup();
    renderLibrary([completeDraft()]);

    await user.type(screen.getByRole("searchbox", { name: "Pesquisar tarefa" }), "não existe");
    expect(screen.getByText("Nenhuma tarefa encontrada")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(screen.getByRole("heading", { name: "Pagar um boleto", level: 3 })).toBeVisible();
    expect(screen.getByRole("searchbox", { name: "Pesquisar tarefa" })).toHaveValue("");
  });

  it("mantém as ações do card como controles separados", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onRequestDelete = vi.fn();
    const draft = completeDraft();
    render(
      <GuideLibrary
        guides={[draft]}
        applications={applications}
        selectedId={null}
        pendingDeleteId={null}
        onSelect={onSelect}
        onRequestDelete={onRequestDelete}
        onConfirmDelete={vi.fn()}
        onCancelDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Abrir roteiro: Pagar um boleto" }));
    await user.click(screen.getByRole("button", { name: "Apagar rascunho: Pagar um boleto" }));

    expect(onSelect).toHaveBeenCalledWith(draft);
    expect(onRequestDelete).toHaveBeenCalledWith(draft);
  });

  it("explica quando a biblioteca ainda não tem rascunhos", () => {
    renderLibrary([]);

    expect(screen.getByRole("status")).toHaveTextContent("Nenhum rascunho local");
  });
});
