import { render, screen } from "@testing-library/react";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { applications } from "@/data/applications";
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

  it("recupera o logo local quando o catálogo remoto não informa o caminho", () => {
    render(<ApplicationLogo application={{ ...application, name: "WhatsApp", slug: "whatsapp" }} />);

    expect(screen.getByRole("img", { name: "Logo do WhatsApp" })).toHaveAttribute(
      "src",
      "/images/logos/whatsapp-home.png",
    );
  });

  it("mantém o banco demonstrativo sem logo de terceiro", () => {
    expect(applications.find((item) => item.slug === "banco-demonstracao")?.logoPath).toBeNull();
  });

  it.each([
    "whatsapp",
    "gov-br",
    "caixa",
    "banco-do-brasil",
    "itau",
    "bradesco",
    "santander",
    "nubank",
    "banco-inter",
    "picpay",
    "mercado-pago",
    "c6-bank",
  ]) (
    "aponta o logo local de %s para um arquivo existente",
    (slug) => {
      const application = applications.find((item) => item.slug === slug);
      expect(application?.logoPath).toBeTruthy();
      expect(existsSync(resolve(process.cwd(), "public", application!.logoPath!.slice(1)))).toBe(true);
    },
  );
});
