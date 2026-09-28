import { actions } from "@/data/actions";
import { financialApplications } from "@/data/applications";
import { govBrTasks } from "@/data/gov-br-guides";
import { otherAppsTasks } from "@/data/other-apps-guides";
import { whatsappTasks } from "@/data/whatsapp-guides";
import type { Guide, GuideStep, Task } from "@/types/content";

const coreTasks: Task[] = [
  {
    id: "task-pagar-boleto-demo",
    applicationId: "app-demo-bancos",
    actionId: "boleto",
    title: "Pagar um boleto",
    slug: "pagar-boleto",
    description: "Aprenda a reconhecer as etapas comuns, sem realizar um pagamento.",
    difficulty: "medium",
    safetyWarning: "Conteúdo demonstrativo, não oficial e pendente de validação humana.",
    searchTerms: ["bole", "boletu", "pagar conta", "código de barras", "linha digitável"],
    availability: "demo",
    status: "draft",
  },
  ...whatsappTasks,
  ...govBrTasks,
  ...otherAppsTasks,
];

const genericTaskDefinitions: Array<[string, string, string, string, string[]]> = [
  ["fazer-pix", "pix", "Fazer Pix", "Entenda onde normalmente começa uma transferência Pix, sem enviar dinheiro.", ["como fazer pix", "enviar pix", "transferir pix"]],
  ["enviar-pix-chave", "enviar-pix-chave", "Enviar Pix usando chave", "Entenda o conceito de chave Pix sem informar dados.", ["chave piks", "pix contato"]],
  ["pagar-pix-qr-code", "pagar-pix-qr-code", "Usar Pix por QR Code", "Reconheça a opção de QR Code sem abrir câmera ou imagem.", ["qrcode pix", "qr pix"]],
  ["cobrar-via-pix", "cobrar-via-pix", "Cobrar via Pix", "Entenda onde normalmente fica a opção de cobrança Pix, sem criar uma cobrança real.", ["como cobrar pix", "receber pix", "pedir pix", "cobrança pix"]],
  ["pagar-conta-codigo-barras", "pagar-conta-codigo-barras", "Pagar conta com código de barras", "Reconheça as opções comuns para contas de consumo.", ["conta de luz", "conta de água", "cod barras"]],
  ["ver-comprovante-pix", "comprovante", "Ver comprovante Pix", "Saiba onde normalmente procurar o recibo de uma transferência Pix.", ["comprovante pix", "recibo pix", "pix feito"]],
  ["saldo", "saldo", "Ver saldo", "Saiba onde conferir o valor disponível na sua conta.", ["quanto tenho", "dinheiro na conta", "consultar saldo", "ver conta", "saldo disponível", "extrato da conta"]],
  ["trocar-senha-app-banco", "trocar-senha-app-banco", "Trocar senha do aplicativo", "Encontre orientações oficiais de segurança sem informar sua senha ao Guido.", ["esqueci senha", "senha banco"]],
  ["baixar-segunda-via-boleto", "boleto", "Encontrar segunda via de boleto", "Saiba como procurar o canal oficial de quem emitiu a conta.", ["2 via", "boleto novo", "segunda bia"]],
  ["identificar-golpe-bancario", "seguranca", "Identificar golpe bancário", "Conheça sinais de mensagens e pedidos suspeitos.", ["goupe", "fralde", "mensagem suspeita"]],
  ["caiu-em-golpe-banco", "seguranca", "O que fazer ao suspeitar de golpe", "Pare o contato e procure imediatamente os canais oficiais.", ["fui roubado", "perdi dinheiro", "fraude"]],
  ["falar-atendimento-banco-app", "falar-atendimento-banco-app", "Encontrar atendimento oficial", "Saiba como procurar ajuda dentro do aplicativo oficial.", ["chat banco", "suporte", "falar banco"]],
  ["bloquear-cartao", "bloquear-cartao", "Bloquear cartão", "Aprenda a encontrar a opção de bloqueio temporário ou definitivo do seu cartão.", ["bloquear cartao", "cartao perdido", "perdi o cartao", "roubo de cartao", "cancelar cartao"]],
];

const additionalGenericTasks: Task[] = genericTaskDefinitions.map(([slug, actionId, title, description, searchTerms]) => ({
  id: `task-${slug}`,
  applicationId: "app-demo-bancos",
  actionId,
  title,
  slug,
  description,
  difficulty: "medium" as const,
  safetyWarning: "Guia em preparação. Este conteúdo ainda depende de pesquisa e validação humana.",
  searchTerms,
  availability: "preparing" as const,
  status: "draft" as const,
}));

