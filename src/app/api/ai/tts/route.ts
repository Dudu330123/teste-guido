import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

const DEFAULT_VOICE_ID = "ErXwobaYiN019PkySvjV";

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[*_#`~>[\]()]/g, "")
    .replace(/\bzap\b/gi, "WhatsApp")
    .replace(/\bapp\b/gi, "aplicativo")
    .replace(/\bapps\b/gi, "aplicativos")
    .replace(/\bex:\b/gi, "por exemplo:")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, "ai-tts", 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Tente novamente em alguns instantes." }, rateLimitResponse(rateLimit));
  }

  try {
    const body = await request.json().catch(() => null);
    const text = body?.text;
    const voiceId = body?.voiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Texto para sintetizar é obrigatório." }, { status: 400 });
    }

    if (typeof voiceId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(voiceId)) {
      return NextResponse.json({ error: "Voz inválida." }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({
        fallback: true,
        reason: "no_elevenlabs_key",
        message: "Chave da ElevenLabs não configurada. Use o sintetizador local.",
      }, { headers: { "Cache-Control": "no-store" } });
    }

    const cleanedText = cleanTextForSpeech(text).slice(0, 800);
    if (!cleanedText) {
      return NextResponse.json({ error: "Texto para sintetizar é obrigatório." }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    let response: Response;
    try {
      response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: cleanedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      console.warn("ElevenLabs recusou a síntese:", response.status);
      return NextResponse.json({ fallback: true, reason: "elevenlabs_error" }, { headers: { "Cache-Control": "no-store" } });
    }

    const audioArrayBuffer = await response.arrayBuffer();
    return new NextResponse(audioArrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, no-store",
        "Content-Length": audioArrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    console.warn("Falha no endpoint de áudio ElevenLabs:", isAbort ? "Timeout" : "erro inesperado");
    return NextResponse.json({ fallback: true, reason: isAbort ? "timeout" : "unexpected_error" }, { headers: { "Cache-Control": "no-store" } });
  }
}
