import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GuidoVoiceModal } from "./guido-voice-modal";

describe("GuidoVoiceModal", () => {
  it("mostra que o assistente de voz ainda está em desenvolvimento", () => {
    render(<GuidoVoiceModal isOpen onClose={vi.fn()} onUseText={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Falar com o Guido" })).toBeInTheDocument();
    expect(screen.getByText("Em desenvolvimento")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ouvir novamente" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Continuar com Google|Apple/i)).not.toBeInTheDocument();
  });
});
