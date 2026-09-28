export interface TvTask {
  id: string;
  slug: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  stepsCount: number;
}

export const tvTasks: TvTask[] = [
  {
    id: "tv-netflix",
    slug: "netflix-tv",
    title: "Netflix na TV",
    category: "Filmes e Séries",
    icon: "🎬",
    description: "Aprenda a abrir a Netflix, escolher seu perfil e dar play em um filme.",
    stepsCount: 4,
  },
  {
    id: "tv-youtube",
    slug: "youtube-tv",
    title: "YouTube na TV",
    category: "Vídeos e Música",
    icon: "▶️",
    description: "Saiba como pesquisar vídeos de receitas, músicas e canais na televisão.",
    stepsCount: 4,
  },
  {
    id: "tv-wifi",
    slug: "conectar-wifi-tv",
    title: "Conectar Wi-Fi na TV",
    category: "Internet e Ajustes",
    icon: "📶",
    description: "Veja como encontrar o Wi-Fi da sua casa e digitar a senha na Smart TV.",
    stepsCount: 5,
  },
  {
    id: "tv-controle",
    slug: "usar-controle-remoto-tv",
    title: "Usar o Controle Remoto",
    category: "Controle e Canais",
    icon: "🕹️",
    description: "Entenda para que serve cada botão: Casinha (Home), Voltar, Volume e Entradas.",
    stepsCount: 4,
  },
];
