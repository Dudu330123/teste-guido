import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExplorePage from "./page";

vi.mock("@/features/theme/home-toolbar", () => ({
  HomeToolbar: () => <header aria-label="Navegação" />,
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSuperadminAccess: vi.fn().mockResolvedValue(false),
}));

vi.mock("@/lib/catalog", async () => {
  const actual = await vi.importActual<typeof import("@/lib/catalog")>("@/lib/catalog");
  return {
    ...actual,
    getCatalogFromSupabase: vi.fn().mockResolvedValue(null),
    getGuidePopularityFromSupabase: vi.fn().mockResolvedValue(new Map()),
  };
});

describe("página Explorar", () => {
  it("preserva a busca e oferece limpeza quando há filtros ativos", async () => {
    render(await ExplorePage({ searchParams: Promise.resolve({ q: "gov", categoria: "" }) }));

    expect(screen.getByRole("searchbox")).toHaveValue("gov");
    expect(screen.getByRole("link", { name: "Limpar pesquisa e filtros" })).toHaveAttribute("href", "/explorar");
  });

  it("mantém a busca sem link de limpeza no estado inicial", async () => {
    render(await ExplorePage({ searchParams: Promise.resolve({ q: "", categoria: "" }) }));

    expect(screen.queryByRole("link", { name: "Limpar pesquisa e filtros" })).not.toBeInTheDocument();
  });
});
