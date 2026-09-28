import { describe, expect, it } from "vitest";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { availableGuideCount, categoryTasks } from "./learning-catalog";

describe("catálogo da página inicial", () => {
  it("não contabiliza rascunhos, demonstrações nem guias em preparação como disponíveis", () => {
    const base = tasks[0];
    expect(availableGuideCount([
      { ...base, status: "published", availability: "available" },
      { ...base, status: "draft", availability: "available" },
      { ...base, status: "published", availability: "preparing" },
      { ...base, status: "published", availability: "demo" },
    ])).toBe(1);
  });

  it("separa bancos reais da demonstração", () => {
    const result = categoryTasks("banks", tasks, applications);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((task) => task.applicationId !== "app-demo-bancos")).toBe(true);
  });

  it("encontra acessibilidade pelos termos do catálogo e aceita categoria vazia", () => {
    const task = { ...tasks[0], title: "Aumentar a letra", searchTerms: ["fonte"] };
    expect(categoryTasks("accessibility", [task], applications)).toEqual([task]);
    expect(categoryTasks("accessibility", [], applications)).toEqual([]);
  });
});
