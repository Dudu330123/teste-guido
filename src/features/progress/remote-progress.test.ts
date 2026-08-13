import { afterEach, describe, expect, it, vi } from "vitest";
import { loadRemoteProgress, saveRemoteProgress } from "./remote-progress";

afterEach(() => vi.unstubAllGlobals());

describe("remote progress", () => {
  it("aceita progresso válido retornado pela API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          guideId: "guide-1",
          currentStep: 2,
          status: "in_progress",
          lastAccessedAt: "2026-08-10T00:00:00Z",
          completedAt: null,
        },
      }),
    }));
    await expect(loadRemoteProgress("guide-1")).resolves.toMatchObject({ currentStep: 2 });
  });

  it("ignora payload remoto inválido", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: {} }) }));
    await expect(loadRemoteProgress("guide-1")).resolves.toBeNull();
  });

  it("informa sucesso somente quando o proxy aceita o salvamento", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    await expect(saveRemoteProgress("guide-1", 0, "in_progress")).resolves.toBe(true);
  });
});

