import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { getGuide, getStepsForGuide } from "@/data/guides";
import { GuideAdmin } from "./guide-admin";

const androidGuide = getGuide("android")!;

describe("administração local dos prints", () => {
  it("mostra a orientação local e exige guia/aplicativo antes dos passos", async () => {
    const user = userEvent.setup();
    render(<GuideAdmin
      guides={[{
        slug: "pagar-boleto",
        title: "Pagar um boleto",
        category: "bank",
        stepsByOperatingSystem: { android: getStepsForGuide(androidGuide.id), ios: [] },
      }]}
      bankApplications={[{ slug: "caixa", name: "Caixa" }]}
    />);

    expect(screen.getByText("Imagens versionadas no site")).toBeVisible();
    expect(screen.getByText("Selecione um guia para começar.")).toBeVisible();
    await user.selectOptions(screen.getByRole("combobox", { name: "1. Guia" }), "pagar-boleto");
    expect(screen.getByText("Selecione o aplicativo para liberar os passos.")).toBeVisible();
    await user.selectOptions(screen.getByRole("combobox", { name: "2. Aplicativo do banco" }), "caixa");
    expect(screen.getByText("Passo 1 de 6")).toBeVisible();
    expect(screen.queryByRole("button", { name: /upload/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
