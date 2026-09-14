import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocialAuthButtons } from "./social-auth-buttons";

const mocks = vi.hoisted(() => ({ signInWithOAuth: vi.fn() }));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({ auth: { signInWithOAuth: mocks.signInWithOAuth } }),
}));

describe("entrada social", () => {
  beforeEach(() => mocks.signInWithOAuth.mockResolvedValue({ error: null }));

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
});
