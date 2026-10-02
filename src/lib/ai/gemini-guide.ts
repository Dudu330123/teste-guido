import type { GeneratedGuide, GeneratedStep } from "@/services/ai-guide-generator";

interface GeminiStep {
  order: number;
  title: string;
  instruction: string;
  voiceInstruction: string;
  targetLabel: string;
  imageAlt: string;
  warning?: string;
}

interface GeminiResponseFormat {
  spokenAnswer: string;
  title: string;
  taskSlug: string;
  appName: string;
  appSlug: string;
  steps: GeminiStep[];
}

export type GeminiGuideResult =
  | { ok: true; guide: GeneratedGuide }
  | { ok: false; reason: "no_api_key" | "api_error" | "empty_response" | "invalid_response" | "timeout" };

const SYSTEM_PROMPT = `Você é o Guido: um neto carinhoso, atencioso e muito paciente que ajuda pessoas idosas e iniciantes a usarem o celular com segurança, calma e sem medo.

Regras da resposta:
- Fale de forma calorosa, simples e acolhedora, nunca como um manual frio.
- Use palavras cotidianas brasileiras e explique uma ação por vez.
- Divida a tarefa em exatamente 3 a 5 passos visuais e simples.
- Se envolver banco, Pix, dinheiro, senha ou código, inclua um aviso claro de segurança.
- Nunca peça senha, código, CPF, dados bancários ou qualquer segredo.
- Não invente nomes de botões que não sejam necessários; quando houver dúvida, explique como procurar a opção.

Retorne ESTRITAMENTE um objeto JSON válido neste formato:
{
  "spokenAnswer": "Mensagem calorosa de 2 ou 3 frases para ser falada em voz alta.",
  "title": "Título simples do guia",
  "taskSlug": "slug-da-tarefa",
  "appName": "Nome do aplicativo ou serviço",
  "appSlug": "slug-do-aplicativo",
  "steps": [
    {
      "order": 1,
      "title": "Título amigável do passo",
      "instruction": "Instrução clara em 1 ou 2 frases.",
      "voiceInstruction": "Texto para leitura em voz alta.",
      "targetLabel": "Botão ou local onde tocar",
      "imageAlt": "Descrição da tela que a pessoa verá",
      "warning": "Aviso de segurança opcional"
    }
  ]
}`;

function isGeminiStep(value: unknown): value is GeminiStep {
  if (!value || typeof value !== "object") return false;
  const step = value as Partial<GeminiStep>;
  return (
    typeof step.order === "number" &&
    typeof step.title === "string" &&
    typeof step.instruction === "string" &&
    typeof step.voiceInstruction === "string" &&
    typeof step.targetLabel === "string" &&
    typeof step.imageAlt === "string"
  );
}

function normalizeSteps(steps: unknown): GeneratedStep[] {
  if (!Array.isArray(steps)) return [];
  return steps
    .filter(isGeminiStep)
    .slice(0, 5)
    .map((step, index) => ({
      order: index + 1,
      title: step.title.trim(),
      instruction: step.instruction.trim(),
      voiceInstruction: step.voiceInstruction.trim(),
      targetLabel: step.targetLabel.trim(),
      imageAlt: step.imageAlt.trim(),
      ...(step.warning?.trim() ? { warning: step.warning.trim() } : {}),
    }))
    .filter((step) => step.title && step.instruction && step.voiceInstruction);
}

/**
 * Mantém a chave do Gemini no servidor e valida a estrutura antes de entregar
 * um guia ao cliente. O limite de 12 segundos evita deixar o modal preso.
 */
export async function generateGuideFromGemini(
  prompt: string,
): Promise<GeminiGuideResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey?.trim()) return { ok: false, reason: "no_api_key" };

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey.trim(),
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{
          role: "user",
          parts: [{ text: `O usuário pediu: "${prompt.trim()}". Gere o guia seguindo rigorosamente o JSON.` }],
        }],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: "application/json",
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn("Falha na chamada Gemini API:", response.status);
      return { ok: false, reason: "api_error" };
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof rawText !== "string" || !rawText.trim()) {
      return { ok: false, reason: "empty_response" };
    }

    const parsed = JSON.parse(rawText) as Partial<GeminiResponseFormat>;
    const steps = normalizeSteps(parsed.steps);
    if (steps.length < 3) return { ok: false, reason: "invalid_response" };

    return {
      ok: true,
      guide: {
        id: `ai-guide-${Date.now()}`,
        title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : "Guia com o Guido",
        spokenAnswer:
          typeof parsed.spokenAnswer === "string" && parsed.spokenAnswer.trim()
            ? parsed.spokenAnswer.trim()
            : "Oi! Que bom que você perguntou. Preparei tudo com carinho para a gente fazer juntos.",
        taskSlug: typeof parsed.taskSlug === "string" && parsed.taskSlug.trim() ? parsed.taskSlug.trim() : "guia-gerado",
        appSlug: typeof parsed.appSlug === "string" && parsed.appSlug.trim() ? parsed.appSlug.trim() : "aplicativo",
        appName: typeof parsed.appName === "string" && parsed.appName.trim() ? parsed.appName.trim() : "Aplicativo",
        steps,
        isAiGenerated: true,
      },
    };
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    console.warn("Erro ao consultar o Gemini:", isAbort ? "Timeout" : error);
    return { ok: false, reason: isAbort ? "timeout" : "invalid_response" };
  } finally {
    clearTimeout(timeoutId);
  }
}
