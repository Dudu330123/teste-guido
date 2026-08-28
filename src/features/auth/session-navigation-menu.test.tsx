import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionNavigation } from "./session-navigation";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  unsubscribe: vi.fn(),
  signOut: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock("@/lib/validation/env", () => ({
  getSupabaseConfig: () => ({ configured: true }),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { user_metadata: { name: "Maria da Silva" } } } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: mocks.unsubscribe } } })),
      signOut: mocks.signOut,
    },
  }),
}));

describe("menu responsivo da conta", () => {
  beforeEach(() => {
    mocks.push.mockClear();
    mocks.refresh.mockClear();
    mocks.unsubscribe.mockClear();
    mocks.signOut.mockClear();
  });

  it("expõe as ações autorizadas e fecha com Escape devolvendo o foco", async () => {
    const user = userEvent.setup();
    render(<SessionNavigation loginLabel="Entrar" showAdmin showUpload={false} />);

    const trigger = await screen.findByRole("button", { name: "Conta" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = screen.getByLabelText("Opções da conta");
    expect(panel).toBeVisible();
    expect(within(panel).getByRole("link", { name: "Administração" })).toHaveAttribute("href", "/admin");
    expect(within(panel).getByRole("link", { name: "Minha conta" })).toHaveAttribute("href", "/conta");
    expect(within(panel).getByRole("link", { name: "Histórico" })).toHaveAttribute("href", "/historico");

    await user.keyboard("{Escape}");
    expect(screen.queryByLabelText("Opções da conta")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("fecha ao clicar fora", async () => {
    const user = userEvent.setup();
    render(<SessionNavigation showUpload={false} />);

    await user.click(await screen.findByRole("button", { name: "Conta" }));
    expect(screen.getByLabelText("Opções da conta")).toBeVisible();

    await user.click(document.body);
    expect(screen.queryByLabelText("Opções da conta")).not.toBeInTheDocument();
  });
});
