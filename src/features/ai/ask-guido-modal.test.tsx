import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AskGuidoModal, AVATAR_OPTIONS } from "./ask-guido-modal";

describe("AskGuidoModal - Personalização de Voz e Avatar", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal(
      "speechSynthesis",
      {
        getVoices: vi.fn().mockReturnValue([
          { name: "Microsoft Francisca Online (Natural) - Portuguese (Brazil)", lang: "pt-BR" },
          { name: "Microsoft Antonio Online (Natural) - Portuguese (Brazil)", lang: "pt-BR" },
          { name: "Google português do Brasil", lang: "pt-BR" },
        ]),
        cancel: vi.fn(),
        speak: vi.fn(),
        onvoiceschanged: null,
      }
    );
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renderiza o modal com o cabeçalho e botão de engrenagem para personalização", () => {
    render(<AskGuidoModal isOpen onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: /falar com o guido/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Personalizar voz e avatar" })).toBeInTheDocument();
    expect(screen.getByText("No que você está tendo dificuldade hoje?")).toBeInTheDocument();
  });

  it("ao clicar na engrenagem, abre o menu de tela cheia com avatares e 3 vozes humanas", async () => {
    const user = userEvent.setup();
    render(<AskGuidoModal isOpen onClose={vi.fn()} />);

    // Clica na engrenagem
    await user.click(screen.getByRole("button", { name: "Personalizar voz e avatar" }));

    // Menu de tela cheia aberto
    expect(screen.getByRole("dialog", { name: "Personalizar Voz e Avatar" })).toBeInTheDocument();
    expect(screen.getByText("Escolha o Avatar")).toBeInTheDocument();
    expect(screen.getByText("Escolha a Voz (3 Vozes Humanas)")).toBeInTheDocument();

    // Verifica que as 3 vozes estão presentes
    expect(screen.getByText("Guido")).toBeInTheDocument();
    expect(screen.getByText("Helena")).toBeInTheDocument();
    expect(screen.getByText("Lucas")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /ouvir demonstração/i })).toHaveLength(3);

    // Verifica avatares
    for (const av of AVATAR_OPTIONS) {
      expect(screen.getByRole("button", { name: new RegExp(av.name, "i") })).toBeInTheDocument();
    }

    // Garante que o texto técnico antigo da ElevenLabs/Gemini foi completamente removido
    expect(screen.queryByText(/Configuração de Voz de Estúdio/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ElevenLabs & IA/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Chave ElevenLabs/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/elevenlabs\.io/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Microsoft Daniel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Chave Gemini opcional/i)).not.toBeInTheDocument();
  });

  it("permite selecionar um avatar e salva a preferência no localStorage", async () => {
    const user = userEvent.setup();
    render(<AskGuidoModal isOpen onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Personalizar voz e avatar" }));

    const vovoButton = screen.getByRole("button", { name: /Vovô Guido/i });
    await user.click(vovoButton);

    expect(window.localStorage.getItem("guido-avatar-id")).toBe("vovo-guido");

    // Fecha o menu pelo botão de confirmação
    await user.click(screen.getByRole("button", { name: "Confirmar e Voltar" }));
    expect(screen.queryByRole("dialog", { name: "Personalizar Voz e Avatar" })).not.toBeInTheDocument();

    // Avatar do cabeçalho atualizado
    expect(screen.getByTitle("Avatar: Vovô Guido")).toBeInTheDocument();
  });

  it("permite selecionar uma voz e salva a preferência no localStorage", async () => {
    const user = userEvent.setup();
    render(<AskGuidoModal isOpen onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Personalizar voz e avatar" }));

    // Clica no card da voz da Helena
    await user.click(screen.getByText("Helena"));
    expect(window.localStorage.getItem("guido-voice-id")).toBe("helena");

    // Clica no botão Voltar
    await user.click(screen.getByRole("button", { name: "Voltar para falar com o Guido" }));
    expect(screen.queryByRole("dialog", { name: "Personalizar Voz e Avatar" })).not.toBeInTheDocument();
  });
});
