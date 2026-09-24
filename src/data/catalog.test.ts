import { describe, expect, it } from "vitest";
import { actions } from "./actions";
import { financialApplications } from "./applications";
import { getStepsForGuide, guides, tasks } from "./guides";

describe("catálogo migrado", () => {
  it("cadastra 11 ações e oito aplicativos financeiros", () => {
    expect(actions).toHaveLength(11);
    expect(financialApplications).toHaveLength(8);
  });

  it("mantém todas as combinações por aplicativo em preparação", () => {
    const applicationTasks = tasks.filter((task) =>
      financialApplications.some((application) => application.id === task.applicationId),
    );
    expect(applicationTasks).toHaveLength(82);
    expect(applicationTasks.every((task) => task.availability === "preparing" && task.status === "draft")).toBe(true);
  });

  it("não cria guias navegáveis para o conteúdo migrado", () => {
    expect(guides).toHaveLength(2);
    expect(tasks.filter((task) => task.availability === "demo")).toHaveLength(1);
    expect(guides.every((guide) => guide.taskId === "task-pagar-boleto-demo")).toBe(true);
  });

  it("mantém o guia pesquisado como rascunho e encerra antes da confirmação", () => {
    const androidGuide = guides.find((guide) => guide.operatingSystem === "android")!;
    const steps = getStepsForGuide(androidGuide.id);

    expect(androidGuide.guideVersion).toBe("0.2-research");
    expect(androidGuide.status).toBe("draft");
    expect(androidGuide.lastReviewedAt).toBeNull();
    expect(steps).toHaveLength(6);
    expect(steps[4]?.instruction).toContain("Se algo estiver diferente, pare");
    expect(steps[5]?.instruction).toContain("antes da senha e da confirmação");
  });
});
