import { describe, expect, it } from "vitest";
import { govBrGroups, govBrScripts, govBrTasks } from "@/data/gov-br-guides";
import { adminScriptSlugs, getAdminScriptSteps } from "@/data/admin-guide-scripts";
import { tasks } from "@/data/guides";

describe("Gov.br Catálogo e Roteiros Didáticos", () => {
  it("contém exatamente as 15 tarefas essenciais mapeadas para celular", () => {
    expect(govBrTasks).toHaveLength(15);
    govBrTasks.forEach((task) => {
      expect(task.applicationId).toBe("app-gov-br");
      expect(task.availability).toBe("available");
      expect(task.status).toBe("published");
      expect(task.stepCount).toBeGreaterThanOrEqual(3);
      expect(task.stepCount).toBeLessThanOrEqual(5);
      expect(govBrGroups).toContain(task.categoryGroup);
    });
  });

  it("todas as 15 tarefas estão integradas na lista global de tasks", () => {
    govBrTasks.forEach((task) => {
      const found = tasks.find((t) => t.id === task.id);
      expect(found).toBeDefined();
      expect(found?.slug).toBe(task.slug);
    });
  });

  it("cada tarefa possui um roteiro com a quantidade exata de passos em govBrScripts", () => {
    govBrTasks.forEach((task) => {
      const script = govBrScripts[task.slug];
      expect(script, `Roteiro não encontrado para ${task.slug}`).toBeDefined();
      expect(script).toHaveLength(task.stepCount!);

      script.forEach((step, index) => {
        expect(step.title.length, `Título do passo ${index + 1} em ${task.slug} vazio`).toBeGreaterThan(0);
        expect(step.instruction.length, `Instrução do passo ${index + 1} em ${task.slug} vazia`).toBeGreaterThan(0);
        expect(step.imageAlt.length, `imageAlt do passo ${index + 1} em ${task.slug} vazia`).toBeGreaterThan(0);
      });
    });
  });

  it("todos os slugs de Gov.br estão presentes em adminScriptSlugs para execução pelo leitor", () => {
    govBrTasks.forEach((task) => {
      expect(adminScriptSlugs).toContain(task.slug);
      const steps = getAdminScriptSteps(task.slug, "android");
      expect(steps).toHaveLength(task.stepCount!);
      expect(steps[0].id).toBe(`editorial-${task.slug}-android-1`);
      expect(steps[0].guideId).toBe(`editorial-${task.slug}-android`);
    });
  });

  it("distribui as tarefas equilibradamente nos 4 grupos da vida real", () => {
    const byGroup = govBrTasks.reduce<Record<string, number>>((acc, task) => {
      acc[task.categoryGroup!] = (acc[task.categoryGroup!] ?? 0) + 1;
      return acc;
    }, {});

    expect(byGroup["Conta e Acesso"]).toBe(4);
    expect(byGroup["Meu INSS"]).toBe(4);
    expect(byGroup["Saúde e SUS"]).toBe(3);
    expect(byGroup["Documentos e Direitos"]).toBe(4);
  });
});
