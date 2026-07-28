import type { Application } from "@/types/content";

const baseDate = "2026-07-28T00:00:00.000Z";

export const applications: Application[] = [
  {
    id: "app-demo-bancos",
    name: "Banco — demonstração",
    slug: "banco-demonstracao",
    description: "Exemplo educativo genérico, sem vínculo com qualquer banco.",
    category: "Serviços financeiros",
    logoPath: null,
    status: "available",
    createdAt: baseDate,
    updatedAt: baseDate,
  },
  ...[
    ["whatsapp", "WhatsApp", "Comunicação", "Mensagens, áudios e chamadas."],
    ["gov-br", "Gov.br", "Serviços públicos", "Acesso a serviços digitais do governo."],
    ["caixa", "Caixa", "Serviços financeiros", "Serviços do aplicativo bancário."],
    ["banco-do-brasil", "Banco do Brasil", "Serviços financeiros", "Serviços do aplicativo bancário."],
    ["itau", "Itaú", "Serviços financeiros", "Serviços do aplicativo bancário."],
    ["bradesco", "Bradesco", "Serviços financeiros", "Serviços do aplicativo bancário."],
    ["santander", "Santander", "Serviços financeiros", "Serviços do aplicativo bancário."],
    ["nubank", "Nubank", "Serviços financeiros", "Serviços do aplicativo bancário."],
  ].map(([slug, name, category, description]) => ({
    id: `app-${slug}`,
    name,
    slug,
    description,
    category,
    logoPath: null,
    status: "preparing" as const,
    createdAt: baseDate,
    updatedAt: baseDate,
  })),
];

export function getApplicationBySlug(slug: string) {
  return applications.find((application) => application.slug === slug);
}
