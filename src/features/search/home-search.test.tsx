import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { HomeSearch } from "./home-search";

describe("busca da página inicial", () => {
  it("encontra uma tarefa em preparação por sugestão rápida", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: "enviar áudio" }));

    expect(screen.getByRole("heading", { name: "Resultados para “enviar áudio”" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Enviar um áudio — em preparação/i })).toHaveAttribute("href", "/aplicativos/whatsapp");
  });

  it("encontra o guia demonstrativo por um erro comum", async () => {
    const user = userEvent.setup();
    render(<HomeSearch applications={applications} tasks={tasks} />);

    await user.type(screen.getByRole("searchbox", { name: "Pesquisar ajuda" }), "boletu");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));

    expect(screen.getByRole("link", { name: /Pagar um boleto — demonstração não validada/i })).toHaveAttribute("href", "/tarefas/pagar-boleto");
  });
});
