import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { actions } from "@/data/actions";
import BanksPage from "./page";

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <header />,
}));

describe("página de bancos", () => {
  it("apresenta as ações financeiras cadastradas com seus destinos gerais", () => {
    render(<BanksPage />);

    expect(screen.getByRole("heading", { name: "Escolha o que você quer fazer." })).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Escolher aplicativo" })).toHaveLength(actions.length);
    expect(screen.getByRole("heading", { name: "Fazer Pix" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Pagar boleto" })).toBeVisible();

    const pixCard = screen.getByRole("heading", { name: "Fazer Pix" }).closest("article");
    const boletoCard = screen.getByRole("heading", { name: "Pagar boleto" }).closest("article");
    expect(pixCard).not.toBeNull();
    expect(boletoCard).not.toBeNull();
    expect(within(pixCard!).getByRole("link")).toHaveAttribute("href", "/acoes/pix");
    expect(within(boletoCard!).getByRole("link")).toHaveAttribute("href", "/acoes/boleto");
  });
});
