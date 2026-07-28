import type { Action } from "@/types/content";

export const actions: Action[] = [
  {
    id: "pix",
    title: "Como fazer Pix",
    taskTitle: "Fazer Pix",
    slug: "pix",
    description: "Entenda onde normalmente fica a área Pix, sem enviar dinheiro.",
    searchTerms: ["piks", "pikis", "piquis", "transferir dinheiro", "mandar dinheiro", "chave pix"],
  },
  {
    id: "boleto",
    title: "Como pagar boleto",
    taskTitle: "Pagar boleto",
    slug: "boleto",
    description: "Reconheça as etapas comuns de um boleto, sem confirmar pagamento.",
    searchTerms: ["bole", "boletu", "pagar conta", "código de barras", "linha digitável"],
  },
  {
    id: "comprovante",
    title: "Como ver comprovante",
    taskTitle: "Ver comprovante",
    slug: "comprovante",
    description: "Saiba onde procurar o histórico ou recibo de uma operação.",
    searchTerms: ["conprovante", "comprovanti", "recibo", "histórico", "pagamento feito"],
  },
  {
    id: "bloquear-cartao",
    title: "Como bloquear cartão",
    taskTitle: "Bloquear cartão",
    slug: "bloquear-cartao",
    description: "Encontre a área de cartões em uma situação de perda ou suspeita.",
    searchTerms: ["perdi cartão", "cartão roubado", "travar cartão", "compra estranha"],
  },
  {
    id: "saldo",
    title: "Como ver saldo",
    taskTitle: "Ver saldo",
    slug: "saldo",
    description: "Aprenda onde procurar o dinheiro disponível na conta.",
    searchTerms: ["quanto tenho", "dinheiro na conta", "consultar saldo", "ver conta"],
  },
  {
    id: "limite",
    title: "Como encontrar o limite",
    taskTitle: "Encontrar limite do cartão",
    slug: "limite",
    description: "Localize a área que apresenta o limite do cartão.",
    searchTerms: ["aumentar limite", "mais limite", "limiti", "limite cartão"],
  },
];

export function getActionBySlug(slug: string) {
  return actions.find((action) => action.slug === slug);
}
