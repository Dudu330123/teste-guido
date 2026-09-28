export interface GeneratedStep {
  order: number;
  title: string;
  instruction: string;
  voiceInstruction: string;
  warning?: string;
  targetLabel: string;
  imageAlt: string;
}

export interface GeneratedGuide {
  id: string;
  title: string;
  spokenAnswer?: string;
  taskSlug: string;
  appSlug: string;
  appName: string;
  steps: GeneratedStep[];
  isAiGenerated: boolean;
}

// Base de conhecimento com tom caloroso, humano e acolhedor (100% offline ou sem chave)
const fallbackKnowledgeBase: Record<string, Partial<GeneratedGuide>> = {
  pix: {
    title: "Como Fazer um Pix com Segurança",
    spokenAnswer: "Oi! Fique bem tranquilo. Para fazer um Pix com segurança, abra o app do seu banco e toque em Área Pix. A dica de ouro que eu sempre lembro é conferir o nome da pessoa na tela com muita calma antes de confirmar qualquer valor. Veja os passos bem explicadinhos aqui na tela!",
    taskSlug: "fazer-pix",
    appSlug: "nubank",
    appName: "Nubank / Banco",
    steps: [
      {
        order: 1,
        title: "Abra o aplicativo do seu banco",
        instruction: "Na tela inicial do seu celular, procure o aplicativo do seu banco e toque nele de levinho.",
        voiceInstruction: "Primeiro passo: procure o aplicativo do seu banco na tela inicial do celular e toque nele com calma.",
        targetLabel: "Toque para abrir",
        imageAlt: "Tela inicial com o aplicativo do banco em destaque.",
      },
      {
        order: 2,
        title: "Toque na Área Pix",
        instruction: "Na tela principal do banco, procure pelo botão que diz 'Área Pix' ou 'Pix'.",
        voiceInstruction: "Passo dois: na tela principal do banco, procure o botão escrito Área Pix e toque nele.",
        targetLabel: "Área Pix",
        imageAlt: "Tela principal do banco com a Área Pix destacada.",
      },
      {
        order: 3,
        title: "Escolha a opção Transferir",
        instruction: "Toque no botão 'Transferir' ou 'Enviar Pix' para começar.",
        voiceInstruction: "Passo três: toque na opção Transferir.",
        targetLabel: "Transferir",
        imageAlt: "Menu Pix com a opção de transferir destacada.",
      },
      {
        order: 4,
        title: "Digite o valor e a chave Pix",
        instruction: "Digite a quantia e a chave Pix (pode ser CPF, celular ou e-mail) fornecida por quem vai receber.",
        voiceInstruction: "Passo quatro: digite o valor e a chave Pix da pessoa que vai receber o dinheiro.",
        targetLabel: "Digitar chave",
        imageAlt: "Campo para inserção da chave Pix e valor.",
      },
      {
        order: 5,
        title: "Confira o nome do recebedor e pare",
        instruction: "Confira com muita atenção se o nome completo que o banco mostrou é realmente o da pessoa. Se for diferente, cancele na hora!",
        voiceInstruction: "Atenção especial: confira o nome de quem vai receber. Se o nome não for exatamente o da pessoa, não continue.",
        warning: "O Guido nunca pede sua senha! Digite a senha somente no aplicativo oficial do banco após conferir todos os dados.",
        targetLabel: "Conferir nome",
        imageAlt: "Tela de confirmação de dados do Pix.",
      },
    ],
  },
  whatsapp: {
    title: "Como Enviar um Áudio no WhatsApp",
    spokenAnswer: "Oi! Que ótimo que você perguntou! Mandar áudio no WhatsApp é uma delícia para conversar com a família. É só abrir a conversa da pessoa e manter o dedinho pressionado no microfonezinho verde enquanto fala. Quando terminar, é só soltar! Preparei os passos com calma aqui embaixo para você ver.",
    taskSlug: "enviar-audio-whatsapp",
    appSlug: "whatsapp",
    appName: "WhatsApp",
    steps: [
      {
        order: 1,
        title: "Abra o WhatsApp",
        instruction: "Procure o ícone verde do WhatsApp na tela do seu celular e toque nele.",
        voiceInstruction: "Primeiro passo: toque no ícone verde do WhatsApp para abrir o aplicativo.",
        targetLabel: "WhatsApp",
        imageAlt: "Tela inicial do celular com o ícone do WhatsApp destacado.",
      },
      {
        order: 2,
        title: "Abra a conversa com a pessoa",
        instruction: "Na lista de conversas, toque no nome do seu filho, neto ou amigo com quem deseja falar.",
        voiceInstruction: "Passo dois: na lista de conversas, toque no nome da pessoa para quem quer enviar o áudio.",
        targetLabel: "Conversa",
        imageAlt: "Lista de conversas do WhatsApp com um contato em destaque.",
      },
      {
        order: 3,
        title: "Segure o microfonezinho enquanto fala",
        instruction: "No cantinho inferior direito, mantenha o dedo pressionado no microfone verde enquanto você fala a sua mensagem.",
        voiceInstruction: "Passo três: aperte e segure o botão de microfone no cantinho direito enquanto fala sua mensagem.",
        targetLabel: "Segure o microfone",
        imageAlt: "Tela de conversa do WhatsApp com o botão de microfone destacado.",
      },
      {
        order: 4,
        title: "Solte o dedo para enviar",
        instruction: "Quando terminar de falar, basta tirar o dedo da tela. O áudio será enviado na mesma hora!",
        voiceInstruction: "Passo quatro: quando terminar de falar, tire o dedinho da tela para que o áudio seja enviado.",
        targetLabel: "Solte para enviar",
        imageAlt: "Áudio enviado com sucesso na conversa.",
      },
    ],
  },
  boleto: {
    title: "Como Pagar um Boleto no Banco",
    spokenAnswer: "Oi! Não precisa se preocupar, pagar boleto pelo celular é muito prático e evita pegar fila. Você abre o aplicativo do seu banco, clica em Pagar e pode apontar a câmera para o código de barras ou colar os números da conta. Vamos fazer juntos, acompanhe os passos na tela!",
    taskSlug: "pagar-boleto",
    appSlug: "banco-do-brasil",
    appName: "Banco do Brasil / Nubank",
    steps: [
      {
        order: 1,
        title: "Abra o aplicativo do seu banco",
        instruction: "Toque no ícone do aplicativo do seu banco na tela inicial.",
        voiceInstruction: "Primeiro passo: abra o aplicativo do seu banco no celular.",
        targetLabel: "Abrir Banco",
        imageAlt: "Tela inicial com o banco em destaque.",
      },
      {
        order: 2,
        title: "Procure a opção 'Pagar' ou 'Pagamentos'",
        instruction: "Na tela inicial do banco, toque na opção 'Pagar' ou 'Pagamentos'.",
        voiceInstruction: "Passo dois: procure a opção Pagar ou Pagamentos e toque nela.",
        targetLabel: "Pagamentos",
        imageAlt: "Tela inicial com o botão de Pagamentos destacado.",
      },
      {
        order: 3,
        title: "Escolha Boleto ou Código de Barras",
        instruction: "Toque na opção de ler código de barras com a câmera ou digitar o código.",
        voiceInstruction: "Passo três: escolha pagar com código de barras ou ler com a câmera.",
        targetLabel: "Boleto",
        imageAlt: "Opção de código de barras destacada.",
      },
      {
        order: 4,
        title: "Confira o valor e a empresa",
        instruction: "Verifique se o valor do boleto e o nome da empresa (ex: Cemig, Sabesp, Enel) estão corretos.",
        voiceInstruction: "Atenção: confira o valor e quem receberá o pagamento antes de confirmar.",
        warning: "Confira com calma a data de vencimento e o valor. Nunca passe sua senha para terceiros.",
        targetLabel: "Conferir dados",
        imageAlt: "Tela de revisão de boleto.",
      },
    ],
  },
  uber: {
    title: "Como Pedir um Carro no Uber",
    spokenAnswer: "Oi! Pedir um carro no Uber é super tranquilo. Você abre o aplicativo, escreve onde deseja ir e escolhe a opção UberX. A regrinha de ouro que eu sempre lembro é conferir a placa do carro antes de entrar. Veja como é simples nos passos abaixo!",
    taskSlug: "pedir-uber",
    appSlug: "uber",
    appName: "Uber",
    steps: [
      {
        order: 1,
        title: "Abra o aplicativo da Uber",
        instruction: "Procure o ícone preto da Uber na tela do seu celular e toque nele.",
        voiceInstruction: "Primeiro passo: toque no ícone da Uber para abrir o aplicativo.",
        targetLabel: "Uber",
        imageAlt: "Ícone da Uber na tela do celular.",
      },
      {
        order: 2,
        title: "Toque em 'Para onde vamos?'",
        instruction: "Toque na barra de busca branca escrita 'Para onde?' e escreva ou fale o endereço de destino.",
        voiceInstruction: "Passo dois: toque no campo Para onde vamos e diga ou escreva o endereço que deseja ir.",
        targetLabel: "Para onde?",
        imageAlt: "Tela do mapa da Uber com a barra de busca destacada.",
      },
      {
        order: 3,
        title: "Escolha a opção UberX",
        instruction: "A opção UberX costuma ser a mais econômica. Toque nela para ver o valor da corrida.",
        voiceInstruction: "Passo três: selecione a opção UberX para ver o preço da corrida.",
        targetLabel: "UberX",
        imageAlt: "Lista de carros disponíveis com o UberX destacado.",
      },
      {
        order: 4,
        title: "Confira a placa e o motorista antes de entrar",
        instruction: "Quando o carro chegar, olhe a placa e pergunte o nome do motorista antes de entrar no veículo.",
        voiceInstruction: "Dica de segurança importante: sempre confira a placa do carro e pergunte o nome do motorista antes de entrar.",
        warning: "Segurança em primeiro lugar: nunca entre num carro sem conferir se a placa bate com o aplicativo.",
        targetLabel: "Confira a placa",
        imageAlt: "Tela com a placa e modelo do veículo.",
      },
    ],
  },
};

