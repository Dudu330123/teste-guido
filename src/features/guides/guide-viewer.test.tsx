import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applications } from "@/data/applications";
import { getGuide, getStepsForGuide, tasks } from "@/data/guides";
import { GuideViewer } from "./guide-viewer";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const application = applications[0]!;
const task = tasks[0]!;
const guide = getGuide("android")!;
const steps = getStepsForGuide(guide.id);

describe("visualizador do guia", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
  });

  it("expõe os controles principais e permite avançar e voltar", async () => {
    const user = userEvent.setup();
    const { container } = render(<GuideViewer application={application} guide={guide} steps={steps} task={task} />);
    await screen.findByText("Passo 1 de 6");
    expect(container.querySelector("main")).toHaveClass("guido-home", "internal-page", "guide-page");
    expect(screen.getByRole("progressbar", { name: /progresso/i })).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByRole("button", { name: "Voltar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ouvir instrução" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Trocar celular" })).toHaveAttribute("href", "/tarefas/pagar-boleto");
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
    expect(screen.queryByText("Caixa · Outro")).not.toBeInTheDocument();
    expect(screen.getByText("Trilha do guia")).toBeVisible();
    expect(screen.getByText("Passo 1 de 6")).toBeVisible();
    expect(screen.getByRole("button", { name: "Alternar entre modo claro e escuro" })).toBeVisible();
    expect(screen.getByText("O que fazer agora")).toBeVisible();
    expect(screen.getByText("1")).toHaveClass("guide-step-number");
    expect(screen.getByText("Preciso de ajuda")).toBeVisible();
    expect(screen.queryByText(/Você está no controle/)).not.toBeInTheDocument();
    expect(screen.getByText("Faltam 5 passos. Continue no seu ritmo.")).toBeVisible();

    await user.click(screen.getByText("Preciso de ajuda"));
    expect(screen.getByText("Você não precisa ter pressa.")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Como seguir este passo" })).toBeVisible();
    expect(screen.getByText("Se algo estiver diferente, pare.")).toBeVisible();
    expect(screen.getByRole("dialog", { name: "Preciso de ajuda" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Fechar ajuda" }));
    expect(screen.queryByRole("dialog", { name: "Preciso de ajuda" })).not.toBeInTheDocument();

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

  it("troca o aviso vermelho pela confirmação verde ao concluir", async () => {
    const user = userEvent.setup();
    render(<GuideViewer application={application} guide={guide} steps={steps} task={task} />);
    await screen.findByText("Passo 1 de 6");
    for (let index = 1; index < steps.length; index += 1) {
      await user.click(screen.getByRole("button", { name: "Próximo" }));
    }

    expect(screen.getByRole("alert")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Concluir demonstração" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Demonstração concluída sem realizar qualquer operação bancária.");
    expect(push).toHaveBeenCalledWith("/");
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

  it("encerra um guia parcial em preparação sem fingir conclusão", async () => {
    const user = userEvent.setup();
    render(<GuideViewer application={application} guide={{ ...guide, guideStatus: "partial" }} steps={steps} task={task} />);
    await screen.findByText("Passo 1 de 6");

    for (let index = 1; index < steps.length; index += 1) {
      await user.click(screen.getByRole("button", { name: "Próximo" }));
    }

    expect(screen.getByText(/último passo disponível/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Ver próxima etapa" }));

    expect(screen.getByRole("heading", { name: "Próxima etapa em preparação" })).toBeVisible();
    expect(screen.getByText(/não inventa etapas/i)).toBeVisible();
    expect(screen.getByRole("link", { name: "Voltar aos guias" })).toHaveAttribute("href", "/explorar");
    expect(screen.queryByText(/demonstração concluída/i)).not.toBeInTheDocument();
  });

  it("preserva o banco escolhido no link de sair do guia", () => {
    const bankApplication = applications.find((item) => item.slug === "banco-do-brasil")!;
    render(<GuideViewer application={bankApplication} guide={guide} steps={steps} task={task} />);
    expect(screen.getByRole("link", { name: /Sair do guia/i })).toHaveAttribute(
      "href",
      "/tarefas/pagar-boleto?app=banco-do-brasil",
    );
  });

  it("ativa o estado de leitura ao clicar em ouvir instrução e volta ao normal ao clicar novamente", async () => {
    const user = userEvent.setup();
    const cancelMock = vi.fn();
    const speakMock = vi.fn();

    class MockSpeechSynthesisUtterance {
      text: string;
      lang = "";
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }

    vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);
    vi.stubGlobal("speechSynthesis", {
      cancel: cancelMock,
      speak: speakMock,
    });

    render(<GuideViewer application={application} guide={guide} steps={steps} task={task} />);
    await screen.findByText("Passo 1 de 6");

    const audioButton = screen.getByRole("button", { name: "Ouvir instrução" });
    expect(audioButton).not.toHaveClass("is-speaking");

    // Primeiro clique: inicia fala e fica vermelho (is-speaking)
    await user.click(audioButton);
    expect(speakMock).toHaveBeenCalled();
    expect(audioButton).toHaveClass("is-speaking");
    expect(screen.getByRole("button", { name: "Parar leitura da instrução" })).toBeVisible();
    expect(screen.getByText("Instrução sendo lida em voz alta.")).toHaveClass("sr-only");

    // Segundo clique: interrompe e volta ao normal
    await user.click(audioButton);
    expect(cancelMock).toHaveBeenCalled();
    expect(audioButton).not.toHaveClass("is-speaking");
    expect(screen.getByRole("button", { name: "Ouvir instrução" })).toBeVisible();
    expect(screen.getByText("Leitura interrompida.")).toHaveClass("sr-only");

    vi.unstubAllGlobals();
  });
});
