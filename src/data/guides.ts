import { actions } from "@/data/actions";
import { financialApplications } from "@/data/applications";
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
  {
    id: "task-enviar-audio-whatsapp",
    applicationId: "app-whatsapp",
    title: "Enviar um áudio",
    slug: "enviar-audio-whatsapp",
    description: "Aprenda a gravar e enviar uma mensagem de voz.",
    difficulty: "easy",
    safetyWarning: "Guia em preparação. Ainda não há conteúdo validado.",
    searchTerms: ["mandar áudio", "mensagem de voz", "audio", "gravar voz", "zap"],
    availability: "preparing",
    status: "draft",
  },
  {
    id: "task-fazer-chamada-whatsapp",
    applicationId: "app-whatsapp",
    title: "Fazer uma chamada",
    slug: "fazer-chamada-whatsapp",
    description: "Aprenda a iniciar uma ligação pelo WhatsApp.",
    difficulty: "easy",
    safetyWarning: "Guia em preparação. Ainda não há conteúdo validado.",
    searchTerms: ["ligar", "ligação", "telefonar", "chamada de voz", "zap"],
    availability: "preparing",
    status: "draft",
  },
  {
    id: "task-bloquear-contato-whatsapp",
    applicationId: "app-whatsapp",
    title: "Bloquear um contato",
    slug: "bloquear-contato-whatsapp",
    description: "Saiba onde procurar a opção de bloquear uma pessoa.",
    difficulty: "easy",
    safetyWarning: "Guia em preparação. Ainda não há conteúdo validado.",
    searchTerms: ["bloquear pessoa", "contato indesejado", "mensagem suspeita", "zap"],
    availability: "preparing",
    status: "draft",
  },
  {
    id: "task-acessar-gov-br",
    applicationId: "app-gov-br",
    title: "Acessar o Gov.br",
    slug: "acessar-gov-br",
    description: "Aprenda a localizar o acesso à sua conta Gov.br.",
    difficulty: "medium",
    safetyWarning: "Guia em preparação. Nunca informe códigos de acesso fora do aplicativo ou site oficial.",
    searchTerms: ["entrar gov", "conta governo", "login gov", "acessar governo"],
    availability: "preparing",
    status: "draft",
  },
  {
    id: "task-recuperar-senha-gov-br",
    applicationId: "app-gov-br",
    title: "Recuperar a senha do Gov.br",
    slug: "recuperar-senha-gov-br",
    description: "Saiba como encontrar o processo oficial de recuperação de acesso.",
    difficulty: "medium",
    safetyWarning: "Guia em preparação. O Guido nunca pede sua senha ou código de recuperação.",
    searchTerms: ["esqueci senha", "senha gov", "recuperar conta", "não consigo entrar"],
    availability: "preparing",
    status: "draft",
  },
];

const genericTaskDefinitions: Array<[string, string, string, string, string[]]> = [
  ["pagar-conta-codigo-barras", "boleto", "Pagar conta com código de barras", "Reconheça as opções comuns para contas de consumo.", ["conta de luz", "conta de água", "cod barras"]],
  ["fazer-pix", "pix", "Fazer Pix", "Entenda onde normalmente começa uma transferência Pix, sem enviar dinheiro.", ["como fazer pix", "enviar pix", "transferir pix"]],
  ["ver-comprovante-pix", "comprovante", "Ver comprovante Pix", "Saiba onde normalmente procurar o recibo de uma transferência Pix.", ["comprovante pix", "recibo pix", "pix feito"]],
  ["cobrar-via-pix", "pix", "Cobrar via Pix", "Entenda onde normalmente fica a opção de cobrança Pix, sem criar uma cobrança real.", ["como cobrar pix", "receber pix", "pedir pix", "cobrança pix"]],
  ["enviar-pix-chave", "pix", "Enviar Pix usando chave", "Entenda o conceito de chave Pix sem informar dados.", ["chave piks", "pix contato"]],
  ["pagar-pix-qr-code", "pix", "Usar Pix por QR Code", "Reconheça a opção de QR Code sem abrir câmera ou imagem.", ["qrcode pix", "qr pix"]],
  ["baixar-segunda-via-boleto", "boleto", "Encontrar segunda via de boleto", "Saiba como procurar o canal oficial de quem emitiu a conta.", ["2 via", "boleto novo", "segunda bia"]],
  ["trocar-senha-app-banco", "seguranca", "Trocar senha do aplicativo", "Encontre orientações oficiais de segurança sem informar sua senha ao Guido.", ["esqueci senha", "senha banco"]],
  ["identificar-golpe-bancario", "seguranca", "Identificar golpe bancário", "Conheça sinais de mensagens e pedidos suspeitos.", ["goupe", "fralde", "mensagem suspeita"]],
  ["caiu-em-golpe-banco", "seguranca", "O que fazer ao suspeitar de golpe", "Pare o contato e procure imediatamente os canais oficiais.", ["fui roubado", "perdi dinheiro", "fraude"]],
  ["falar-atendimento-banco-app", "atendimento", "Encontrar atendimento oficial", "Saiba como procurar ajuda dentro do aplicativo oficial.", ["chat banco", "suporte", "falar banco"]],
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

const applicationTasks: Task[] = financialApplications.flatMap((application) =>
  actions.map((action) => ({
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
  })),
);

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
  })),
);

export function getGuide(operatingSystem: "android" | "ios") {
  return guides.find((guide) => guide.operatingSystem === operatingSystem);
}

export function getStepsForGuide(guideId: string) {
  return guideSteps.filter((step) => step.guideId === guideId).sort((a, b) => a.order - b.order);
}
