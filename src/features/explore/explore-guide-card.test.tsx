import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { actions } from "@/data/actions";
import type { Application, Task } from "@/types/content";
import { ExploreGuideCard } from "./explore-guide-card";

const application: Application = {
  id: "app-banco",
  name: "Banco Teste",
  slug: "banco-teste",
  description: "Conta de teste",
  category: "Serviços financeiros",
  logoPath: null,
  searchTerms: ["pix"],
  status: "available",
  createdAt: "",
  updatedAt: "",
};

const task: Task = {
  id: "task-fazer-pix-banco",
  applicationId: application.id,
  actionId: "pix",
  title: "Fazer Pix",
  slug: "fazer-pix-banco",
  description: "Entenda onde fica a área Pix.",
  difficulty: "easy",
  safetyWarning: "Demonstração sem operação real.",
  searchTerms: ["pix"],
  availability: "preparing",
  status: "draft",
};

const item = {
  application,
  task,
  action: actions.find((action) => action.id === "pix")!,
};

describe("ExploreGuideCard", () => {
  it("renderiza o card padrão com status e destino do item", () => {
    render(<ExploreGuideCard item={item} />);

    expect(screen.getByRole("link", { name: /fazer pix/i })).toHaveAttribute("href", "/acoes/pix");
    expect(screen.getByText("Escolha o aplicativo")).toBeVisible();
  });

  it("aplica a variante destacada sem criar um segundo link", () => {
    render(<ExploreGuideCard item={item} variant="featured" />);

    expect(screen.getByRole("link")).toHaveClass("explore-guide-card--featured");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it.each([
    ["demo", "Demonstração disponível", "is-demo"],
    ["available", "Guia disponível", "is-available"],
    ["preparing", "Guia em preparação", "is-preparing"],
  ] as const)("comunica o estado %s com texto e classe", (availability, label, statusClass) => {
    const statusItem = {
      application,
      task: { ...task, actionId: undefined, availability },
    };

    render(<ExploreGuideCard item={statusItem} />);

    expect(screen.getByText(label)).toHaveClass(statusClass);
  });
});
