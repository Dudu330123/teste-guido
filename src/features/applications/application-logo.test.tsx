import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Application } from "@/types/content";
import { ApplicationLogo } from "./application-logo";

const application: Application = {
  id: "app-teste",
  name: "Banco Teste",
  slug: "banco-teste",
  description: "Conta de teste",
  category: "Serviços financeiros",
  logoPath: null,
  searchTerms: [],
  status: "preparing",
  createdAt: "",
  updatedAt: "",
};

describe("logo do aplicativo", () => {
  it("usa o logo cadastrado quando existe", () => {
    render(<ApplicationLogo application={{ ...application, logoPath: "/logos/banco-teste.svg" }} />);

    expect(screen.getByRole("img", { name: "Logo do Banco Teste" })).toHaveAttribute("src", "/logos/banco-teste.svg");
  });

  it("mantém as iniciais quando o aplicativo não possui logo", () => {
    render(<ApplicationLogo application={application} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("BA")).toBeVisible();
  });
});
