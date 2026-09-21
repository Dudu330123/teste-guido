import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SocialAuthButtons } from "./social-auth-buttons";

const mocks = vi.hoisted(() => ({ signInWithOAuth: vi.fn() }));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({ auth: { signInWithOAuth: mocks.signInWithOAuth } }),
}));

vi.mock("@/lib/validation/env", () => ({
  getSupabaseConfig: () => ({ configured: true, url: "https://guido.supabase.co", publishableKey: "public-key" }),
}));

describe("entrada social", () => {
  beforeEach(() => {
    mocks.signInWithOAuth.mockReset();
    mocks.signInWithOAuth.mockResolvedValue({ error: null });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ external: { google: true, apple: true } }),
    }));
  });

  afterEach(() => vi.unstubAllGlobals());

  it("inicia o fluxo Google com retorno interno para a conta", async () => {
    const user = userEvent.setup();
    render(<SocialAuthButtons />);
    await user.click(screen.getByRole("button", { name: /continuar com google/i }));
    expect(mocks.signInWithOAuth).toHaveBeenCalledWith(expect.objectContaining({
      provider: "google",
      options: expect.objectContaining({ redirectTo: expect.stringContaining("/auth/callback?next=%2Fconta") }),
    }));
  });

  it("oferece Apple como segunda identidade comum", () => {
    render(<SocialAuthButtons />);
    expect(screen.getByRole("button", { name: /continuar com apple/i })).toBeEnabled();
  });

  it("mantém o usuário no Guido quando o provedor está desativado", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ external: { google: false, apple: false } }),
    }));
    const user = userEvent.setup();
    render(<SocialAuthButtons />);
    await user.click(screen.getByRole("button", { name: /continuar com google/i }));
    expect(await screen.findByText(/google ainda não foi ativado/i)).toBeVisible();
    expect(mocks.signInWithOAuth).not.toHaveBeenCalled();
  });
});
