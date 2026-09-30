import { NextResponse } from "next/server";

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

const SYSTEM_PROMPT = `Você é o Guido: um neto carinhoso, atencioso e muito paciente que ama ajudar pessoas idosas e iniciantes a usarem o celular com segurança, calma e sem medo.

Sua voz e personalidade:
- Você NUNCA soa como um manual de instruções ou um robô frio.
- Você conversa como uma pessoa querida da família, transmitindo segurança e tranquilidade.
- No campo "spokenAnswer": crie uma fala falada de 2 a 3 frases afetuosas, começando sempre de forma calorosa (ex: "Oi! Que bom que você me perguntou...", "Fique bem tranquilo, isso é super fácil e vamos fazer juntos...", "Pode deixar comigo, vou te explicar de um jeitinho bem simples!").
- Use termos cotidianos brasileiros doces e claros (ex: "microfonezinho verde", "lupinha", "apertar de levinho", "foto da família", "botão azul").
- Tranquilize o idoso: mostre que não precisa ter pressa e que ele é perfeitamente capaz.
- Nos "steps" (passos): divida a ação em 3 a 5 passos bem visuais e simples.
- Regra de ouro da segurança: se envolver dinheiro, banco, Pix ou senha, reforce com carinho que o Guido nunca pede senhas e que senhas nunca devem ser passadas para ninguém.

Retorne ESTRITAMENTE um objeto JSON válido no formato abaixo:
{
  "spokenAnswer": "Mensagem calorosa, carinhosa e animadora de 2 a 3 frases para ser falada em voz alta.",
  "title": "Título simples e convidativo do guia",
  "taskSlug": "slug-da-tarefa",
  "appName": "Nome do Aplicativo",
  "appSlug": "slug-do-app",
  "steps": [
    {
      "order": 1,
      "title": "Título amigável do passo",
      "instruction": "Instrução explicada com calma e afeto em 1 ou 2 frases.",
      "voiceInstruction": "Texto para leitura em voz alta deste passo.",
      "targetLabel": "Nome do botão ou local onde tocar",
      "imageAlt": "Descrição visual do que a pessoa verá na tela",
      "warning": "Aviso de proteção (opcional, só para banco ou senhas)"
    }
  ]
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "A pergunta não pode estar vazia." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      body?.apiKey;

    if (!apiKey) {
      // Sem chave configurada no servidor, o cliente usa o fallback inteligente local
      return NextResponse.json({
        fallback: true,
        reason: "no_api_key",
        message: "Chave do Gemini não configurada. Utilizando base local do Guido.",
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `O idoso perguntou com carinho: "${prompt.trim()}". Responda em JSON seguindo rigorosamente o formato com a voz acolhedora do Guido.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.35, // Ligeiramente mais expressivo e humano
        responseMimeType: "application/json",
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("Falha na chamada Gemini API:", response.status, errorText);
      return NextResponse.json({
        fallback: true,
        reason: "api_error",
        status: response.status,
      });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({
        fallback: true,
        reason: "empty_response",
      });
    }

    const parsed: GeminiResponseFormat = JSON.parse(rawText);

    return NextResponse.json({
      success: true,
      guide: {
        id: `ai-guide-${Date.now()}`,
        title: parsed.title || "Guia com o Guido",
        spokenAnswer: parsed.spokenAnswer || `Oi! Que bom que você perguntou. Preparei tudo com muito carinho aqui na tela para a gente ver juntos!`,
        taskSlug: parsed.taskSlug || "guia-gerado",
        appSlug: parsed.appSlug || "aplicativo",
        appName: parsed.appName || "Aplicativo",
        steps: Array.isArray(parsed.steps) ? parsed.steps : [],
        isAiGenerated: true,
      },
    });
  } catch (error: unknown) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    console.warn("Erro ao consultar serviço de IA do Guido:", isAbort ? "Timeout" : error);

    return NextResponse.json({
      fallback: true,
      reason: isAbort ? "timeout" : "unexpected_error",
    });
  }
}
