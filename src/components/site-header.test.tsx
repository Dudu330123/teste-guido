import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./site-header";

describe("cabeçalho e acesso administrativo", () => {
  it("não revela o painel quando o servidor nega acesso", async () => {
    render(await SiteHeader({ showAdmin: false }));

    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
  });

  it("mostra o painel quando o servidor confirma superadmin", async () => {
    render(await SiteHeader({ showAdmin: true }));

    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute("href", "/admin");
  });
});
