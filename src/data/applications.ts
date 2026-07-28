import type { Application } from "@/types/content";

const baseDate = "2026-07-28T00:00:00.000Z";

const preparingApplications: Array<[string, string, string, string, string[]]> = [
  ["whatsapp", "WhatsApp", "Comunicação", "Mensagens, áudios e chamadas.", ["zap", "mensagem", "áudio", "ligação", "contato"]],
  ["gov-br", "Gov.br", "Serviços públicos", "Acesso a serviços digitais do governo.", ["governo", "conta gov", "senha gov", "serviço público"]],
  ["caixa", "Caixa", "Serviços financeiros", "Serviços do aplicativo bancário.", ["caixa econômica", "caicha"]],
  ["banco-do-brasil", "Banco do Brasil", "Serviços financeiros", "Serviços do aplicativo bancário.", ["bb", "banco brasil"]],
  ["itau", "Itaú", "Serviços financeiros", "Serviços do aplicativo bancário.", ["itau", "itaú"]],
  ["bradesco", "Bradesco", "Serviços financeiros", "Serviços do aplicativo bancário.", ["bradescu"]],
  ["santander", "Santander", "Serviços financeiros", "Serviços do aplicativo bancário.", ["santander banco"]],
  ["nubank", "Nubank", "Serviços financeiros", "Serviços do aplicativo bancário.", ["nu bank", "roxinho"]],
  ["banco-inter", "Banco Inter", "Serviços financeiros", "Serviços do aplicativo bancário.", ["inter", "banco inter"]],
  ["picpay", "PicPay", "Serviços financeiros", "Serviços da carteira digital.", ["pic pay", "picpei"]],
  ["mercado-pago", "Mercado Pago", "Serviços financeiros", "Serviços da carteira digital.", ["mercadopago", "mercado pix"]],
  ["c6-bank", "C6 Bank", "Serviços financeiros", "Serviços do aplicativo bancário.", ["c6", "c6 banco"]],
];

export const applications: Application[] = [
  {
    id: "app-demo-bancos",
    name: "Banco — demonstração",
    slug: "banco-demonstracao",
    description: "Exemplo educativo genérico, sem vínculo com qualquer banco.",
    category: "Serviços financeiros",
    logoPath: null,
    searchTerms: ["banco", "boleto", "pagamento", "conta", "código de barras"],
    status: "available",
    createdAt: baseDate,
    updatedAt: baseDate,
  },
  ...preparingApplications.map(([slug, name, category, description, searchTerms]) => ({
    id: `app-${slug}`,
    name,
    slug,
    description,
    category,
    logoPath: null,
    searchTerms,
    status: "preparing" as const,
    createdAt: baseDate,
    updatedAt: baseDate,
  })),
];

export function getApplicationBySlug(slug: string) {
  return applications.find((application) => application.slug === slug);
}

export const financialApplications = applications.filter(
  (application) => application.category === "Serviços financeiros" && application.id !== "app-demo-bancos",
);
