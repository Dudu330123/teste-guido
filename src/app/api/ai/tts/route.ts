import { NextResponse } from "next/server";

// Voz padrão acolhedora do ElevenLabs (Antoni: voz masculina calorosa e paciente, ideal para o Guido)
// Outras opções famosas: "21m00Tcm4TlvDq8ikWAM" (Rachel), "EXAVITQu4vr4xnSDxMaL" (Bella)
const DEFAULT_VOICE_ID = "ErXwobaYiN019PkySvjV";

function cleanTextForSpeech(text: string): string {
  return text
    // Remove emojis para não gerar descrições esquisitas na voz
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
    // Remove formatação de código ou markdown
    .replace(/[*_#`~>[\]()]/g, "")
    // Ajusta abreviações populares brasileiras para pronúncia natural
    .replace(/\bzap\b/gi, "WhatsApp")
    .replace(/\bapp\b/gi, "aplicativo")
    .replace(/\bapps\b/gi, "aplicativos")
    .replace(/\bex:\b/gi, "por exemplo:")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const text = body?.text;
    const clientKey = body?.apiKey;
    const voiceId = body?.voiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Texto para sintetizar é obrigatório." },
        { status: 400 }
      );
    }

    const apiKey = clientKey || process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      // Sem chave configurada, retorna aviso imediato para fallback nativo veloz
      return NextResponse.json(
        {
          fallback: true,
          reason: "no_elevenlabs_key",
          message: "Chave da ElevenLabs não configurada. Use o sintetizador local ou adicione ELEVENLABS_API_KEY.",
        },
        { status: 200 }
      );
    }

    const cleanedText = cleanTextForSpeech(text).slice(0, 800);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;

    let response: Response;
    try {
      response = await fetch(elevenLabsUrl, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey.trim(),
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: cleanedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Erro ao chamar ElevenLabs TTS:", response.status, errText);
      return NextResponse.json(
        {
          fallback: true,
          reason: "elevenlabs_error",
          status: response.status,
          detail: errText,
        },
        { status: 200 }
      );
    }

    const audioArrayBuffer = await response.arrayBuffer();

    return new NextResponse(audioArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Length": audioArrayBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    console.warn("Falha no endpoint de áudio ElevenLabs:", isAbort ? "Timeout" : err);

    return NextResponse.json(
      {
        fallback: true,
        reason: isAbort ? "timeout" : "unexpected_error",
      },
      { status: 200 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  const apiKeyParam = searchParams.get("apiKey");
  const voiceId = searchParams.get("voiceId") || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

  if (!text || !text.trim()) {
    return NextResponse.json(
      { error: "Parâmetro 'text' é obrigatório." },
      { status: 400 }
    );
  }

  const apiKey = apiKeyParam || process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        fallback: true,
        reason: "no_elevenlabs_key",
      },
      { status: 200 }
    );
  }

  try {
    const cleanedText = cleanTextForSpeech(text).slice(0, 800);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;

    const response = await fetch(elevenLabsUrl, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey.trim(),
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: cleanedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { fallback: true, reason: "elevenlabs_error", status: response.status },
        { status: 200 }
      );
    }

    const audioArrayBuffer = await response.arrayBuffer();

    return new NextResponse(audioArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Length": audioArrayBuffer.byteLength.toString(),
      },
    });
  } catch {
    return NextResponse.json(
      { fallback: true, reason: "unexpected_error" },
      { status: 200 }
    );
  }
}