/**
 * Gera um guia estruturado usando a API segura do servidor Next.js (/api/ai/ask)
 * com fallback imediato para a base heurística local e humana do Guido.
 */
export async function generateGuideWithAi(userPrompt: string): Promise<GeneratedGuide> {
  const normalized = userPrompt.toLowerCase().trim();

  // 1. Tenta chamar a API do servidor do Next.js (protegida e gratuita com Gemini 1.5 Flash)
  try {
    let clientApiKey: string | undefined;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("guido-gemini-key")?.trim();
      if (stored) clientApiKey = stored;
    }

    const response = await fetch("/api/ai/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userPrompt, apiKey: clientApiKey }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.success && data?.guide) {
        return data.guide as GeneratedGuide;
      }
    }
  } catch (err) {
    console.warn("API interna de IA indisponível, usando inteligência local do Guido:", err);
  }

  // 2. Fallback inteligente imediato para perguntas comuns de idosos
  if (normalized.includes("pix") || normalized.includes("transferir") || normalized.includes("mandar dinheiro")) {
    const base = fallbackKnowledgeBase.pix!;
    return {
      id: `local-guide-pix-${Date.now()}`,
      title: base.title!,
      spokenAnswer: base.spokenAnswer,
      taskSlug: base.taskSlug!,
      appSlug: normalized.includes("brasil") || normalized.includes("bb") ? "banco-do-brasil" : "nubank",
      appName: normalized.includes("brasil") || normalized.includes("bb") ? "Banco do Brasil" : "Nubank",
      steps: base.steps as GeneratedStep[],
      isAiGenerated: false,
    };
  }

  if (normalized.includes("audio") || normalized.includes("áudio") || normalized.includes("voz") || normalized.includes("zap") || normalized.includes("whatsapp")) {
    const base = fallbackKnowledgeBase.whatsapp!;
    return {
      id: `local-guide-zap-${Date.now()}`,
      title: base.title!,
      spokenAnswer: base.spokenAnswer,
      taskSlug: base.taskSlug!,
      appSlug: "whatsapp",
      appName: "WhatsApp",
      steps: base.steps as GeneratedStep[],
      isAiGenerated: false,
    };
  }

  if (normalized.includes("boleto") || normalized.includes("conta") || normalized.includes("luz") || normalized.includes("água") || normalized.includes("barra")) {
    const base = fallbackKnowledgeBase.boleto!;
    return {
      id: `local-guide-boleto-${Date.now()}`,
      title: base.title!,
      spokenAnswer: base.spokenAnswer,
      taskSlug: base.taskSlug!,
      appSlug: "banco-do-brasil",
      appName: "Banco do Brasil",
      steps: base.steps as GeneratedStep[],
      isAiGenerated: false,
    };
  }

  if (normalized.includes("uber") || normalized.includes("carro") || normalized.includes("corrida") || normalized.includes("transporte") || normalized.includes("taxi")) {
    const base = fallbackKnowledgeBase.uber!;
    return {
      id: `local-guide-uber-${Date.now()}`,
      title: base.title!,
      spokenAnswer: base.spokenAnswer,
      taskSlug: base.taskSlug!,
      appSlug: "uber",
      appName: "Uber",
      steps: base.steps as GeneratedStep[],
      isAiGenerated: false,
    };
  }

  // 3. Guia estruturado genérico com linguagem carinhosa e acessível
  const shortPrompt = userPrompt.length > 30 ? `${userPrompt.slice(0, 28)}...` : userPrompt;
  return {
    id: `local-guide-generic-${Date.now()}`,
    title: `Como realizar: ${shortPrompt}`,
    spokenAnswer: `Oi! Que bom que você me perguntou. Fique bem tranquilo que ninguém nasce sabendo e estamos aqui para aprender juntos, sem pressa nenhuma! Preparei um passo a passo bem explicadinho na tela para você.`,
    taskSlug: "tarefa-personalizada",
    appSlug: "banco-demonstracao",
    appName: "Aplicativo",
    steps: [
      {
        order: 1,
        title: "Abra o aplicativo no celular",
        instruction: "Procure o ícone do aplicativo na tela do seu celular e toque com calma.",
        voiceInstruction: "Primeiro passo: abra o aplicativo do seu celular com calma.",
        targetLabel: "Toque no ícone",
        imageAlt: "Ícone do aplicativo em destaque na tela inicial.",
      },
      {
        order: 2,
        title: "Localize a opção desejada",
        instruction: `Na tela inicial do aplicativo, procure a área relacionada a '${userPrompt}'.`,
        voiceInstruction: "Passo dois: procure a opção no menu do aplicativo.",
        targetLabel: "Opção do menu",
        imageAlt: "Menu de opções do aplicativo com item em destaque.",
      },
      {
        order: 3,
        title: "Confira todas as informações",
        instruction: "Leia atentamente os dados mostrados na tela antes de continuar.",
        voiceInstruction: "Passo três: confira todos os dados na tela antes de tocar em qualquer botão.",
        targetLabel: "Conferir",
        imageAlt: "Tela de confirmação de dados.",
      },
      {
        order: 4,
        title: "Pare antes de qualquer senha",
        instruction: "Nunca compartilhe sua senha de segurança com ninguém por mensagem ou telefone.",
        voiceInstruction: "Dica de ouro do Guido: nunca passe sua senha pessoal para ninguém que pedir.",
        warning: "O Guido nunca pede sua senha. O banco nunca manda ninguém na sua casa buscar cartão.",
        targetLabel: "Atenção à segurança",
        imageAlt: "Alerta de segurança na tela.",
      },
    ],
    isAiGenerated: false,
  };
}
