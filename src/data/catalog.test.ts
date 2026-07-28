import { describe, expect, it } from "vitest";
import { actions } from "./actions";
import { financialApplications } from "./applications";
import { guides, tasks } from "./guides";

describe("catálogo migrado", () => {
  it("cadastra seis ações e dez aplicativos financeiros do MVP anterior", () => {
    expect(actions).toHaveLength(6);
    expect(financialApplications).toHaveLength(10);
  });

  it("mantém todas as combinações por aplicativo em preparação", () => {
    const applicationTasks = tasks.filter((task) =>
      financialApplications.some((application) => application.id === task.applicationId),
    );
    expect(applicationTasks).toHaveLength(60);
    expect(applicationTasks.every((task) => task.availability === "preparing" && task.status === "draft")).toBe(true);
  });

  it("não cria guias navegáveis para o conteúdo migrado", () => {
    expect(guides).toHaveLength(2);
    expect(tasks.filter((task) => task.availability === "demo")).toHaveLength(1);
    expect(guides.every((guide) => guide.taskId === "task-pagar-boleto-demo")).toBe(true);
  });
});
