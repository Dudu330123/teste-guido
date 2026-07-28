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
    safetyWarning: "Conteúdo em preparação e ainda sem guia validado.",
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
    safetyWarning: "Conteúdo em preparação e ainda sem guia validado.",
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
    safetyWarning: "Conteúdo em preparação e ainda sem guia validado.",
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
    safetyWarning: "Conteúdo em preparação. Nunca informe códigos de acesso fora do aplicativo ou site oficial.",
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
    safetyWarning: "Conteúdo em preparação. O Guido nunca pede sua senha ou código de recuperação.",
    searchTerms: ["esqueci senha", "senha gov", "recuperar conta", "não consigo entrar"],
    availability: "preparing",
    status: "draft",
  },
];

const genericTaskDefinitions: Array<[string, string, string, string, string[]]> = [
  ["pagar-conta-codigo-barras", "boleto", "Pagar conta com código de barras", "Reconheça as opções comuns para contas de consumo.", ["conta de luz", "conta de água", "cod barras"]],
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
  safetyWarning: "Conteúdo recuperado como rascunho e pendente de pesquisa e validação humana.",
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
    description: `${action.description} Conteúdo de ${application.name} ainda não validado.`,
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
  guideVersion: "0.1-demo",
  lastReviewedAt: null,
  status: "draft",
  estimatedMinutes: 4,
}));

const stepContent = [
  {
    title: "Abra o aplicativo",
    instruction: "Toque no aplicativo oficial do seu banco para abri-lo.",
    imageAlt: "Tela inicial fictícia de celular com um aplicativo genérico de banco destacado.",
  },
  {
    title: "Procure Pagamentos",
    instruction: "Na tela inicial do banco, procure uma opção com o texto Pagamentos.",
    imageAlt: "Tela bancária fictícia com a opção Pagamentos destacada.",
  },
  {
    title: "Escolha boleto",
    instruction: "Toque na opção relacionada a pagamento de boleto.",
    imageAlt: "Menu fictício de pagamentos com a opção Boleto destacada.",
  },
  {
    title: "Escolha como informar o código",
    instruction: "Escolha entre usar a câmera ou digitar o código. Não informe nenhum dado neste guia.",
    imageAlt: "Tela fictícia oferecendo leitura por câmera ou digitação, sem dados reais.",
  },
  {
    title: "Confira as informações",
    instruction: "Antes de continuar no banco, confira com calma todos os dados mostrados.",
    imageAlt: "Tela fictícia de conferência com campos genéricos e sem valores ou pessoas reais.",
  },
  {
    title: "Pare antes de confirmar",
    instruction: "O guia termina aqui. Volte ao aplicativo do banco somente se estiver seguro.",
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
