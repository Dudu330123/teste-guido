import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { getGuide, getStepsForGuide } from "@/data/guides";
import { GuideAdmin } from "./guide-admin";

const androidGuide = getGuide("android")!;
const iosGuide = getGuide("ios")!;

describe("administração local dos prints", () => {
  it("mostra os passos e permite alternar a versão do celular", async () => {
    const user = userEvent.setup();
    render(<GuideAdmin stepsByOperatingSystem={{
      android: getStepsForGuide(androidGuide.id),
      ios: getStepsForGuide(iosGuide.id),
    }} />);

    expect(screen.getByText("Protótipo administrativo sem login")).toBeVisible();
    expect(screen.getAllByText("Passo 1 de 6")).toHaveLength(1);
    expect(screen.getAllByText("Escolher print")).toHaveLength(6);

    await user.click(screen.getByRole("radio", { name: "iPhone" }));
    expect(screen.getByRole("radio", { name: "iPhone" })).toBeChecked();
    expect(screen.getAllByText("Escolher print")).toHaveLength(6);
  });
});
