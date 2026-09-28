import { describe, expect, it } from "vitest";
import { whatsappGroups, whatsappScripts, whatsappTasks } from "@/data/whatsapp-guides";
import { otherAppsScripts, otherAppsTasks, externalApplications } from "@/data/other-apps-guides";
import { otherApps } from "@/data/other-apps";
import { adminScriptSlugs, getAdminScriptSteps } from "@/data/admin-guide-scripts";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";

describe("WhatsApp Catálogo e Roteiros Didáticos", () => {
  it("contém 15 tarefas reais estruturadas para a terceira idade", () => {
    expect(whatsappTasks).toHaveLength(15);
    whatsappTasks.forEach((task) => {
      expect(task.applicationId).toBe("app-whatsapp");
      expect(task.availability).toBe("available");
      expect(task.status).toBe("published");
      expect(task.stepCount).toBeGreaterThanOrEqual(3);
      expect(task.stepCount).toBeLessThanOrEqual(5);
      expect(whatsappGroups).toContain(task.categoryGroup);
    });
  });

  it("todas as tarefas de WhatsApp estão presentes em tasks e adminScriptSlugs", () => {
    whatsappTasks.forEach((task) => {
      expect(tasks.some((t) => t.id === task.id)).toBe(true);
      expect(adminScriptSlugs).toContain(task.slug);

      const script = whatsappScripts[task.slug];
      expect(script, `Script não encontrado para ${task.slug}`).toBeDefined();
      expect(script).toHaveLength(task.stepCount!);

      const steps = getAdminScriptSteps(task.slug, "android");
      expect(steps).toHaveLength(task.stepCount!);
      expect(steps[0].id).toBe(`editorial-${task.slug}-android-1`);
    });
  });
});

describe("Outros Aplicativos (Gmail, YouTube, Fotos, Uber, Maps, Instagram)", () => {
  it("contém exatamente 90 tarefas distribuídas igualmente (15 por app) entre os 6 aplicativos externos", () => {
    expect(otherAppsTasks).toHaveLength(90);
    otherAppsTasks.forEach((task) => {
      expect(task.availability).toBe("available");
      expect(task.status).toBe("published");
      expect(task.stepCount).toBeGreaterThanOrEqual(3);
      expect(task.stepCount).toBeLessThanOrEqual(5);
      expect(adminScriptSlugs).toContain(task.slug);

      const script = otherAppsScripts[task.slug];
      expect(script, `Script não encontrado para ${task.slug}`).toBeDefined();
      expect(script).toHaveLength(task.stepCount!);
    });
  });

  it("os 6 aplicativos externos estão devidamente cadastrados em applications", () => {
    externalApplications.forEach((app) => {
      expect(applications.some((a) => a.id === app.id)).toBe(true);
      expect(app.category).toBe("Outros aplicativos");
    });
  });

  it("otherApps em other-apps.tsx possui exatamente 15 tarefas para cada um dos 6 apps", () => {
    expect(otherApps).toHaveLength(6);
    otherApps.forEach((app) => {
      expect(app.tasks).toHaveLength(15);
      app.tasks.forEach((task) => {
        expect(task.stepCount).toBeGreaterThanOrEqual(3);
        expect(task.stepCount).toBeLessThanOrEqual(5);
        expect(task.availability).toBe("available");
      });
    });
  });
});
