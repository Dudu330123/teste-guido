import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getGuide, getStepsForGuide } from "@/data/guides";
import { GuideAdmin } from "./guide-admin";

const androidGuide = getGuide("android")!;
const iosGuide = getGuide("ios")!;

describe("administração compartilhada dos prints", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("exige guia e aplicativo antes de mostrar os passos", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    }));
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
      }, {
        slug: "fazer-pix",
        title: "Fazer Pix",
        category: "bank",
        stepsByOperatingSystem: { android: [], ios: [] },
      }]}
      bankApplications={[{ slug: "caixa", name: "Caixa" }]}
    />);

    expect(screen.getByText("Publicação imediata")).toBeVisible();
    expect(screen.getByText("Selecione um guia para começar.")).toBeVisible();
    expect(screen.queryByText("Passo 1 de 6")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "1. Guia" }), "pagar-boleto");
    expect(screen.getByText("Selecione o aplicativo para liberar os passos e o upload.")).toBeVisible();

    await user.selectOptions(screen.getByRole("combobox", { name: "2. Aplicativo do banco" }), "caixa");
    expect(screen.getAllByText("Passo 1 de 6")).toHaveLength(1);
    expect(screen.getAllByText("Escolher print")).toHaveLength(6);
    expect(screen.getByRole("checkbox", { name: /Confirmo que os prints não contêm/ })).not.toBeChecked();
    expect(screen.getAllByLabelText("Escolher print")[0]).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: /Confirmo que os prints não contêm/ }));
    expect(screen.getAllByLabelText("Escolher print")[0]).toBeEnabled();

    await user.click(screen.getByRole("radio", { name: "iPhone" }));
    expect(screen.getByRole("radio", { name: "iPhone" })).toBeChecked();
    expect(screen.getAllByText("Escolher print")).toHaveLength(6);

    await user.selectOptions(screen.getByRole("combobox", { name: "1. Guia" }), "fazer-pix");
    await user.selectOptions(screen.getByRole("combobox", { name: "2. Aplicativo do banco" }), "caixa");
    expect(screen.getByText("Passos ainda não cadastrados")).toBeVisible();
    expect(screen.queryByText("Escolher print")).not.toBeInTheDocument();
  });
});