export const bankCompletedGuides: Record<string, string[]> = {
  "banco-do-brasil": [
    "pix",
    "enviar-pix-chave",
    "pagar-pix-qr-code",
    "cobrar-via-pix",
    "boleto",
    "pagar-conta-codigo-barras",
    "comprovante",
    "saldo",
    "trocar-senha-app-banco",
    "bloquear-cartao",
    "falar-atendimento-banco-app",
  ],
  "banco-inter": [
    "pix",
    "enviar-pix-chave",
    "pagar-pix-qr-code",
    "cobrar-via-pix",
    "boleto",
    "pagar-conta-codigo-barras",
    "comprovante",
    "saldo",
    "trocar-senha-app-banco",
    "bloquear-cartao",
    "falar-atendimento-banco-app",
  ],
  "mercado-pago": [
    "pix",
    "enviar-pix-chave",
    "pagar-pix-qr-code",
    "cobrar-via-pix",
    "boleto",
    "pagar-conta-codigo-barras",
    "comprovante",
    "saldo",
    "trocar-senha-app-banco",
    "bloquear-cartao",
    "falar-atendimento-banco-app",
  ],
  nubank: [
    "pix",
    "enviar-pix-chave",
    "pagar-pix-qr-code",
    "cobrar-via-pix",
    "boleto",
    "pagar-conta-codigo-barras",
    "comprovante",
    "saldo",
    "trocar-senha-app-banco",
    "bloquear-cartao",
    "falar-atendimento-banco-app",
  ],
  picpay: [
    "pix",
    "enviar-pix-chave",
    "pagar-pix-qr-code",
    "cobrar-via-pix",
    "boleto",
    "pagar-conta-codigo-barras",
    "comprovante",
    "saldo",
    "trocar-senha-app-banco",
    "bloquear-cartao",
    "falar-atendimento-banco-app",
  ],
  bradesco: [
    "pix",
    "enviar-pix-chave",
    "pagar-pix-qr-code",
    "cobrar-via-pix",
    "boleto",
    "pagar-conta-codigo-barras",
    "comprovante",
    "saldo",
    "trocar-senha-app-banco",
  ],
  santander: [
    "pix",
    "enviar-pix-chave",
    "pagar-pix-qr-code",
    "cobrar-via-pix",
    "boleto",
    "pagar-conta-codigo-barras",
    "comprovante",
    "saldo",
    "trocar-senha-app-banco",
  ],
  caixa: [
    "pix",
    "enviar-pix-chave",
    "pagar-pix-qr-code",
    "cobrar-via-pix",
    "boleto",
    "pagar-conta-codigo-barras",
    "comprovante",
    "saldo",
    "trocar-senha-app-banco",
  ],
};

const applicationTasks: Task[] = financialApplications.flatMap((application) => {
  const allowedActionIds = new Set(
    bankCompletedGuides[application.slug] ?? actions.map((action) => action.id),
  );
  return actions
    .filter((action) => allowedActionIds.has(action.id))
    .map((action) => ({
      id: `task-${action.id}-${application.slug}`,
      applicationId: application.id,
      actionId: action.id,
      title: action.taskTitle,
      slug: `${action.slug}-${application.slug}`,
      description: `${action.description} O guia de ${application.name} ainda está em revisão.`,
      difficulty: "medium" as const,
      safetyWarning: "Guia em preparação. Não siga este registro como tutorial oficial.",
      searchTerms: [...action.searchTerms, application.name, ...application.searchTerms],
      availability: "preparing" as const,
      status: "draft" as const,
    }));
});

export const tasks: Task[] = [...coreTasks, ...additionalGenericTasks, ...applicationTasks];

export const guides: Guide[] = (["android", "ios"] as const).map((operatingSystem) => ({
  id: `guide-pagar-boleto-${operatingSystem}`,
  taskId: "task-pagar-boleto-demo",
  operatingSystem,
  appVersion: "genérica",
  guideVersion: "0.2-research",
  lastReviewedAt: null,
  status: "draft",
  estimatedMinutes: 4,
}));

// Este fluxo reúne somente ações confirmadas em fontes institucionais. Ele continua
// genérico porque nomes e posições de controles variam por banco, versão e sistema.
const stepContent = [
  {
    title: "Abra o aplicativo oficial",
    instruction: "Confirme o nome do seu banco e toque no aplicativo oficial para abri-lo.",
    imageAlt: "Tela inicial demonstrativa de celular com o aplicativo oficial do banco destacado.",
  },
  {
    title: "Encontre a área de pagamento",
    instruction: "Depois de entrar na sua conta, procure Pagamentos, Pagar ou Pagar e transferir.",
    imageAlt: "Tela bancária demonstrativa com a área de pagamento destacada.",
  },
  {
    title: "Escolha pagar boleto",
    instruction: "Toque em Boleto, Código de barras ou uma opção com nome parecido.",
    imageAlt: "Área demonstrativa de pagamentos com a opção de boleto ou código de barras destacada.",
  },
  {
    title: "Informe o código no banco",
    instruction: "No aplicativo do banco, escolha ler o código com a câmera ou digitar os números do boleto.",
    imageAlt: "Tela demonstrativa oferecendo leitura por câmera ou digitação do código, sem dados reais.",
  },
  {
    title: "Confira antes de pagar",
    instruction: "Compare o nome de quem receberá, o valor e o vencimento com o boleto. Se algo estiver diferente, pare.",
    imageAlt: "Tela demonstrativa de conferência com beneficiário, valor e vencimento fictícios.",
    warning: "Não continue se o aplicativo mostrar um recebedor ou valor diferente do boleto.",
  },
  {
    title: "Pare antes de confirmar",
    instruction: "O guia termina aqui, antes da senha e da confirmação. Só continue no banco se todos os dados estiverem corretos.",
    imageAlt: "Aviso de segurança indicando que o Guido não realiza nem confirma pagamentos.",
    warning:
      "Confira cuidadosamente o nome de quem receberá, o valor e o vencimento. O Guido nunca pede sua senha e nunca confirma pagamentos por você.",
    confirmationMessage: "Demonstração concluída sem realizar qualquer operação bancária.",
  },
];

export const guideSteps: GuideStep[] = guides.flatMap((guide) =>
  stepContent.map((step, index) => ({
    ...step,
    id: `${guide.id}-step-${index + 1}`,
    guideId: guide.id,
    order: index + 1,
    imagePath: `/guide-placeholders/step-${index + 1}.svg`,
    audioPath: `/audio/guias/pagar-boleto/step-${index + 1}.mp3`,
  })),
);

export function getGuide(operatingSystem: "android" | "ios") {
  return guides.find((guide) => guide.operatingSystem === operatingSystem);
}

export function getStepsForGuide(guideId: string) {
  return guideSteps.filter((step) => step.guideId === guideId).sort((a, b) => a.order - b.order);
}
