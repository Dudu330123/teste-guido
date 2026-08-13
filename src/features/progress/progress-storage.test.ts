import { beforeEach, describe, expect, it } from "vitest";
import type { UserProgress } from "@/types/progress";
import { clearProgress, listProgress, loadProgress, saveProgress } from "./progress-storage";

const progress: UserProgress = {
  guideId: "guide-test",
  currentStep: 2,
  status: "in_progress",
  lastAccessedAt: "2026-07-28T12:00:00.000Z",
  guideVersion: "0.1",
  operatingSystem: "android",
};

describe("armazenamento local de progresso", () => {
  beforeEach(() => localStorage.clear());

  it("salva e recupera somente um progresso válido", () => {
    expect(saveProgress(localStorage, progress)).toBe(true);
    expect(loadProgress(localStorage, progress.guideId)).toEqual(progress);
  });

  it("ignora JSON inválido e dados fora do modelo", () => {
    localStorage.setItem("guido:progress:broken", "não é json");
    localStorage.setItem("guido:progress:unsafe", JSON.stringify({ guideId: "unsafe", password: "segredo" }));
    expect(loadProgress(localStorage, "broken")).toBeNull();
    expect(loadProgress(localStorage, "unsafe")).toBeNull();
  });

  it("remove o progresso ao reiniciar", () => {
    saveProgress(localStorage, progress);
    expect(clearProgress(localStorage, progress.guideId)).toBe(true);
    expect(loadProgress(localStorage, progress.guideId)).toBeNull();
  });

  it("lista os guias mais recentes e ignora registros inválidos", () => {
    saveProgress(localStorage, progress);
    saveProgress(localStorage, {
      ...progress,
      guideId: "guide-newer",
      lastAccessedAt: "2026-07-29T12:00:00.000Z",
    });
    localStorage.setItem("guido:progress:invalid", "conteúdo inválido");
    localStorage.setItem("outro-sistema", JSON.stringify(progress));

    expect(listProgress(localStorage).map((item) => item.guideId)).toEqual([
      "guide-newer",
      "guide-test",
    ]);
  });

  it("não aceita um guia cujo identificador diverge da chave local", () => {
    localStorage.setItem("guido:progress:guide-falso", JSON.stringify(progress));
    expect(listProgress(localStorage)).toEqual([]);
  });
});
