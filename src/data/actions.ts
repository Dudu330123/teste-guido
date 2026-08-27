import type { Action, Task } from "@/types/content";

export const actions: Action[] = [
  {
    id: "pix",
    title: "Como fazer Pix",
    taskTitle: "Fazer Pix",
    slug: "pix",
    description: "Entenda onde normalmente fica a área Pix, sem enviar dinheiro.",
    searchTerms: ["piks", "pikis", "piquis", "transferir dinheiro", "mandar dinheiro", "chave pix", "transferência", "enviar dinheiro", "receber dinheiro", "pagamento instantâneo"],
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
    id: "comprovante",
    title: "Como ver comprovante",
    taskTitle: "Ver comprovante",
    slug: "comprovante",
    description: "Saiba onde procurar o histórico ou recibo de uma operação.",
    searchTerms: ["conprovante", "comprovanti", "recibo", "histórico", "extrato", "pagamento feito", "comprovante de pagamento"],
  },
  {
    id: "bloquear-cartao",
    title: "Como bloquear cartão",
    taskTitle: "Bloquear cartão",
    slug: "bloquear-cartao",
    description: "Encontre a área de cartões em uma situação de perda ou suspeita.",
    searchTerms: ["perdi cartão", "cartão roubado", "cartao perdido", "travar cartão", "bloquear cartão", "compra estranha"],
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
    id: "limite",
    title: "Como encontrar o limite",
    taskTitle: "Encontrar limite do cartão",
    slug: "limite",
    description: "Localize a área que apresenta o limite do cartão.",
    searchTerms: ["aumentar limite", "mais limite", "limiti", "limite cartão", "limite disponível", "limite usado"],
  },
];

export function getActionBySlug(slug: string) {
  return actions.find((action) => action.slug === slug);
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
