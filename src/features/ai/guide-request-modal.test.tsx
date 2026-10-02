import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GuideRequestModal } from "./guide-request-modal";

describe("GuideRequestModal", () => {
  it("mostra apenas o pedido curto, sem login", () => {
    render(<GuideRequestModal isOpen onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Pedir um guia" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "O que você quer aprender?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Criar guia/ })).toBeDisabled();
    expect(screen.queryByText(/Google|Apple|conta|login/i)).not.toBeInTheDocument();
  });

  it("habilita a criação quando o usuário descreve o que quer aprender", async () => {
    const user = userEvent.setup();
    render(<GuideRequestModal isOpen onClose={vi.fn()} />);

    await user.type(screen.getByRole("textbox", { name: "O que você quer aprender?" }), "Enviar uma foto");

    expect(screen.getByRole("button", { name: /Criar guia/ })).toBeEnabled();
  });
});
