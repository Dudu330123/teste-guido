import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { actions } from "@/data/actions";
import { ActionCard } from "./action-card";

describe("card de ação", () => {
  it.each(actions)("mostra um ícone de apresentação para $taskTitle", (action) => {
    const { container } = render(<ActionCard action={action} taskCount={12} />);

    expect(container.querySelector(`[data-action-icon="${action.slug}"]`)).not.toBeNull();
    expect(screen.getByRole("heading", { name: action.taskTitle })).toBeVisible();
    expect(screen.getByRole("link", { name: "Escolher aplicativo" })).toHaveAttribute(
      "href",
      `/acoes/${action.slug}`,
    );
  });

  it("mantém o ícone decorativo fora da árvore de acessibilidade", () => {
    const { container } = render(<ActionCard action={actions[0]!} taskCount={12} />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("heading", { name: "Fazer Pix" })).toBeVisible();
  });
});
