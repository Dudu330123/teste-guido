import { describe, expect, it } from "vitest";
import { nextStep, previousStep, restartGuide } from "./guide-navigation";

describe("navegação do guia", () => {
  it("avança e retorna sem ultrapassar os limites", () => {
    expect(nextStep(0, 6)).toBe(1);
    expect(nextStep(5, 6)).toBe(5);
    expect(previousStep(2)).toBe(1);
    expect(previousStep(0)).toBe(0);
  });

  it("reinicia no primeiro passo", () => {
    expect(restartGuide()).toBe(0);
  });
});
