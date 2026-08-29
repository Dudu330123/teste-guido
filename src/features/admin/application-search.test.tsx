import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApplicationSearch, type ApplicationSearchOption } from "./application-search";

const applications: ApplicationSearchOption[] = [
  { id: "1", slug: "caixa", name: "Caixa", category: "Bancos", description: "Serviços bancários." },
  { id: "2", slug: "whatsapp", name: "WhatsApp", category: "Comunicação", description: "Mensagens." },
  { id: "3", slug: "gov-br", name: "Gov.br", category: "Serviços públicos", description: "Serviços do governo." },
];

describe("busca de aplicativos do editor", () => {
  it("filtra por nome e seleciona por teclado", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<ApplicationSearch applications={applications} value="" onSelect={onSelect} />);

    const input = screen.getByRole("combobox", { name: "Pesquisar aplicativo" });
    await user.type(input, "caixa");
    expect(screen.getByRole("option", { name: /Caixa/ })).toBeVisible();
    expect(screen.queryByRole("option", { name: /WhatsApp/ })).not.toBeInTheDocument();

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith(applications[0]);
  });

  it("filtra pelo slug, mostra estado vazio e permite limpar a busca", async () => {
    const user = userEvent.setup();
    render(<ApplicationSearch applications={applications} value="" onSelect={vi.fn()} />);

    const input = screen.getByRole("combobox", { name: "Pesquisar aplicativo" });
    await user.type(input, "gov-br");
    expect(screen.getByRole("option", { name: /Gov\.br/ })).toBeVisible();
    await user.clear(input);
    await user.type(input, "inexistente");
    expect(screen.getByRole("status", { name: "" })).toHaveTextContent("Nenhum aplicativo encontrado");
  });
});

