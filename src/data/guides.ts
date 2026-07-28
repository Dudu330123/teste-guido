import type { Guide, GuideStep, Task } from "@/types/content";

export const tasks: Task[] = [
  {
    id: "task-pagar-boleto-demo",
    applicationId: "app-demo-bancos",
    title: "Pagar um boleto",
    slug: "pagar-boleto",
    description: "Aprenda a reconhecer as etapas comuns, sem realizar um pagamento.",
    difficulty: "medium",
    safetyWarning: "Conteúdo demonstrativo, não oficial e pendente de validação humana.",
    status: "draft",
  },
];

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
