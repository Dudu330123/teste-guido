import { NextResponse } from "next/server";
import crypto from "crypto";

const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EA654070808940C5734A7B55";

/**
 * Gera o token Sec-MS-GEC exigido pelo serviço de voz neural da Microsoft
 */
function getSecMsGec(): string {
  const ticks = (Date.now() + 11644473600000) * 10000;
  const roundedTicks = ticks - (ticks % 3000000000);
  const str = `${roundedTicks}${TRUSTED_CLIENT_TOKEN}`;
  return crypto.createHash("sha256").update(str, "ascii").digest("hex").toUpperCase();
}

function generateConnectionId(): string {
  return crypto.randomBytes(16).toString("hex");
}

function cleanTextForSpeech(text: string): string {
  return text
    // Remove emojis (para a voz não soletrar descrições de imagens)
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
    // Remove markdown
    .replace(/[*_#`~>[\]()]/g, "")
    // Ajusta abreviações para dicção natural
    .replace(/\bzap\b/gi, "WhatsApp")
    .replace(/\bapp\b/gi, "aplicativo")
    .replace(/\bapps\b/gi, "aplicativos")
    .replace(/\bex:\b/gi, "por exemplo:")
    // Normaliza espaços
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cria o SSML com pausas de respiração humana e estilo caloroso/expressivo
 */
function getHumanizedSSML(
  text: string,
  voice = "pt-BR-FranciscaNeural",
  rate = "-8%",
  pitch = "+2Hz"
): string {
  const sanitized = cleanTextForSpeech(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  // Inserção de micropausas humanas de respiração
  const withBreathing = sanitized
    .replace(/\. /g, '. <break time="450ms"/> ')
    .replace(/! /g, '! <break time="480ms"/> ')
    .replace(/\? /g, '? <break time="500ms"/> ')
    .replace(/, /g, ', <break time="180ms"/> ')
    .replace(/; /g, '; <break time="250ms"/> ');

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="pt-BR">
    <voice name="${voice}">
      <mstts:express-as style="cheerful" styledegree="1.2">
        <prosody rate="${rate}" pitch="${pitch}">
          ${withBreathing}
        </prosody>
      </mstts:express-as>
    </voice>
  </speak>`;
}

async function synthesizeNeuralAudio(
  text: string,
  voice = "pt-BR-FranciscaNeural"
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const connectionId = generateConnectionId();
    const gec = getSecMsGec();
    const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${gec}&Sec-MS-GEC-Version=1-130.0.2849.68&ConnectionId=${connectionId}`;

    const ws = new WebSocket(wsUrl);
    const audioChunks: Buffer[] = [];
    let isFinished = false;

    const timer = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        try {
          ws.close();
        } catch {}
        if (audioChunks.length > 0) {
          resolve(Buffer.concat(audioChunks));
        } else {
          reject(new Error("Timeout synthesizing neural speech"));
        }
      }
    }, 12000);

    ws.onopen = () => {
      const configMsg =
        `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
        `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
      ws.send(configMsg);

      const requestId = generateConnectionId();
      const ssml = getHumanizedSSML(text, voice);
      const ssmlMsg = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;
      ws.send(ssmlMsg);
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        if (event.data.includes("Path:turn.end")) {
          isFinished = true;
          clearTimeout(timer);
          try {
            ws.close();
          } catch {}
          resolve(Buffer.concat(audioChunks));
        }
      } else if (event.data instanceof Blob) {
        const arrayBuf = await event.data.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        const delimiter = Buffer.from("\r\n\r\n");
        const idx = buf.indexOf(delimiter);
        if (idx !== -1) {
          const audioData = buf.subarray(idx + 4);
          audioChunks.push(audioData);
        }
      }
    };

    ws.onerror = (err) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        reject(err);
      }
    };

    ws.onclose = () => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        if (audioChunks.length > 0) {
          resolve(Buffer.concat(audioChunks));
        } else {
          reject(new Error("Connection closed without audio"));
        }
      }
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const text = body?.text;
    const voice = body?.voice || "pt-BR-FranciscaNeural";

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Texto para sintetizar é obrigatório." },
        { status: 400 }
      );
    }

    const audioBuffer = await synthesizeNeuralAudio(text, voice);

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Erro na síntese neural humanizada de voz:", err);
    return NextResponse.json(
      { error: "Falha ao gerar áudio neural." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  const voice = searchParams.get("voice") || "pt-BR-FranciscaNeural";

  if (!text || !text.trim()) {
    return NextResponse.json(
      { error: "Parâmetro 'text' é obrigatório." },
      { status: 400 }
    );
  }

  try {
    const audioBuffer = await synthesizeNeuralAudio(text, voice);

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Erro na síntese neural humanizada de voz (GET):", err);
    return NextResponse.json(
      { error: "Falha ao gerar áudio neural." },
      { status: 500 }
    );
  }
}
