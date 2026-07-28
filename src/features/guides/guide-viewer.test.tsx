import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { applications } from "@/data/applications";
import { getGuide, getStepsForGuide, tasks } from "@/data/guides";
import { GuideViewer } from "./guide-viewer";

const application = applications[0]!;
const task = tasks[0]!;
const guide = getGuide("android")!;
const steps = getStepsForGuide(guide.id);

describe("visualizador do guia", () => {
  beforeEach(() => localStorage.clear());

  it("expõe os controles principais e permite avançar e voltar", async () => {
    const user = userEvent.setup();
    render(<GuideViewer application={application} guide={guide} steps={steps} task={task} />);
    await screen.findByText("Passo 1 de 6");
    expect(screen.getByRole("progressbar", { name: /progresso/i })).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByRole("button", { name: "Voltar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ouvir instrução" })).toBeEnabled();
    expect(screen.getByText("Preciso de ajuda")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(screen.getByText("Passo 2 de 6")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByText("Passo 1 de 6")).toBeVisible();
  });

  it("renderiza o aviso financeiro no último passo", async () => {
    const user = userEvent.setup();
    render(<GuideViewer application={application} guide={guide} steps={steps} task={task} />);
    await screen.findByText("Passo 1 de 6");
    for (let index = 1; index < steps.length; index += 1) {
      await user.click(screen.getByRole("button", { name: "Próximo" }));
    }
    expect(screen.getByRole("alert")).toHaveTextContent("O Guido nunca pede sua senha e nunca confirma pagamentos por você.");
    expect(screen.getByRole("button", { name: "Concluir demonstração" })).toBeVisible();
  });

  it("recupera um progresso e oferece continuar ou reiniciar", async () => {
    localStorage.setItem(`guido:progress:${guide.id}`, JSON.stringify({
      guideId: guide.id, currentStep: 3, status: "in_progress", lastAccessedAt: new Date().toISOString(),
      guideVersion: guide.guideVersion, operatingSystem: "android",
    }));
    const user = userEvent.setup();
    render(<GuideViewer application={application} guide={guide} steps={steps} task={task} />);
    expect(await screen.findByText("Você parou no passo 4 de 6. Deseja continuar?")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Passo 4 de 6")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Começar novamente" }));
    await waitFor(() => expect(screen.getByText("Passo 1 de 6")).toBeVisible());
  });
});
