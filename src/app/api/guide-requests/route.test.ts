import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthenticated: vi.fn(),
  generateGemini: vi.fn(),
  generateFallback: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getAuthenticatedSupabaseServerClient: mocks.getAuthenticated,
}));
vi.mock("@/lib/ai/gemini-guide", () => ({
  generateGuideFromGemini: mocks.generateGemini,
}));
vi.mock("@/services/ai-guide-generator", () => ({
  generateGuideWithAi: mocks.generateFallback,
}));

import { POST } from "./route";

const guide = {
  id: "guide-1",
  title: "Como enviar uma foto",
  spokenAnswer: "Vamos fazer isso com calma.",
  taskSlug: "enviar-foto",
  appSlug: "whatsapp",
  appName: "WhatsApp",
  isAiGenerated: true,
  steps: [
    { order: 1, title: "Abra o WhatsApp", instruction: "Abra o aplicativo.", voiceInstruction: "Abra o WhatsApp.", targetLabel: "WhatsApp", imageAlt: "WhatsApp aberto" },
    { order: 2, title: "Abra a conversa", instruction: "Toque na conversa.", voiceInstruction: "Toque na conversa.", targetLabel: "Conversa", imageAlt: "Conversa aberta" },
    { order: 3, title: "Envie a foto", instruction: "Escolha a foto e envie.", voiceInstruction: "Escolha e envie a foto.", targetLabel: "Enviar", imageAlt: "Foto pronta" },
  ],
};

function makeSupabaseMock() {
  let fromCalls = 0;
  const countChain = {
    select: vi.fn(() => countChain),
    eq: vi.fn(() => countChain),
    gte: vi.fn(() => countChain),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ count: 0, error: null }).then(resolve),
  };
  const insertChain = {
    insert: vi.fn(() => insertChain),
    select: vi.fn(() => insertChain),
    single: vi.fn(() => Promise.resolve({ data: { id: "request-1" }, error: null })),
  };

  return {
    from: vi.fn((table: string) => {
      fromCalls += 1;
      return table === "guide_requests" && fromCalls === 1 ? countChain : insertChain;
    }),
  };
}

describe("POST /api/guide-requests", () => {
  beforeEach(() => {
    mocks.getAuthenticated.mockReset();
    mocks.generateGemini.mockReset();
    mocks.generateFallback.mockReset();
    mocks.generateGemini.mockResolvedValue({ ok: true, guide });
    mocks.getAuthenticated.mockResolvedValue({
      user: { id: "user-1" },
      supabase: makeSupabaseMock(),
    });
  });

  it("bloqueia pedidos sem sessão", async () => {
    mocks.getAuthenticated.mockResolvedValue(null);

    const response = await POST(new Request("http://localhost/api/guide-requests", {
      method: "POST",
      body: JSON.stringify({ prompt: "quero enviar uma foto", inputMode: "text" }),
    }));

    expect(response.status).toBe(401);
  });

  it("valida o texto antes de consultar a IA", async () => {
    const response = await POST(new Request("http://localhost/api/guide-requests", {
      method: "POST",
      body: JSON.stringify({ prompt: "x", inputMode: "text" }),
    }));

    expect(response.status).toBe(400);
    expect(mocks.generateGemini).not.toHaveBeenCalled();
  });

  it("gera e salva um guia para a conta autenticada", async () => {
    const response = await POST(new Request("http://localhost/api/guide-requests", {
      method: "POST",
      body: JSON.stringify({ prompt: "quero enviar uma foto", inputMode: "voice" }),
    }));

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      id: "request-1",
      status: "completed",
      guide,
    });
  });
});
