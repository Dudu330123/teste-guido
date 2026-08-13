import { afterEach, describe, expect, it } from "vitest";
import { getSupabaseConfig } from "@/lib/validation/env";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}

afterEach(() => {
  restoreEnvironment("NEXT_PUBLIC_SUPABASE_URL", originalUrl);
  restoreEnvironment("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", originalPublishableKey);
  restoreEnvironment("NEXT_PUBLIC_SUPABASE_ANON_KEY", originalAnonKey);
});

describe("getSupabaseConfig", () => {
  it("prefere a chave publishable atual", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://guido.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "legacy-anon";

    expect(getSupabaseConfig()).toEqual({
      configured: true,
      url: "https://guido.supabase.co",
      publishableKey: "sb_publishable_test",
    });
  });

  it("mantém compatibilidade temporária com a chave anon antiga", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://guido.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "legacy-anon";

    expect(getSupabaseConfig()).toEqual({
      configured: true,
      url: "https://guido.supabase.co",
      publishableKey: "legacy-anon",
    });
  });

  it("permanece utilizável sem Supabase configurado", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(getSupabaseConfig()).toEqual({
      configured: false,
      message: "A autenticação ainda não foi configurada neste ambiente.",
    });
  });
});
