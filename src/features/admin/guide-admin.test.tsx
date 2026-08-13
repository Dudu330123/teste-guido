import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { getGuide, getStepsForGuide } from "@/data/guides";
import { GuideAdmin } from "./guide-admin";

const androidGuide = getGuide("android")!;
const iosGuide = getGuide("ios")!;

describe("administração local dos prints", () => {
  it("exige guia e aplicativo antes de mostrar os passos", async () => {
    const user = userEvent.setup();
    render(<GuideAdmin
      guides={[{
        slug: "pagar-boleto",
        title: "Pagar um boleto",
        category: "bank",
        stepsByOperatingSystem: {
          android: getStepsForGuide(androidGuide.id),
          ios: getStepsForGuide(iosGuide.id),
        },
      }]}
      bankApplications={[{ slug: "caixa", name: "Caixa" }]}
    />);

    expect(screen.getByText("Protótipo administrativo sem login")).toBeVisible();
    expect(screen.getByText("Selecione um guia para começar.")).toBeVisible();
    expect(screen.queryByText("Passo 1 de 6")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "1. Guia" }), "pagar-boleto");
    expect(screen.getByText("Selecione o aplicativo para liberar os passos e o upload.")).toBeVisible();

    await user.selectOptions(screen.getByRole("combobox", { name: "2. Aplicativo do banco" }), "caixa");
    expect(screen.getAllByText("Passo 1 de 6")).toHaveLength(1);
    expect(screen.getAllByText("Escolher print")).toHaveLength(6);

    await user.click(screen.getByRole("radio", { name: "iPhone" }));
    expect(screen.getByRole("radio", { name: "iPhone" })).toBeChecked();
    expect(screen.getAllByText("Escolher print")).toHaveLength(6);
  });
});
