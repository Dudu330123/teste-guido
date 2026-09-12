import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getGuide, getStepsForGuide } from "@/data/guides";
import { getAdminScriptSteps } from "@/data/admin-guide-scripts";
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
        stepsByOperatingSystem: {
          android: getAdminScriptSteps("fazer-pix", "android"),
          ios: getAdminScriptSteps("fazer-pix", "ios"),
        },
      }]}
      bankApplications={[{ slug: "caixa", name: "Caixa" }]}
    />);

    expect(screen.getByText("Publicação imediata")).toBeVisible();
    expect(screen.getByText(/Somente o superadministrador pode enviar ou remover prints/)).toBeVisible();
    expect(screen.getByText("Como preparar e enviar o print")).toBeVisible();
    expect(screen.getByText(/PNG, JPEG ou WebP/)).toBeVisible();
    expect(screen.getByText("Selecione um guia para começar.")).toBeVisible();
    expect(screen.queryByText("Passo 1 de 6")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "1. Guia" }), "pagar-boleto");
    expect(screen.getByText("Selecione o aplicativo para liberar os passos e o upload.")).toBeVisible();

    await user.selectOptions(screen.getByRole("combobox", { name: "2. Aplicativo do banco" }), "caixa");
    expect(screen.getAllByText("Passo 1 de 6")).toHaveLength(1);
    expect(screen.getAllByLabelText("Confirme a segurança para liberar")).toHaveLength(6);
    expect(screen.getByRole("checkbox", { name: /Confirmo que os prints não contêm/ })).not.toBeChecked();
    expect(screen.getAllByLabelText("Confirme a segurança para liberar")[0]).toBeDisabled();

    await user.click(screen.getAllByText("Confirme a segurança para liberar")[0]!);
    expect(screen.getByRole("status")).toHaveTextContent("Marque a confirmação de segurança acima");
    expect(screen.getByRole("checkbox", { name: /Confirmo que os prints não contêm/ })).toHaveFocus();

    await user.click(screen.getByRole("checkbox", { name: /Confirmo que os prints não contêm/ }));
    expect(screen.getAllByLabelText("Fazer upload do print")[0]).toBeEnabled();

    await user.click(screen.getByRole("radio", { name: "iPhone" }));
    expect(screen.getByRole("radio", { name: "iPhone" })).toBeChecked();
    expect(screen.getAllByLabelText("Confirme a segurança para liberar")).toHaveLength(6);

    await user.selectOptions(screen.getByRole("combobox", { name: "1. Guia" }), "fazer-pix");
    await user.selectOptions(screen.getByRole("combobox", { name: "2. Aplicativo do banco" }), "caixa");
    expect(screen.getByText("Confira e pare antes de confirmar")).toBeVisible();
    expect(screen.getAllByLabelText("Confirme a segurança para liberar")).toHaveLength(6);
  });

  it("mantém a remoção disponível somente na visualização do superadmin", async () => {
    const firstStep = getStepsForGuide(androidGuide.id)[0]!;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{
          id: "image-1",
          stepId: firstStep.id,
          mimeType: "image/png",
          byteSize: 1024,
          width: 1080,
          height: 1920,
          updatedAt: "2026-08-20T00:00:00.000Z",
          previewUrl: "https://example.com/print.png",
        }],
      }),
    }));
    const user = userEvent.setup();
    render(<GuideAdmin
      canDelete
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

    await user.selectOptions(screen.getByRole("combobox", { name: "1. Guia" }), "pagar-boleto");
    await user.selectOptions(screen.getByRole("combobox", { name: "2. Aplicativo do banco" }), "caixa");

    expect(await screen.findByRole("button", { name: "Remover print" })).toBeVisible();
  });

  it("não oferece remoção na área de envio de uma conta comum", async () => {
    const firstStep = getStepsForGuide(androidGuide.id)[0]!;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{
          id: "image-1",
          stepId: firstStep.id,
          mimeType: "image/png",
          byteSize: 1024,
          width: 1080,
          height: 1920,
          updatedAt: "2026-08-20T00:00:00.000Z",
          previewUrl: "https://example.com/print.png",
        }],
      }),
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
      }]}
      bankApplications={[{ slug: "caixa", name: "Caixa" }]}
    />);

    await user.selectOptions(screen.getByRole("combobox", { name: "1. Guia" }), "pagar-boleto");
    await user.selectOptions(screen.getByRole("combobox", { name: "2. Aplicativo do banco" }), "caixa");

    expect(await screen.findByText("1080 × 1920 · 0,00 MB")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Remover print" })).not.toBeInTheDocument();
  });
});
