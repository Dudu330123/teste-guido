import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/ai/tts", () => {
  it("retorna erro 400 se o texto estiver vazio", async () => {
    const request = new Request("http://localhost:3000/api/ai/tts", {
      method: "POST",
      body: JSON.stringify({ text: "   " }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it("retorna fallback imediato se a chave ElevenLabs não estiver configurada", async () => {
    const origKey = process.env.ELEVENLABS_API_KEY;
    delete process.env.ELEVENLABS_API_KEY;

    try {
      const request = new Request("http://localhost:3000/api/ai/tts", {
        method: "POST",
        body: JSON.stringify({ text: "Olá! Como posso ajudar?" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.fallback).toBe(true);
      expect(body.reason).toBe("no_elevenlabs_key");
    } finally {
      if (origKey) process.env.ELEVENLABS_API_KEY = origKey;
    }
  });
});
