import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getGuide, getStepsForGuide } from "@/data/guides";
import { ScreenPlaceholder } from "./screen-placeholder";

const guide = getGuide("android")!;
const steps = getStepsForGuide(guide.id);

describe("ilustração do passo", () => {
  it("oferece descrição acessível e alvo textual no primeiro passo", () => {
    render(<ScreenPlaceholder step={steps[0]!} />);
    expect(screen.getByRole("img", { name: steps[0]!.imageAlt })).toBeVisible();
    expect(screen.getAllByText("Banco de demonstração")).toHaveLength(2);
    expect(screen.getByText("Toque aqui ↓")).toBeVisible();
  });

  it("mostra a parada de segurança no último passo", () => {
    render(<ScreenPlaceholder step={steps.at(-1)!} />);
    expect(screen.getByText("Pare antes de confirmar")).toBeVisible();
    expect(screen.getByText("O Guido não realiza pagamentos.")).toBeVisible();
  });
});
