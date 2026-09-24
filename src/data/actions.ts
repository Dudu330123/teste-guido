import type { Action, Task } from "@/types/content";

export const actions: Action[] = [
  {
    id: "pix",
    title: "Como fazer Pix",
    taskTitle: "Fazer Pix",
    slug: "pix",
    description: "Entenda onde normalmente começa uma transferência Pix, sem enviar dinheiro.",
    searchTerms: ["piks", "pikis", "piquis", "transferir dinheiro", "mandar dinheiro", "chave pix", "transferência", "enviar dinheiro", "receber dinheiro", "pagamento instantâneo"],
  },
  {
    id: "enviar-pix-chave",
    title: "Como enviar Pix usando chave",
    taskTitle: "Enviar Pix usando chave",
    slug: "enviar-pix-chave",
    description: "Entenda o conceito de chave Pix sem informar dados.",
    searchTerms: ["chave piks", "pix contato", "chave pix", "transferência chave"],
  },
  {
    id: "pagar-pix-qr-code",
    title: "Como usar Pix por QR Code",
    taskTitle: "Usar Pix por QR Code",
    slug: "pagar-pix-qr-code",
    description: "Reconheça a opção de QR Code sem abrir câmera ou imagem.",
    searchTerms: ["qrcode pix", "qr pix", "pagar qr code", "ler qr code"],
  },
  {
    id: "cobrar-via-pix",
    title: "Como cobrar via Pix",
    taskTitle: "Cobrar via Pix",
    slug: "cobrar-via-pix",
    description: "Entenda onde normalmente fica a opção de cobrança Pix, sem criar uma cobrança real.",
    searchTerms: ["como cobrar pix", "receber pix", "pedir pix", "cobrança pix"],
  },
  {
    id: "boleto",
    title: "Como pagar boleto",
    taskTitle: "Pagar boleto",
    slug: "boleto",
    description: "Reconheça as etapas comuns de um boleto, sem confirmar pagamento.",
    searchTerms: ["bole", "boletu", "pagar conta", "conta de luz", "conta de água", "fatura", "código de barras", "linha digitável", "pagamento de conta"],
  },
  {
    id: "pagar-conta-codigo-barras",
    title: "Como pagar conta com código de barras",
    taskTitle: "Pagar conta com código de barras",
    slug: "pagar-conta-codigo-barras",
    description: "Reconheça as opções comuns para contas de consumo.",
    searchTerms: ["conta de luz", "conta de água", "cod barras", "codigo de barras", "leitor boleto"],
  },
  {
    id: "comprovante",
    title: "Como ver comprovante",
    taskTitle: "Ver comprovante",
    slug: "comprovante",
    description: "Saiba onde procurar o histórico ou recibo de uma operação.",
    searchTerms: ["conprovante", "comprovanti", "recibo", "histórico", "extrato", "pagamento feito", "comprovante de pagamento"],
  },
  {
    id: "saldo",
    title: "Como ver saldo",
    taskTitle: "Ver saldo",
    slug: "saldo",
    description: "Aprenda onde procurar o dinheiro disponível na conta.",
    searchTerms: ["quanto tenho", "dinheiro na conta", "consultar saldo", "ver conta", "saldo disponível", "extrato da conta"],
  },
  {
    id: "trocar-senha-app-banco",
    title: "Como trocar senha do aplicativo",
    taskTitle: "Trocar senha do aplicativo",
    slug: "trocar-senha-app-banco",
    description: "Encontre orientações oficiais de segurança sem informar sua senha ao Guido.",
    searchTerms: ["esqueci senha", "senha banco", "alterar senha", "segurança conta"],
  },
  {
    id: "bloquear-cartao",
    title: "Como bloquear cartão",
    taskTitle: "Bloquear cartão",
    slug: "bloquear-cartao",
    description: "Aprenda a encontrar a opção de bloqueio temporário ou definitivo do seu cartão.",
    searchTerms: ["bloquear cartao", "cartao perdido", "perdi o cartao", "roubo de cartao", "cancelar cartao", "travar cartao"],
  },
  {
    id: "falar-atendimento-banco-app",
    title: "Como encontrar atendimento oficial",
    taskTitle: "Encontrar atendimento oficial",
    slug: "falar-atendimento-banco-app",
    description: "Saiba como procurar ajuda dentro do aplicativo oficial do banco.",
    searchTerms: ["chat banco", "suporte", "falar banco", "atendimento", "ajuda", "falar com atendente"],
  },
];

export const actionToGuideSlug: Record<string, string> = {
  pix: "fazer-pix",
  "fazer-pix": "fazer-pix",
  boleto: "pagar-boleto",
  "pagar-boleto": "pagar-boleto",
  comprovante: "ver-comprovante-pix",
  "ver-comprovante-pix": "ver-comprovante-pix",
  saldo: "saldo",
  "cobrar-via-pix": "cobrar-via-pix",
  "enviar-pix-chave": "enviar-pix-chave",
  "pagar-pix-qr-code": "pagar-pix-qr-code",
  "pagar-conta-codigo-barras": "pagar-conta-codigo-barras",
  "trocar-senha-app-banco": "trocar-senha-app-banco",
  "bloquear-cartao": "bloquear-cartao",
  "falar-atendimento-banco-app": "falar-atendimento-banco-app",
};

export function getActionBySlug(slug: string) {
  return actions.find((action) => action.slug === slug || action.id === slug);
}

/** Resolve tarefas vindas do Supabase mesmo quando a coluna action_id ainda não existe. */
export function getActionForTask(task: Pick<Task, "actionId" | "slug" | "title" | "searchTerms">) {
  if (task.actionId) {
    const explicitAction = getActionBySlug(task.actionId);
    if (explicitAction) return explicitAction;
  }
  const taskText = `${task.slug} ${task.title} ${task.searchTerms.join(" ")}`
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return actions.find((action) =>
    taskText.includes(action.slug)
    || taskText.includes(action.taskTitle.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())
    || action.searchTerms.some((term) => taskText.includes(term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())),
  );
}
