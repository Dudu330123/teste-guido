import type { Application, Task } from "@/types/content";
import { normalizeSearch } from "./search-content";

export const learningCategories = [
  { id: "banks", title: "Bancos e Pix", description: "Aprenda a fazer Pix, pagar contas e usar seu banco.", icon: "bank" },
  { id: "whatsapp", title: "WhatsApp e mensagens", description: "Converse com a família por mensagem, áudio ou vídeo.", icon: "message" },
  { id: "government", title: "Serviços do governo", description: "Encontre ajuda com sua conta Gov.br e serviços públicos.", icon: "government" },
  { id: "safety", title: "Segurança contra golpes", description: "Aprenda a reconhecer mensagens e pedidos suspeitos.", icon: "shield" },
  { id: "photos", title: "Fotos e vídeos", description: "Encontre suas lembranças e aprenda a compartilhar.", icon: "photos" },
  { id: "settings", title: "Configurações do celular", description: "Ajuste o som, a internet e outras opções do aparelho.", icon: "settings" },
  { id: "accessibility", title: "Acessibilidade", description: "Veja melhor a tela e deixe o celular mais fácil de usar.", icon: "accessibility" },
  { id: "others", title: "Outros aplicativos", description: "Use e-mail, mapas, transporte e mais aplicativos.", icon: "apps" },
] as const;

export type LearningCategory = typeof learningCategories[number];

/** Classifica o catálogo atual sem criar guias nem promover rascunhos a publicados. */
export function categoryTasks(id: LearningCategory["id"], tasks: Task[], applications: Application[]) {
  const apps = new Map(applications.map((app) => [app.id, app]));
  return tasks.filter((task) => {
    const app = apps.get(task.applicationId);
    const text = normalizeSearch(`${task.title} ${task.searchTerms.join(" ")}`);
    switch (id) {
      case "banks": return app?.category === "Serviços financeiros" && app.id !== "app-demo-bancos";
      case "whatsapp": return app?.slug === "whatsapp";
      case "government": return app?.slug === "gov-br";
      case "safety": return /golpe|codigo|perder celular|celular perdido|seguranca/.test(text);
      case "photos": return /foto|video|youtube/.test(text);
      case "settings": return /configur|wi fi|wifi|volume|brilho|internet/.test(text);
      case "accessibility": return /acessibilidade|letra|fonte|leitor de tela|zoom/.test(text);
      case "others": return !app || (app.category !== "Serviços financeiros" && !["whatsapp", "gov-br"].includes(app.slug));
    }
  });
}

export function availableGuideCount(tasks: Task[]) {
  return tasks.filter((task) => task.status === "published" && task.availability === "available").length;
}
