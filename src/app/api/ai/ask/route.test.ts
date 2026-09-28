import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/ai/ask", () => {
  it("retorna erro 400 se o prompt estiver vazio", async () => {
    const request = new Request("http://localhost:3000/api/ai/ask", {
      method: "POST",
      body: JSON.stringify({ prompt: "   " }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it("retorna fallback se nenhuma chave de API estiver configurada", async () => {
    const originalGeminiKey = process.env.GEMINI_API_KEY;
    const originalGoogleKey = process.env.GOOGLE_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    try {
      const request = new Request("http://localhost:3000/api/ai/ask", {
        method: "POST",
        body: JSON.stringify({ prompt: "como pagar conta de luz?" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.fallback).toBe(true);
      expect(body.reason).toBe("no_api_key");
    } finally {
      if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey;
      if (originalGoogleKey) process.env.GOOGLE_API_KEY = originalGoogleKey;
    }
  });
});
