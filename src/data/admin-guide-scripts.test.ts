import { describe, expect, it } from "vitest";
import { actions } from "./actions";
import { getAdminScriptSteps } from "./admin-guide-scripts";
import { tasks } from "./guides";

describe("roteiros editoriais do painel", () => {
  it("oferece passos para todos os guias exibidos no painel, exceto o boleto canônico", () => {
    const representedActionIds = new Set(
      tasks.filter(({ applicationId }) => applicationId === "app-demo-bancos").map(({ actionId }) => actionId),
    );
    const financialActionSlugs = actions
      .filter(({ id }) => !representedActionIds.has(id))
      .map(({ slug }) => slug);
    const taskSlugs = tasks
      .filter(({ slug }) => slug !== "pagar-boleto")
      .filter(({ applicationId }) => !applicationId.startsWith("app-") || [
        "app-demo-bancos",
        "app-whatsapp",
        "app-gov-br",
      ].includes(applicationId))
      .map(({ slug }) => slug);
    const slugs = new Set([...financialActionSlugs, ...taskSlugs]);

    slugs.forEach((slug) => {
      expect(getAdminScriptSteps(slug, "android").length, slug).toBeGreaterThan(0);
      expect(getAdminScriptSteps(slug, "ios").length, slug).toBeGreaterThan(0);
    });
  });

  it("mantém IDs estáveis e separados por sistema operacional", () => {
    expect(getAdminScriptSteps("fazer-pix", "android")[0]?.id).toBe("editorial-fazer-pix-android-1");
    expect(getAdminScriptSteps("fazer-pix", "ios")[0]?.id).toBe("editorial-fazer-pix-ios-1");
  });
});
