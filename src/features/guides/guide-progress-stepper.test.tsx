import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getGuide, getStepsForGuide } from "@/data/guides";
import { GuideProgressStepper } from "./guide-progress-stepper";

const guide = getGuide("android")!;
const steps = getStepsForGuide(guide.id);

describe("trilha de progresso do guia", () => {
  it("anuncia a posição inicial e o estado de cada segmento", () => {
    render(<GuideProgressStepper steps={steps} currentStep={0} />);

    expect(screen.getByRole("progressbar", { name: "Progresso" })).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByText("Passo 1 de 6")).toBeVisible();
    expect(screen.getByText("0 concluídos")).toBeVisible();
    expect(screen.getByText(`${steps[0]!.title}: Atual`)).toBeInTheDocument();
    expect(screen.getByText(`${steps[1]!.title}: Próximo`)).toBeInTheDocument();
  });

  it("diferencia segmentos concluídos, atual e futuros", () => {
    const { container } = render(<GuideProgressStepper steps={steps} currentStep={2} />);

    expect(container.querySelectorAll(".guide-progress-segment--complete")).toHaveLength(2);
    expect(container.querySelectorAll(".guide-progress-segment--current")).toHaveLength(1);
    expect(container.querySelectorAll(".guide-progress-segment--upcoming")).toHaveLength(steps.length - 3);
  });
});
