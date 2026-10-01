import type { Application, Task } from "@/types/content";
import type { EditorialStep } from "@/data/gov-br-guides";

const baseDate = "2026-07-28T00:00:00.000Z";

export const externalApplications: Application[] = [
  {
    id: "app-gmail",
    name: "Gmail",
    slug: "gmail",
    description: "E-mails, mensagens e confirmações.",
    category: "Outros aplicativos",
    logoPath: null,
    searchTerms: ["gmail", "email", "e-mail", "correio", "google mail"],
    status: "available",
    createdAt: baseDate,
    updatedAt: baseDate,
  },
  {
    id: "app-youtube",
    name: "YouTube",
    slug: "youtube",
    description: "Vídeos, músicas e programas.",
    category: "Outros aplicativos",
    logoPath: null,
    searchTerms: ["youtube", "video", "musica", "assistir", "show"],
    status: "available",
    createdAt: baseDate,
    updatedAt: baseDate,
  },
  {
    id: "app-google-fotos",
    name: "Google Fotos",
    slug: "google-fotos",
    description: "Fotos, vídeos e memórias.",
    category: "Outros aplicativos",
    logoPath: null,
    searchTerms: ["fotos", "galeria", "google fotos", "imagens", "album"],
    status: "available",
    createdAt: baseDate,
    updatedAt: baseDate,
  },
  {
    id: "app-uber",
    name: "Uber",
    slug: "uber",
    description: "Pedir viagem de carro.",
    category: "Outros aplicativos",
    logoPath: null,
    searchTerms: ["uber", "carro", "viagem", "taxi", "motorista"],
    status: "available",
    createdAt: baseDate,
    updatedAt: baseDate,
  },
  {
    id: "app-google-maps",
    name: "Google Maps",
    slug: "google-maps",
    description: "Rotas, endereços e GPS.",
    category: "Outros aplicativos",
    logoPath: null,
    searchTerms: ["maps", "mapa", "gps", "rotas", "onibus", "caminho"],
    status: "available",
    createdAt: baseDate,
    updatedAt: baseDate,
  },
  {
    id: "app-instagram",
    name: "Instagram",
    slug: "instagram",
    description: "Fotos e mensagens de amigos.",
    category: "Outros aplicativos",
    logoPath: null,
    searchTerms: ["instagram", "insta", "fotos", "feed", "stories", "direct"],
    status: "available",
    createdAt: baseDate,
    updatedAt: baseDate,
  },
  {
    id: "app-facebook",
    name: "Facebook",
    slug: "facebook",
    description: "Amigos, família e comunidades.",
    category: "Outros aplicativos",
    logoPath: null,
    searchTerms: ["facebook", "face", "fb", "amigos", "publicações", "grupos"],
    status: "available",
    createdAt: baseDate,
    updatedAt: baseDate,
  },
  {
    id: "app-play-store",
    name: "Play Store",
    slug: "play-store",
    description: "Aplicativos, jogos e atualizações.",
    category: "Outros aplicativos",
    logoPath: null,
    searchTerms: ["play store", "playstore", "baixar aplicativo", "instalar app", "jogos"],
    status: "available",
    createdAt: baseDate,
    updatedAt: baseDate,
  },
];

export const otherAppsTasks: Task[] = [
  // ══════════════════════════════════════════════════════════════════
  // ── GMAIL (15 tarefas) ────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  {
    id: "task-ler-emails-gmail",
    applicationId: "app-gmail",
    title: "Ler e-mails recebidos",
    slug: "ler-emails-gmail",
    description: "Aprenda a abrir a caixa de entrada e ler suas mensagens importantes.",
    difficulty: "easy",
    safetyWarning: "Nunca clique em links suspeitos que peçam confirmação de senha do banco.",
    searchTerms: ["email", "ler email", "gmail", "mensagem", "caixa de entrada"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-enviar-email-gmail",
    applicationId: "app-gmail",
    title: "Escrever e enviar um novo e-mail",
    slug: "enviar-email-gmail",
    description: "Passo a passo para escrever uma mensagem para amigos ou empresas.",
    difficulty: "easy",
    safetyWarning: "Confira o endereço de e-mail do destinatário com calma antes de enviar.",
    searchTerms: ["mandar email", "escrever email", "gmail", "enviar mensagem"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-recuperar-senha-gmail",
    applicationId: "app-gmail",
    title: "Recuperar senha da conta Google",
    slug: "recuperar-senha-gmail",
    description: "Recupere o acesso à sua conta e e-mails com segurança pelo celular.",
    difficulty: "medium",
    safetyWarning: "O código de recuperação enviado por SMS é secreto e só deve ser digitado na tela oficial.",
    searchTerms: ["esqueci senha", "recuperar conta", "google", "senha gmail"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-responder-email-gmail",
    applicationId: "app-gmail",
    title: "Responder a um e-mail recebido",
    slug: "responder-email-gmail",
    description: "Responda a uma mensagem recebida sem precisar redigitar o endereço da pessoa.",
    difficulty: "easy",
    safetyWarning: "Confira se a resposta vai para a pessoa certa antes de enviar.",
    searchTerms: ["responder email", "retrucar email", "resposta gmail"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-anexar-foto-documento-gmail",
    applicationId: "app-gmail",
    title: "Anexar foto ou documento em um e-mail",
    slug: "anexar-foto-documento-gmail",
    description: "Envie comprovantes, fotos ou PDFs anexados junto com o seu e-mail.",
    difficulty: "easy",
    safetyWarning: "Espere a barra do arquivo terminar de carregar antes de enviar.",
    searchTerms: ["anexar arquivo", "mandar foto email", "anexo gmail", "enviar pdf email"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-baixar-anexo-gmail",
    applicationId: "app-gmail",
    title: "Baixar foto ou arquivo recebido",
    slug: "baixar-anexo-gmail",
    description: "Salve fotos, exames e documentos recebidos por e-mail na memória do celular.",
    difficulty: "easy",
    safetyWarning: "Só baixe arquivos enviados por pessoas conhecidas ou empresas confiáveis.",
    searchTerms: ["baixar anexo", "salvar foto email", "download gmail", "baixar pdf"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-apagar-emails-lixeira-gmail",
    applicationId: "app-gmail",
    title: "Apagar e-mails indesejados",
    slug: "apagar-emails-lixeira-gmail",
    description: "Exclua propagandas e mensagens velhas para deixar sua caixa de entrada limpa.",
    difficulty: "easy",
    safetyWarning: "Se apagar por engano, você tem até 30 dias para recuperar na Lixeira.",
    searchTerms: ["apagar email", "excluir email", "lixeira gmail", "limpar email"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-favoritar-email-estrela-gmail",
    applicationId: "app-gmail",
    title: "Marcar e-mail importante com estrela",
    slug: "favoritar-email-estrela-gmail",
    description: "Destaque e-mails importantes com uma estrela dourada para achar fácil depois.",
    difficulty: "easy",
    safetyWarning: "As mensagens com estrela ficam salvas juntas na pasta 'Com estrela'.",
    searchTerms: ["favoritar email", "estrela gmail", "email importante", "marcar email"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-pesquisar-email-antigo-gmail",
    applicationId: "app-gmail",
    title: "Pesquisar um e-mail antigo",
    slug: "pesquisar-email-antigo-gmail",
    description: "Encontre uma mensagem antiga digitando o nome de quem mandou ou o assunto.",
    difficulty: "easy",
    safetyWarning: "Use a barra de pesquisa no topo do Gmail para achar qualquer e-mail.",
    searchTerms: ["buscar email", "achar email", "pesquisa gmail", "email antigo"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-identificar-golpe-email-gmail",
    applicationId: "app-gmail",
    title: "Identificar e-mail falso ou golpe",
    slug: "identificar-golpe-email-gmail",
    description: "Saiba como reconhecer mensagens falsas de bancos ou falsos sorteios.",
    difficulty: "easy",
    safetyWarning: "Bancos nunca enviam links por e-mail para você atualizar senha ou cadastrar chave Pix.",
    searchTerms: ["golpe email", "email falso", "phishing", "seguranca gmail"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-esvaziar-lixeira-gmail",
    applicationId: "app-gmail",
    title: "Esvaziar lixeira e liberar espaço",
    slug: "esvaziar-lixeira-gmail",
    description: "Apague em definitivo mensagens descartadas para liberar espaço no Google.",
    difficulty: "medium",
    safetyWarning: "Atenção: mensagens apagadas em definitivo não podem ser recuperadas.",
    searchTerms: ["esvaziar lixeira", "espaco gmail", "memoria cheia google", "limpar lixeira"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-cancelar-envio-email-gmail",
    applicationId: "app-gmail",
    title: "Cancelar envio de e-mail enviado errado",
    slug: "cancelar-envio-email-gmail",
    description: "Como desfazer o envio de uma mensagem logo após tocar no botão de enviar.",
    difficulty: "easy",
    safetyWarning: "Você tem até 5 segundos após tocar em enviar para tocar em 'Desfazer'.",
    searchTerms: ["cancelar envio", "desfazer email", "voltar email", "enviei errado"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-marcar-email-como-lido-gmail",
    applicationId: "app-gmail",
    title: "Marcar e-mails como lidos",
    slug: "marcar-email-como-lido-gmail",
    description: "Tire o aviso de mensagens não lidas da sua tela sem precisar abrir uma por uma.",
    difficulty: "easy",
    safetyWarning: "A mensagem continua salva na caixa de entrada, apenas sem o destaque de não lida.",
    searchTerms: ["marcar como lido", "tirar bolinha email", "leitura gmail"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-trocar-senha-gmail",
    applicationId: "app-gmail",
    title: "Trocar senha do Gmail por segurança",
    slug: "trocar-senha-gmail",
    description: "Atualize sua senha de tempos em tempos para manter sua conta Google blindada.",
    difficulty: "medium",
    safetyWarning: "Anote a nova senha em seu caderno particular de anotações em casa.",
    searchTerms: ["mudar senha", "trocar senha google", "seguranca conta", "nova senha gmail"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-bloquear-remetente-spam-gmail",
    applicationId: "app-gmail",
    title: "Bloquear remetente que manda propaganda",
    slug: "bloquear-remetente-spam-gmail",
    description: "Impeça que lojas e empresas chatas continuem mandando e-mails para você.",
    difficulty: "easy",
    safetyWarning: "As próximas mensagens dessa empresa irão direto para o lixo sem incomodar você.",
    searchTerms: ["bloquear email", "bloquear spam", "propaganda chata", "bloquear remetente"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },

  // ══════════════════════════════════════════════════════════════════
  // ── YOUTUBE (15 tarefas) ──────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  {
    id: "task-pesquisar-video-youtube",
    applicationId: "app-youtube",
    title: "Pesquisar um vídeo ou música",
    slug: "pesquisar-video-youtube",
    description: "Aprenda a buscar músicas, receitas, pregações ou programas falando ou digitando.",
    difficulty: "easy",
    safetyWarning: "Você pode falar no microfone para não precisar digitar letra por letra.",
    searchTerms: ["video", "musica", "youtube", "buscar", "pesquisar", "receita"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-aumentar-volume-youtube",
    applicationId: "app-youtube",
    title: "Aumentar volume e deitar a tela",
    slug: "aumentar-volume-youtube",
    description: "Ajuste o som e assista ao vídeo com a tela deitada em tamanho grande.",
    difficulty: "easy",
    safetyWarning: "Use os botões de volume na lateral do aparelho para deixar no som ideal.",
    searchTerms: ["volume", "tela cheia", "deitar celular", "som youtube"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-salvar-video-youtube",
    applicationId: "app-youtube",
    title: "Salvar vídeo para assistir depois",
    slug: "salvar-video-youtube",
    description: "Guarde seus vídeos favoritos ou receitas em uma lista fácil de achar.",
    difficulty: "easy",
    safetyWarning: "Os vídeos salvos ficam guardados na aba 'Você' no rodapé do aplicativo.",
    searchTerms: ["salvar", "favoritos", "assistir mais tarde", "guardar video"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-pausar-e-voltar-video-youtube",
    applicationId: "app-youtube",
    title: "Pausar e voltar o vídeo",
    slug: "pausar-e-voltar-video-youtube",
    description: "Aprenda a parar o vídeo para ir ao banheiro e voltar a cena que não entendeu.",
    difficulty: "easy",
    safetyWarning: "Dê dois toques no lado esquerdo da tela para voltar 10 segundos rapidamente.",
    searchTerms: ["pausar video", "voltar video", "parar video", "rebobinar youtube"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-pular-anuncios-youtube",
    applicationId: "app-youtube",
    title: "Pular anúncios antes do vídeo",
    slug: "pular-anuncios-youtube",
    description: "Saiba quando e onde tocar para pular as propagandas e ir direto ao vídeo.",
    difficulty: "easy",
    safetyWarning: "Aguarde 5 segundos até aparecer o botão branco 'Pular anúncio'.",
    searchTerms: ["pular anuncio", "tirar propaganda", "pular comercial", "propaganda youtube"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-inscrever-se-canal-youtube",
    applicationId: "app-youtube",
    title: "Inscrever-se no canal que você gosta",
    slug: "inscrever-se-canal-youtube",
    description: "Acompanhe seus apresentadores e cantores favoritos para não perder nenhum vídeo novo.",
    difficulty: "easy",
    safetyWarning: "Inscrever-se é 100% gratuito e não cobra nada no seu celular.",
    searchTerms: ["inscrever no canal", "seguir canal", "inscricao youtube", "sininho"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-ativar-legendas-youtube",
    applicationId: "app-youtube",
    title: "Ativar legendas em português no vídeo",
    slug: "ativar-legendas-youtube",
    description: "Veja o texto falado escrito na tela para acompanhar mesmo com som baixo.",
    difficulty: "easy",
    safetyWarning: "As legendas ajudam a entender palavras difíceis ou sons com sotaque.",
    searchTerms: ["legenda", "ativar legenda", "letras na tela", "cc youtube"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-diminuir-velocidade-video-youtube",
    applicationId: "app-youtube",
    title: "Diminuir a velocidade do vídeo",
    slug: "diminuir-velocidade-video-youtube",
    description: "Faça o vídeo passar mais devagar para entender receitas ou explicações difíceis.",
    difficulty: "medium",
    safetyWarning: "A velocidade 0.75x deixa a fala mais pausada e fácil de acompanhar.",
    searchTerms: ["velocidade video", "falar devagar", "video lento", "ajustar velocidade"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-ver-historico-videos-youtube",
    applicationId: "app-youtube",
    title: "Ver histórico de vídeos assistidos",
    slug: "ver-historico-videos-youtube",
    description: "Ache de novo aquele vídeo que você assistiu ontem mas não lembra o nome.",
    difficulty: "easy",
    safetyWarning: "Seu histórico guarda todos os vídeos que você abriu nos últimos dias.",
    searchTerms: ["historico youtube", "videos assistidos", "achar video de novo", "o que assisti"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-compartilhar-video-familia-youtube",
    applicationId: "app-youtube",
    title: "Compartilhar vídeo com a família",
    slug: "compartilhar-video-familia-youtube",
    description: "Envie músicas bonitas, receitas ou orações direto para os contatos do celular.",
    difficulty: "easy",
    safetyWarning: "Confira o grupo ou contato antes de enviar.",
    searchTerms: ["compartilhar video", "mandar video", "enviar youtube", "mandar musica"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-assistir-transmissoes-ao-vivo-youtube",
    applicationId: "app-youtube",
    title: "Assistir transmissões ao vivo",
    slug: "assistir-transmissoes-ao-vivo-youtube",
    description: "Assista a missas, cultos, jogos e jornais transmitidos em tempo real.",
    difficulty: "easy",
    safetyWarning: "Transmissões ao vivo exibem o selo vermelho 'AO VIVO' na tela.",
    searchTerms: ["ao vivo", "missa ao vivo", "culto ao vivo", "noticias ao vivo", "live"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-melhorar-qualidade-imagem-youtube",
    applicationId: "app-youtube",
    title: "Melhorar a qualidade da imagem",
    slug: "melhorar-qualidade-imagem-youtube",
    description: "Deixe o vídeo mais nítido e bonito quando a imagem estiver embaçada.",
    difficulty: "medium",
    safetyWarning: "Qualidade mais alta consome mais internet do plano de dados.",
    searchTerms: ["qualidade imagem", "video embaçado", "melhorar imagem", "alta definicao"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-desativar-reproducao-automatica-youtube",
    applicationId: "app-youtube",
    title: "Desativar reprodução automática",
    slug: "desativar-reproducao-automatica-youtube",
    description: "Impeça que novos vídeos comecem a tocar sozinhos quando o atual terminar.",
    difficulty: "easy",
    safetyWarning: "Desativar evita que o celular fique tocando sozinho caso você pegue no sono.",
    searchTerms: ["parar video sozinho", "reproducao automatica", "tocar sozinho youtube"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-pesquisar-por-voz-youtube",
    applicationId: "app-youtube",
    title: "Pesquisar no YouTube falando com o microfone",
    slug: "pesquisar-por-voz-youtube",
    description: "Fale o nome da música ou cantor em vez de digitar no tecladinho pequeno.",
    difficulty: "easy",
    safetyWarning: "Fale com clareza perto do celular para o YouTube entender o que você quer.",
    searchTerms: ["pesquisar por voz", "falar no youtube", "microfone youtube", "busca por voz"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-criar-lista-musicas-favoritas-youtube",
    applicationId: "app-youtube",
    title: "Criar uma lista de músicas favoritas",
    slug: "criar-lista-musicas-favoritas-youtube",
    description: "Monte uma coletânea com todas as músicas que você adora ouvir em casa.",
    difficulty: "medium",
    safetyWarning: "Sua lista fica guardada na aba 'Você' e toca as músicas uma depois da outra.",
    searchTerms: ["playlist", "lista de musicas", "favoritos youtube", "criar lista"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },

  // ══════════════════════════════════════════════════════════════════
  // ── GOOGLE FOTOS (15 tarefas) ─────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  {
    id: "task-encontrar-fotos-antigas",
    applicationId: "app-google-fotos",
    title: "Encontrar fotos e vídeos antigos",
    slug: "encontrar-fotos-antigas",
    description: "Navegue pelas datas, meses e anos para rever momentos especiais da família.",
    difficulty: "easy",
    safetyWarning: "Suas fotos são privadas e ficam salvas de forma segura na sua conta.",
    searchTerms: ["fotos", "galeria", "lembranças", "fotos antigas", "ano"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-compartilhar-fotos-galeria",
    applicationId: "app-google-fotos",
    title: "Compartilhar fotos com contatos",
    slug: "compartilhar-fotos-galeria",
    description: "Mande fotos direto da sua galeria para conversas e grupos de amigos e familiares.",
    difficulty: "easy",
    safetyWarning: "Confira o nome do contato selecionado antes de confirmar o envio.",
    searchTerms: ["compartilhar foto", "mandar foto", "enviar foto galeria", "foto para amigos"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-liberar-espaco-fotos",
    applicationId: "app-google-fotos",
    title: "Liberar espaço da memória do celular",
    slug: "liberar-espaco-fotos",
    description: "Limpe a memória do aparelho sem perder as fotos que já estão salvas na nuvem.",
    difficulty: "medium",
    safetyWarning: "O Google Fotos só apaga do aparelho fotos que já foram copiadas com segurança.",
    searchTerms: ["limpar memoria", "memoria cheia", "fotos", "liberar espaco"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-criar-album-fotos",
    applicationId: "app-google-fotos",
    title: "Criar um álbum de família ou viagem",
    slug: "criar-album-fotos",
    description: "Organize fotos de aniversários, viagens ou netos em um álbum separado.",
    difficulty: "easy",
    safetyWarning: "Colocar fotos em um álbum não gasta espaço extra na memória do aparelho.",
    searchTerms: ["criar album", "pasta de fotos", "organizar fotos", "album familia"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-apagar-fotos-borradas-fotos",
    applicationId: "app-google-fotos",
    title: "Apagar fotos borradas ou repetidas",
    slug: "apagar-fotos-borradas-fotos",
    description: "Como excluir fotos tremidas ou tiradas sem querer para não ocupar espaço.",
    difficulty: "easy",
    safetyWarning: "Fotos apagadas vão para a lixeira e podem ser restauradas se você se arrepender.",
    searchTerms: ["apagar foto", "excluir foto", "foto borrada", "lixeira fotos"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-recuperar-fotos-lixeira-fotos",
    applicationId: "app-google-fotos",
    title: "Recuperar fotos apagadas por engano",
    slug: "recuperar-fotos-lixeira-fotos",
    description: "Resgate fotos excluídas sem querer de volta para a sua galeria.",
    difficulty: "easy",
    safetyWarning: "A lixeira guarda suas fotos excluídas por até 60 dias.",
    searchTerms: ["recuperar foto", "restaurar foto", "foto apagada", "lixeira fotos"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-favoritar-fotos-fotos",
    applicationId: "app-google-fotos",
    title: "Favoritar as fotos mais bonitas",
    slug: "favoritar-fotos-fotos",
    description: "Marque as fotos que você mais gosta com uma estrela para achar rápido.",
    difficulty: "easy",
    safetyWarning: "As fotos favoritadas ficam todas reunidas na pasta 'Favoritos'.",
    searchTerms: ["favoritar foto", "estrela foto", "fotos favoritas", "marcar foto"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-procurar-fotos-pessoas-fotos",
    applicationId: "app-google-fotos",
    title: "Procurar fotos pelo rosto da pessoa",
    slug: "procurar-fotos-pessoas-fotos",
    description: "Toque na foto do seu filho ou neto para ver todas as fotos dele juntas.",
    difficulty: "easy",
    safetyWarning: "O reconhecimento de pessoas é automático e 100% privado na sua conta.",
    searchTerms: ["buscar pessoa fotos", "rosto fotos", "fotos de neto", "achar pessoa"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-cortar-clarear-foto-fotos",
    applicationId: "app-google-fotos",
    title: "Cortar e clarear uma foto escura",
    slug: "cortar-clarear-foto-fotos",
    description: "Ajuste a iluminação e corte partes indesejadas da borda da foto.",
    difficulty: "medium",
    safetyWarning: "O Google Fotos cria uma cópia nova e mantém sua foto original guardada.",
    searchTerms: ["editar foto", "clarear foto", "cortar foto", "ajustar foto"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-baixar-foto-da-nuvem-fotos",
    applicationId: "app-google-fotos",
    title: "Baixar foto para a memória do celular",
    slug: "baixar-foto-da-nuvem-fotos",
    description: "Grave uma foto da nuvem de volta no aparelho para usar em outros apps.",
    difficulty: "easy",
    safetyWarning: "A foto baixada fica salva na pasta Download da galeria.",
    searchTerms: ["baixar foto", "download foto", "salvar foto no celular"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-enviar-varias-fotos-fotos",
    applicationId: "app-google-fotos",
    title: "Enviar várias fotos de uma vez só",
    slug: "enviar-varias-fotos-fotos",
    description: "Selecione várias fotos ao mesmo tempo para mandar juntas sem cansar.",
    difficulty: "medium",
    safetyWarning: "Segure o dedo na primeira foto e depois dê toques nas outras para marcar.",
    searchTerms: ["selecionar varias fotos", "mandar muitas fotos", "compartilhar grupo de fotos"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-criar-colagem-fotos",
    applicationId: "app-google-fotos",
    title: "Criar uma colagem com várias fotos",
    slug: "criar-colagem-fotos",
    description: "Junte de 2 a 6 fotos em uma única imagem bonita para mandar de presente.",
    difficulty: "medium",
    safetyWarning: "O aplicativo monta a colagem automaticamente com molduras elegantes.",
    searchTerms: ["colagem de fotos", "juntar fotos", "montagem fotos", "painel de fotos"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-conferir-backup-ativado-fotos",
    applicationId: "app-google-fotos",
    title: "Conferir se o backup das fotos está ativado",
    slug: "conferir-backup-ativado-fotos",
    description: "Tenha certeza de que suas fotos estão salvas na internet caso perca o celular.",
    difficulty: "easy",
    safetyWarning: "Com o backup ligado, suas fotos nunca somem mesmo se o aparelho quebrar.",
    searchTerms: ["backup fotos", "nuvem fotos", "salvar fotos automatico", "fotos salvas"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-ver-detalhes-data-local-fotos",
    applicationId: "app-google-fotos",
    title: "Ver a data e onde a foto foi tirada",
    slug: "ver-detalhes-data-local-fotos",
    description: "Veja o dia da semana, o ano e a cidade onde a fotografia foi registrada.",
    difficulty: "easy",
    safetyWarning: "Basta deslizar o dedo de baixo para cima na foto para ver os detalhes.",
    searchTerms: ["data da foto", "onde foi tirada foto", "detalhes foto", "ano da foto"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-compartilhar-album-familia-fotos",
    applicationId: "app-google-fotos",
    title: "Compartilhar um álbum com os filhos",
    slug: "compartilhar-album-familia-fotos",
    description: "Crie um link do álbum para todos da família verem e colocarem fotos juntos.",
    difficulty: "medium",
    safetyWarning: "Apenas pessoas com quem você compartilhou terão acesso ao álbum familiar.",
    searchTerms: ["compartilhar album", "album compartilhado", "album familia", "fotos com filhos"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },

  // ══════════════════════════════════════════════════════════════════
  // ── UBER (15 tarefas) ─────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  {
    id: "task-pedir-carro-uber",
    applicationId: "app-uber",
    title: "Pedir uma viagem de carro",
    slug: "pedir-carro-uber",
    description: "Coloque o endereço para onde você quer ir e solicite um motorista.",
    difficulty: "medium",
    safetyWarning: "Confira sempre o valor da corrida antes de confirmar.",
    searchTerms: ["uber", "carro", "viagem", "motorista", "pedir uber"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-acompanhar-motorista-uber",
    applicationId: "app-uber",
    title: "Acompanhar motorista e conferir a placa",
    slug: "acompanhar-motorista-uber",
    description: "Veja o tempo de chegada e saiba como conferir placa, cor e modelo do carro.",
    difficulty: "easy",
    safetyWarning: "NUNCA entre no carro antes de olhar a placa traseira e conferir se é a mesma da tela.",
    searchTerms: ["placa", "motorista", "chegada", "seguranca uber", "conferir carro"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-pagar-uber-dinheiro-cartao",
    applicationId: "app-uber",
    title: "Escolher pagar em dinheiro ou cartão",
    slug: "pagar-uber-dinheiro-cartao",
    description: "Aprenda a selecionar se prefere pagar em dinheiro vivo ou no cartão cadastrado.",
    difficulty: "easy",
    safetyWarning: "Se escolher pagar em dinheiro, pague somente ao motorista ao final da viagem.",
    searchTerms: ["pagar uber", "dinheiro uber", "cartao uber", "forma de pagamento"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-cancelar-viagem-uber",
    applicationId: "app-uber",
    title: "Cancelar viagem pedida por engano",
    slug: "cancelar-viagem-uber",
    description: "Como desistir da corrida logo após pedir caso tenha errado o endereço.",
    difficulty: "easy",
    safetyWarning: "Se cancelar nos primeiros 2 minutos, o aplicativo não cobra nenhuma taxa.",
    searchTerms: ["cancelar uber", "desistir corrida", "cancelar viagem", "errei endereco uber"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-compartilhar-viagem-familia-uber",
    applicationId: "app-uber",
    title: "Compartilhar a corrida com a família",
    slug: "compartilhar-viagem-familia-uber",
    description: "Envie um link para seus parentes verem no mapa onde o carro está andando.",
    difficulty: "easy",
    safetyWarning: "Seus filhos podem acompanhar sua viagem em tempo real pelo próprio celular deles.",
    searchTerms: ["compartilhar viagem", "seguranca uber", "mandar trajeto uber", "familia uber"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-mandar-mensagem-motorista-uber",
    applicationId: "app-uber",
    title: "Mandar mensagem para o motorista no app",
    slug: "mandar-mensagem-motorista-uber",
    description: "Alerte o motorista onde você está esperando (ex: 'Estou em frente ao portão branco').",
    difficulty: "easy",
    safetyWarning: "A conversa é feita por dentro do Uber, sem revelar seu número de telefone.",
    searchTerms: ["mensagem motorista", "falar com motorista", "chat uber", "recado uber"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-ligar-para-motorista-uber",
    applicationId: "app-uber",
    title: "Telefonar para o motorista pelo aplicativo",
    slug: "ligar-para-motorista-uber",
    description: "Faça uma ligação gratuita pelo app para explicar onde você está parado.",
    difficulty: "easy",
    safetyWarning: "A ligação é anônima e gratuita pela internet.",
    searchTerms: ["ligar motorista", "telefonar uber", "chamada motorista"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-adicionar-parada-uber",
    applicationId: "app-uber",
    title: "Adicionar uma parada no caminho",
    slug: "adicionar-parada-uber",
    description: "Aprenda a pedir para o carro passar na farmácia ou pegar um amigo antes do destino.",
    difficulty: "medium",
    safetyWarning: "O Uber recalcula o valor antes de você confirmar a nova parada.",
    searchTerms: ["adicionar parada", "duas paradas uber", "passar na farmacia uber"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-avaliar-motorista-elogio-uber",
    applicationId: "app-uber",
    title: "Avaliar o motorista e dar 5 estrelas",
    slug: "avaliar-motorista-elogio-uber",
    description: "Diga se a viagem foi tranquila e deixe um elogio para o motorista educado.",
    difficulty: "easy",
    safetyWarning: "A avaliação é anônima e ajuda a manter bons motoristas na plataforma.",
    searchTerms: ["avaliar motorista", "dar 5 estrelas", "elogio uber", "nota motorista"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-informar-objeto-esquecido-uber",
    applicationId: "app-uber",
    title: "Informar objeto esquecido no carro",
    slug: "informar-objeto-esquecido-uber",
    description: "Saiba o que fazer se esquecer guarda-chuva, óculos ou sacola no banco traseiro.",
    difficulty: "medium",
    safetyWarning: "O Uber permite entrar em contato direto com o motorista para combinar a devolução.",
    searchTerms: ["esqueci no uber", "objeto perdido uber", "perdi coisa no carro", "recuperar esquecido"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-pedir-carro-para-outra-pessoa-uber",
    applicationId: "app-uber",
    title: "Pedir carro para um filho ou parente",
    slug: "pedir-carro-para-outra-pessoa-uber",
    description: "Chame um carro pelo seu celular para buscar outra pessoa em outro endereço.",
    difficulty: "medium",
    safetyWarning: "O aplicativo envia as informações do carro direto para o celular da pessoa que vai viajar.",
    searchTerms: ["pedir uber para outro", "uber para parente", "chamar uber amigo"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-usar-botao-seguranca-uber",
    applicationId: "app-uber",
    title: "Usar o botão de segurança da Uber",
    slug: "usar-botao-seguranca-uber",
    description: "Conheça o escudo azul na tela para acionar ajuda rápida em qualquer imprevisto.",
    difficulty: "easy",
    safetyWarning: "O botão de segurança permite ligar para a polícia (190) com um único toque.",
    searchTerms: ["seguranca uber", "escudo azul uber", "emergencia uber", "botao de seguranca"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-cadastrar-cartao-credito-uber",
    applicationId: "app-uber",
    title: "Cadastrar cartão de crédito no app",
    slug: "cadastrar-cartao-credito-uber",
    description: "Cadastre seu cartão para não precisar carregar dinheiro vivo nem pedir troco.",
    difficulty: "medium",
    safetyWarning: "Os dados do cartão ficam salvos de forma protegida e nunca são mostrados ao motorista.",
    searchTerms: ["cadastrar cartao", "cartao de credito uber", "pagamento aplicativo uber"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-ver-recibo-historico-uber",
    applicationId: "app-uber",
    title: "Ver histórico e recibos de viagens",
    slug: "ver-recibo-historico-uber",
    description: "Consulte quanto pagou nas últimas corridas e baixe os comprovantes de pagamento.",
    difficulty: "easy",
    safetyWarning: "Você pode conferir dia, horário e nome do motorista de qualquer corrida passada.",
    searchTerms: ["recibo uber", "historico viagens", "comprovante uber", "quanto paguei uber"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-consultar-sua-nota-passageiro-uber",
    applicationId: "app-uber",
    title: "Consultar sua nota de passageiro",
    slug: "consultar-sua-nota-passageiro-uber",
    description: "Veja como os motoristas avaliaram você como passageiro educado e pontual.",
    difficulty: "easy",
    safetyWarning: "Passageiros gentis e pontuais mantêm notas altas acima de 4.8 estrelas.",
    searchTerms: ["nota uber", "estrelas passageiro", "minha avaliacao uber"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },

  // ══════════════════════════════════════════════════════════════════
  // ── GOOGLE MAPS (15 tarefas) ──────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  {
    id: "task-colocar-endereco-maps",
    applicationId: "app-google-maps",
    title: "Colocar endereço para onde quer ir",
    slug: "colocar-endereco-maps",
    description: "Digite ou fale o endereço e deixe o GPS guiar o caminho com voz.",
    difficulty: "easy",
    safetyWarning: "Deixe o volume do celular alto para ouvir os avisos da voz do GPS.",
    searchTerms: ["endereco", "caminho", "gps", "mapa", "como chegar"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-caminho-onibus-maps",
    applicationId: "app-google-maps",
    title: "Ver linhas de ônibus ou trajeto a pé",
    slug: "caminho-onibus-maps",
    description: "Veja qual linha de ônibus pegar, horário previsto e em qual ponto descer.",
    difficulty: "easy",
    safetyWarning: "O mapa mostra o trajeto a pé com linhas pontilhadas azuis.",
    searchTerms: ["onibus", "a pe", "rota", "ponto de onibus", "horario onibus"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-compartilhar-localizacao-maps",
    applicationId: "app-google-maps",
    title: "Compartilhar localização em tempo real",
    slug: "compartilhar-localizacao-maps",
    description: "Deixe os familiares verem onde você está andando no mapa para sua segurança.",
    difficulty: "medium",
    safetyWarning: "Você pode escolher por quantas horas deseja compartilhar sua localização.",
    searchTerms: ["compartilhar local maps", "onde estou maps", "rastrear localizacao familia"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-salvar-endereco-casa-maps",
    applicationId: "app-google-maps",
    title: "Salvar o endereço da sua casa",
    slug: "salvar-endereco-casa-maps",
    description: "Guarde sua casa no mapa para conseguir traçar o caminho de volta com apenas um toque.",
    difficulty: "easy",
    safetyWarning: "Depois de salvar, basta dizer 'Ir para casa' para o GPS traçar a volta.",
    searchTerms: ["salvar casa maps", "minha casa gps", "voltar para casa", "endereco casa"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-encontrar-farmacia-hospital-maps",
    applicationId: "app-google-maps",
    title: "Encontrar farmácias e hospitais por perto",
    slug: "encontrar-farmacia-hospital-maps",
    description: "Ache os postos de saúde, hospitais e drogarias mais próximos de onde você está.",
    difficulty: "easy",
    safetyWarning: "O aplicativo mostra se a farmácia está aberta agora e o número de telefone.",
    searchTerms: ["farmacia perto", "hospital perto", "posto de saude mapa", "drogaria proxima"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-ver-foto-da-fachada-streetview-maps",
    applicationId: "app-google-maps",
    title: "Ver foto da frente do local (Street View)",
    slug: "ver-foto-da-fachada-streetview-maps",
    description: "Olhe a foto real da frente da clínica ou casa antes de sair para reconhecer fácil na rua.",
    difficulty: "easy",
    safetyWarning: "Gire a foto com o dedo para ver a rua inteira em 360 graus.",
    searchTerms: ["street view", "foto da frente", "foto da rua", "fachada maps"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-saber-se-transito-parado-maps",
    applicationId: "app-google-maps",
    title: "Saber se o trânsito está parado",
    slug: "saber-se-transito-parado-maps",
    description: "Entenda as cores das ruas: verde para livre, laranja para lento e vermelho para engarrafado.",
    difficulty: "easy",
    safetyWarning: "Ruas em vermelho escuro indicam trânsito totalmente parado.",
    searchTerms: ["transito maps", "engarrafamento", "rua parada", "transito tempo real"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-baixar-mapa-sem-internet-maps",
    applicationId: "app-google-maps",
    title: "Baixar mapa da cidade para usar sem internet",
    slug: "baixar-mapa-sem-internet-maps",
    description: "Navegue pelo GPS mesmo se estiver sem sinal de celular ou sem pacote de dados na rua.",
    difficulty: "medium",
    safetyWarning: "Baixe o mapa conectado ao Wi-Fi de casa para não gastar dados móveis.",
    searchTerms: ["mapa offline", "gps sem internet", "baixar mapa cidade", "mapa sem dados"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-ver-horario-funcionamento-maps",
    applicationId: "app-google-maps",
    title: "Ver horário de funcionamento de lojas e clínicas",
    slug: "ver-horario-funcionamento-maps",
    description: "Saiba se o laboratório, banco ou loja está aberto antes de sair de casa.",
    difficulty: "easy",
    safetyWarning: "O Google avisa em verde se o local está 'Aberto agora' ou em vermelho se 'Fechado'.",
    searchTerms: ["horario funcionamento", "esta aberto hoje", "que horas abre", "horario clinica"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-medir-distancia-tempo-maps",
    applicationId: "app-google-maps",
    title: "Medir distância e tempo até o destino",
    slug: "medir-distancia-tempo-maps",
    description: "Saiba quantos quilômetros e quantos minutos de viagem até o local da consulta.",
    difficulty: "easy",
    safetyWarning: "O horário de chegada previsto é atualizado em tempo real com o trânsito.",
    searchTerms: ["distancia maps", "quantos km", "tempo de viagem", "quanto tempo demora"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-adicionar-parada-caminho-maps",
    applicationId: "app-google-maps",
    title: "Adicionar uma parada no trajeto",
    slug: "adicionar-parada-caminho-maps",
    description: "Passe em um posto de gasolina ou padaria sem perder a rota para o destino final.",
    difficulty: "medium",
    safetyWarning: "O GPS leva você até a parada e depois continua automaticamente para o destino.",
    searchTerms: ["parada rota maps", "adicionar parada gps", "passar no posto maps"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-evitar-pedagios-maps",
    applicationId: "app-google-maps",
    title: "Desviar de pedágios na rota",
    slug: "evitar-pedagios-maps",
    description: "Aprenda a traçar caminhos alternativos gratuitos que não cobram pedágio.",
    difficulty: "medium",
    safetyWarning: "Caminhos sem pedágio podem levar alguns minutos a mais.",
    searchTerms: ["evitar pedagio", "caminho sem pedagio", "desviar pedagio maps"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-salvar-onde-estacionou-maps",
    applicationId: "app-google-maps",
    title: "Salvar onde você estacionou o carro",
    slug: "salvar-onde-estacionou-maps",
    description: "Marque o local exato onde deixou o veículo para não ficar perdido no estacionamento.",
    difficulty: "easy",
    safetyWarning: "O mapa deixará uma letrinha 'P' no local exato onde o carro está parado.",
    searchTerms: ["onde estacionei", "salvar estacionamento", "achar meu carro maps"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-ver-caminho-a-pe-maps",
    applicationId: "app-google-maps",
    title: "Ver trajeto para caminhar a pé",
    slug: "ver-caminho-a-pe-maps",
    description: "Veja o trajeto pelas calçadas mais seguras e sem subidas íngremes.",
    difficulty: "easy",
    safetyWarning: "A linha pontilhada azul indica o caminho mais seguro para caminhar.",
    searchTerms: ["ir a pe", "caminho a pe", "rota pedestre", "caminhada maps"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-conferir-avaliacoes-comentarios-maps",
    applicationId: "app-google-maps",
    title: "Conferir avaliações de outros clientes",
    slug: "conferir-avaliacoes-comentarios-maps",
    description: "Leia o que outras pessoas idosas falaram sobre o atendimento daquele local.",
    difficulty: "easy",
    safetyWarning: "Prefira locais com nota acima de 4 estrelas e comentários elogiando o respeito ao idoso.",
    searchTerms: ["avaliacoes maps", "comentarios lugar", "nota do restaurante", "opinioes maps"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },

  // ══════════════════════════════════════════════════════════════════
  // ── INSTAGRAM (15 tarefas) ────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  {
    id: "task-ver-fotos-instagram",
    applicationId: "app-instagram",
    title: "Ver fotos e vídeos de amigos",
    slug: "ver-fotos-instagram",
    description: "Aprenda a rolar o feed e curtir as fotos da família com dois toques.",
    difficulty: "easy",
    safetyWarning: "Para curtir uma foto, basta dar dois toques rápidos com o dedo sobre ela.",
    searchTerms: ["fotos", "instagram", "amigos", "curtir", "feed"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-enviar-mensagem-instagram",
    applicationId: "app-instagram",
    title: "Conversar por mensagem no Direct",
    slug: "enviar-mensagem-instagram",
    description: "Mande mensagens particulares para quem você segue sem ninguém mais ver.",
    difficulty: "easy",
    safetyWarning: "Mensagens no Direct são privadas entre você e o contato escolhido.",
    searchTerms: ["direct", "mensagem", "conversa", "chat instagram"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-assistir-stories-instagram",
    applicationId: "app-instagram",
    title: "Assistir aos Stories dos amigos",
    slug: "assistir-stories-instagram",
    description: "Veja os vídeos e fotos curtos que amigos postam e somem depois de 24 horas.",
    difficulty: "easy",
    safetyWarning: "Toque no lado direito da tela para pular para a próxima foto do Story.",
    searchTerms: ["stories", "bolinhas instagram", "ver stories", "fotos que somem"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-publicar-foto-feed-instagram",
    applicationId: "app-instagram",
    title: "Publicar uma foto bonita no seu perfil",
    slug: "publicar-foto-feed-instagram",
    description: "Compartilhe uma foto de família ou viagem para todos os seus amigos verem.",
    difficulty: "medium",
    safetyWarning: "Escreva uma legenda carinhosa antes de tocar no botão azul 'Compartilhar'.",
    searchTerms: ["postar foto", "publicar foto", "foto feed", "post instagram"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-curtir-comentar-foto-instagram",
    applicationId: "app-instagram",
    title: "Comentar na foto de um amigo",
    slug: "curtir-comentar-foto-instagram",
    description: "Deixe um elogio carinhoso ou uma bênção nos comentários das fotos de parentes.",
    difficulty: "easy",
    safetyWarning: "Lembre-se: os comentários nas fotos públicas podem ser lidos por outros amigos.",
    searchTerms: ["comentar foto", "escrever comentario", "elogio instagram"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-pesquisar-amigo-perfil-instagram",
    applicationId: "app-instagram",
    title: "Procurar o perfil de um amigo ou familiar",
    slug: "pesquisar-amigo-perfil-instagram",
    description: "Encontre a conta dos seus filhos, netos ou amigos antigos pelo nome deles.",
    difficulty: "easy",
    safetyWarning: "Confira a foto de perfil da pessoa para ter certeza de que é ela.",
    searchTerms: ["achar amigo", "pesquisar perfil", "buscar pessoa instagram", "perfil neto"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-seguir-perfil-amigo-instagram",
    applicationId: "app-instagram",
    title: "Seguir uma pessoa para ver as fotos dela",
    slug: "seguir-perfil-amigo-instagram",
    description: "Toque em Seguir para que as novidades daquele familiar apareçam no seu início.",
    difficulty: "easy",
    safetyWarning: "Seguir uma conta é gratuito e você pode deixar de seguir quando quiser.",
    searchTerms: ["seguir instagram", "seguir amigo", "acompanhar perfil"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-compartilhar-post-amigos-instagram",
    applicationId: "app-instagram",
    title: "Mandar post ou receita para amigos",
    slug: "compartilhar-post-amigos-instagram",
    description: "Envie uma receita ou reflexão bonita que você viu no Instagram para os amigos e contatos.",
    difficulty: "easy",
    safetyWarning: "O Instagram gera um link seguro que abre a publicação direto no aplicativo de mensagens.",
    searchTerms: ["mandar para amigos", "compartilhar post", "post instagram amigos"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-salvar-publicacao-instagram",
    applicationId: "app-instagram",
    title: "Salvar foto ou receita para rever depois",
    slug: "salvar-publicacao-instagram",
    description: "Guarde dicas de saúde, receitas e orações em uma pasta particular no seu perfil.",
    difficulty: "easy",
    safetyWarning: "A pessoa dona da foto não sabe que você salvou a publicação dela.",
    searchTerms: ["salvar post", "guardar receita instagram", "favoritos instagram", "salvos"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-deixar-perfil-privado-instagram",
    applicationId: "app-instagram",
    title: "Deixar o seu perfil 100% privado",
    slug: "deixar-perfil-privado-instagram",
    description: "Garanta que apenas pessoas autorizadas por você consigam ver suas fotos de família.",
    difficulty: "medium",
    safetyWarning: "Com a conta privada, ninguém desconhecido consegue ver suas publicações.",
    searchTerms: ["privacidade instagram", "conta privada", "fechar perfil", "proteger fotos"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-bloquear-perfil-estranho-instagram",
    applicationId: "app-instagram",
    title: "Bloquear perfil desconhecido ou suspeito",
    slug: "bloquear-perfil-estranho-instagram",
    description: "Impeça que perfis falsos ou golpistas vejam seu nome ou mandem recados.",
    difficulty: "easy",
    safetyWarning: "A pessoa bloqueada não saberá que você a bloqueou e sumirá da sua vista.",
    searchTerms: ["bloquear perfil", "bloquear instagram", "denunciar perfil", "estranho instagram"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-gravar-story-camera-instagram",
    applicationId: "app-instagram",
    title: "Gravar um Story com a câmera",
    slug: "gravar-story-camera-instagram",
    description: "Tire uma foto ou grave um vídeo curto para dar um bom dia carinhoso aos amigos.",
    difficulty: "medium",
    safetyWarning: "O Story fica visível apenas durante 24 horas e depois é arquivado com segurança.",
    searchTerms: ["gravar story", "postar story", "fazer story", "bom dia instagram"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-silenciar-publicacoes-instagram",
    applicationId: "app-instagram",
    title: "Silenciar publicações de quem posta demais",
    slug: "silenciar-publicacoes-instagram",
    description: "Pare de ver publicações chatas de alguém sem precisar desfazer a amizade com a pessoa.",
    difficulty: "medium",
    safetyWarning: "A pessoa nunca saberá que foi silenciada por você.",
    searchTerms: ["silenciar instagram", "parar de ver posts", "silenciar amigo"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-tirar-som-videos-instagram",
    applicationId: "app-instagram",
    title: "Tirar o som dos vídeos no feed",
    slug: "tirar-som-videos-instagram",
    description: "Navegue pelo aplicativo em silêncio para não levar sustos com vídeos barulhentos.",
    difficulty: "easy",
    safetyWarning: "Basta dar um toque em qualquer vídeo para ligar ou desligar o áudio.",
    searchTerms: ["tirar som instagram", "video mudo", "desligar audio instagram", "silencio instagram"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-desativar-notificacoes-instagram",
    applicationId: "app-instagram",
    title: "Desativar notificações que incomodam",
    slug: "desativar-notificacoes-instagram",
    description: "Faça o celular parar de apitar o dia todo com avisos de curtidas e vídeos novos.",
    difficulty: "medium",
    safetyWarning: "Suas mensagens continuam salvas, apenas o celular para de apitar.",
    searchTerms: ["desativar notificacoes", "parar apito instagram", "silenciar avisos"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  // ══════════════════════════════════════════════════════════════════
  // ── FACEBOOK (15 tarefas) ─────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  {
    id: "task-entrar-facebook",
    applicationId: "app-facebook",
    title: "Entrar no Facebook",
    slug: "entrar-facebook",
    description: "Abra o aplicativo e acesse sua conta com segurança.",
    difficulty: "easy",
    safetyWarning: "Digite sua senha somente no aplicativo ou site oficial do Facebook.",
    searchTerms: ["entrar facebook", "login facebook", "abrir facebook", "acessar facebook"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-pesquisar-amigo-facebook",
    applicationId: "app-facebook",
    title: "Pesquisar um amigo ou familiar",
    slug: "pesquisar-amigo-facebook",
    description: "Encontre pessoas conhecidas pelo nome ou pela foto do perfil.",
    difficulty: "easy",
    safetyWarning: "Confira a foto, cidade e amigos em comum antes de escolher um perfil.",
    searchTerms: ["buscar amigo facebook", "pesquisar pessoa", "achar familiar", "procurar perfil"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-adicionar-amigo-facebook",
    applicationId: "app-facebook",
    title: "Adicionar uma pessoa como amigo",
    slug: "adicionar-amigo-facebook",
    description: "Envie uma solicitação de amizade para alguém conhecido.",
    difficulty: "easy",
    safetyWarning: "Envie solicitações somente para pessoas que você conhece.",
    searchTerms: ["adicionar amigo", "solicitacao amizade", "seguir pessoa facebook"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-publicar-texto-facebook",
    applicationId: "app-facebook",
    title: "Publicar uma mensagem no perfil",
    slug: "publicar-texto-facebook",
    description: "Escreva uma mensagem para compartilhar com seus amigos.",
    difficulty: "easy",
    safetyWarning: "Lembre-se de que a publicação poderá ser vista pelas pessoas permitidas nas suas configurações.",
    searchTerms: ["postar texto", "publicar mensagem", "escrever no facebook", "status facebook"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-publicar-foto-facebook",
    applicationId: "app-facebook",
    title: "Publicar uma foto",
    slug: "publicar-foto-facebook",
    description: "Escolha uma foto da galeria e publique para seus amigos.",
    difficulty: "easy",
    safetyWarning: "Confira a foto e o público selecionado antes de publicar.",
    searchTerms: ["postar foto", "publicar foto", "foto facebook", "mandar foto no facebook"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-curtir-publicacao-facebook",
    applicationId: "app-facebook",
    title: "Curtir uma publicação",
    slug: "curtir-publicacao-facebook",
    description: "Reaja a uma foto, vídeo ou mensagem publicada por alguém.",
    difficulty: "easy",
    safetyWarning: "Confira o conteúdo antes de tocar no botão de reação.",
    searchTerms: ["curtir facebook", "reagir publicacao", "like facebook", "coracao facebook"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-comentar-publicacao-facebook",
    applicationId: "app-facebook",
    title: "Comentar em uma publicação",
    slug: "comentar-publicacao-facebook",
    description: "Escreva um comentário em uma foto ou publicação.",
    difficulty: "easy",
    safetyWarning: "Comentários em publicações podem ser vistos por outras pessoas.",
    searchTerms: ["comentar facebook", "escrever comentario", "responder post"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-compartilhar-publicacao-facebook",
    applicationId: "app-facebook",
    title: "Compartilhar uma publicação",
    slug: "compartilhar-publicacao-facebook",
    description: "Envie uma publicação para amigos ou compartilhe no seu perfil.",
    difficulty: "easy",
    safetyWarning: "Confira o destino e o público antes de compartilhar.",
    searchTerms: ["compartilhar post", "mandar publicacao", "enviar facebook", "compartilhar com amigos"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-assistir-stories-facebook",
    applicationId: "app-facebook",
    title: "Assistir aos Stories",
    slug: "assistir-stories-facebook",
    description: "Veja fotos e vídeos curtos publicados por amigos e páginas.",
    difficulty: "easy",
    safetyWarning: "Stories podem desaparecer depois de 24 horas.",
    searchTerms: ["stories facebook", "ver historias", "bolinhas facebook", "assistir story"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-enviar-mensagem-facebook",
    applicationId: "app-facebook",
    title: "Enviar mensagem pelo Messenger",
    slug: "enviar-mensagem-facebook",
    description: "Converse em particular com amigos pelo Facebook Messenger.",
    difficulty: "easy",
    safetyWarning: "Não envie senhas, códigos ou dados bancários em mensagens.",
    searchTerms: ["mensagem facebook", "messenger", "conversar facebook", "chat facebook"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-fazer-chamada-video-facebook",
    applicationId: "app-facebook",
    title: "Fazer chamada de vídeo",
    slug: "fazer-chamada-video-facebook",
    description: "Converse por vídeo com uma pessoa pelo Messenger.",
    difficulty: "easy",
    safetyWarning: "Use a chamada somente com pessoas conhecidas e mantenha a câmera em local seguro.",
    searchTerms: ["videochamada facebook", "ligar messenger", "chamada de video"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-criar-album-facebook",
    applicationId: "app-facebook",
    title: "Criar um álbum de fotos",
    slug: "criar-album-facebook",
    description: "Organize fotos de uma viagem ou encontro em um álbum.",
    difficulty: "medium",
    safetyWarning: "Escolha com cuidado quem poderá ver o álbum.",
    searchTerms: ["criar album facebook", "album de fotos", "organizar fotos facebook"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-salvar-publicacao-facebook",
    applicationId: "app-facebook",
    title: "Salvar uma publicação para ver depois",
    slug: "salvar-publicacao-facebook",
    description: "Guarde receitas, notícias ou dicas em uma área particular.",
    difficulty: "easy",
    safetyWarning: "Salvar uma publicação não faz uma cópia dela e não avisa o autor.",
    searchTerms: ["salvar post facebook", "guardar publicacao", "ver depois facebook"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-ajustar-privacidade-facebook",
    applicationId: "app-facebook",
    title: "Ajustar a privacidade do perfil",
    slug: "ajustar-privacidade-facebook",
    description: "Escolha quem pode ver suas publicações e encontrar seu perfil.",
    difficulty: "medium",
    safetyWarning: "Revise o público antes de publicar informações pessoais ou fotos da família.",
    searchTerms: ["privacidade facebook", "fechar perfil", "quem pode ver facebook", "seguranca facebook"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-bloquear-denunciar-facebook",
    applicationId: "app-facebook",
    title: "Bloquear ou denunciar um perfil",
    slug: "bloquear-denunciar-facebook",
    description: "Impeça contato de perfis suspeitos e denuncie conteúdos abusivos.",
    difficulty: "easy",
    safetyWarning: "Não responda a perfis que pedem dinheiro, códigos ou dados pessoais.",
    searchTerms: ["bloquear facebook", "denunciar perfil", "perfil falso", "golpe facebook"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  // ══════════════════════════════════════════════════════════════════
  // ── PLAY STORE (15 tarefas) ───────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  {
    id: "task-abrir-play-store",
    applicationId: "app-play-store",
    title: "Abrir a Play Store",
    slug: "abrir-play-store",
    description: "Encontre a loja oficial de aplicativos do celular Android.",
    difficulty: "easy",
    safetyWarning: "Use a Play Store oficial e mantenha o nome do aplicativo visível antes de tocar.",
    searchTerms: ["abrir play store", "loja de aplicativos", "play store android"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-pesquisar-aplicativo-play-store",
    applicationId: "app-play-store",
    title: "Pesquisar um aplicativo",
    slug: "pesquisar-aplicativo-play-store",
    description: "Procure um aplicativo pelo nome dentro da loja oficial.",
    difficulty: "easy",
    safetyWarning: "Confira o nome do desenvolvedor e a quantidade de downloads antes de instalar.",
    searchTerms: ["pesquisar aplicativo", "buscar app", "procurar programa play store"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-instalar-aplicativo-gratis-play-store",
    applicationId: "app-play-store",
    title: "Instalar aplicativo gratuito",
    slug: "instalar-aplicativo-gratis-play-store",
    description: "Baixe um aplicativo gratuito no celular Android.",
    difficulty: "easy",
    safetyWarning: "Verifique se o botão diz 'Instalar' e não apresenta uma compra inesperada.",
    searchTerms: ["instalar app", "baixar aplicativo gratis", "download play store"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-atualizar-aplicativo-play-store",
    applicationId: "app-play-store",
    title: "Atualizar um aplicativo",
    slug: "atualizar-aplicativo-play-store",
    description: "Instale a versão mais recente de um aplicativo já instalado.",
    difficulty: "easy",
    safetyWarning: "Faça atualizações de preferência conectado ao Wi-Fi.",
    searchTerms: ["atualizar aplicativo", "nova versao app", "update play store"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-atualizar-todos-play-store",
    applicationId: "app-play-store",
    title: "Atualizar todos os aplicativos",
    slug: "atualizar-todos-play-store",
    description: "Veja os aplicativos com atualização pendente e atualize vários de uma vez.",
    difficulty: "easy",
    safetyWarning: "Atualizar muitos aplicativos pode consumir dados móveis e bateria.",
    searchTerms: ["atualizar todos apps", "atualizacao pendente", "meus aplicativos play store"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-desinstalar-aplicativo-play-store",
    applicationId: "app-play-store",
    title: "Desinstalar um aplicativo",
    slug: "desinstalar-aplicativo-play-store",
    description: "Remova um aplicativo que não usa mais para liberar espaço.",
    difficulty: "easy",
    safetyWarning: "Confira o nome do aplicativo antes de confirmar a desinstalação.",
    searchTerms: ["desinstalar app", "apagar aplicativo", "remover programa android"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-ver-aplicativos-instalados-play-store",
    applicationId: "app-play-store",
    title: "Ver aplicativos instalados",
    slug: "ver-aplicativos-instalados-play-store",
    description: "Consulte a lista de aplicativos instalados e as atualizações disponíveis.",
    difficulty: "easy",
    safetyWarning: "A lista pode mostrar aplicativos instalados por outros usuários do aparelho.",
    searchTerms: ["meus aplicativos", "apps instalados", "gerenciar aplicativos play store"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-ativar-atualizacao-automatica-play-store",
    applicationId: "app-play-store",
    title: "Ativar atualização automática",
    slug: "ativar-atualizacao-automatica-play-store",
    description: "Configure a Play Store para atualizar aplicativos automaticamente.",
    difficulty: "medium",
    safetyWarning: "Prefira a opção de atualizar somente pelo Wi-Fi para economizar dados móveis.",
    searchTerms: ["atualizacao automatica", "atualizar sozinho", "wifi play store"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-baixar-jogo-play-store",
    applicationId: "app-play-store",
    title: "Baixar um jogo gratuito",
    slug: "baixar-jogo-play-store",
    description: "Encontre e instale um jogo gratuito no Android.",
    difficulty: "easy",
    safetyWarning: "Leia se o jogo contém anúncios ou compras antes de instalar.",
    searchTerms: ["baixar jogo", "jogo gratis", "instalar jogo android"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-conferir-avaliacoes-play-store",
    applicationId: "app-play-store",
    title: "Conferir nota e avaliações",
    slug: "conferir-avaliacoes-play-store",
    description: "Leia as avaliações de outras pessoas antes de instalar um aplicativo.",
    difficulty: "easy",
    safetyWarning: "Não confie somente na nota; leia comentários recentes e veja o desenvolvedor.",
    searchTerms: ["avaliacao aplicativo", "nota app", "comentarios play store"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-ler-seguranca-aplicativo-play-store",
    applicationId: "app-play-store",
    title: "Ler informações de segurança do aplicativo",
    slug: "ler-seguranca-aplicativo-play-store",
    description: "Confira dados, permissões e informações do aplicativo antes do download.",
    difficulty: "medium",
    safetyWarning: "Desconfie de aplicativos que pedem permissões sem relação com sua função.",
    searchTerms: ["seguranca app", "permissoes aplicativo", "dados coletados play store"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-ativar-controle-parental-play-store",
    applicationId: "app-play-store",
    title: "Ativar controle parental",
    slug: "ativar-controle-parental-play-store",
    description: "Restrinja aplicativos, jogos e filmes por faixa etária.",
    difficulty: "medium",
    safetyWarning: "Crie um PIN que somente o responsável conheça.",
    searchTerms: ["controle parental", "bloquear jogos", "restricao idade play store"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
  {
    id: "task-ver-espaco-aplicativo-play-store",
    applicationId: "app-play-store",
    title: "Ver o tamanho de um aplicativo",
    slug: "ver-espaco-aplicativo-play-store",
    description: "Confira quanto espaço um aplicativo ocupa antes de instalá-lo.",
    difficulty: "easy",
    safetyWarning: "Mantenha espaço livre para o Android funcionar bem.",
    searchTerms: ["tamanho aplicativo", "espaco app", "quanto pesa aplicativo"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-compartilhar-link-aplicativo-play-store",
    applicationId: "app-play-store",
    title: "Compartilhar o link de um aplicativo",
    slug: "compartilhar-link-aplicativo-play-store",
    description: "Envie para alguém o link oficial de um aplicativo da Play Store.",
    difficulty: "easy",
    safetyWarning: "Compartilhe o link da Play Store, não arquivos APK recebidos de desconhecidos.",
    searchTerms: ["compartilhar app", "enviar link play store", "mandar aplicativo"],
    availability: "available",
    status: "published",
    stepCount: 3,
  },
  {
    id: "task-denunciar-aplicativo-play-store",
    applicationId: "app-play-store",
    title: "Denunciar aplicativo inadequado",
    slug: "denunciar-aplicativo-play-store",
    description: "Informe à Play Store quando um aplicativo parecer falso, perigoso ou inadequado.",
    difficulty: "medium",
    safetyWarning: "Não instale um aplicativo suspeito apenas para conseguir denunciá-lo.",
    searchTerms: ["denunciar app", "aplicativo falso", "app perigoso", "reclamar play store"],
    availability: "available",
    status: "published",
    stepCount: 4,
  },
];

export const otherAppsScripts: Record<string, EditorialStep[]> = {
  // ══════════════════════════════════════════════════════════════════
  // ── GMAIL (15 scripts) ────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  "ler-emails-gmail": [
    {
      title: "Abra o aplicativo Gmail",
      instruction: "Procure o aplicativo com desenho de envelope vermelho e branco e toque para abrir.",
      imageAlt: "Tela inicial do celular com o ícone do aplicativo Gmail em destaque.",
    },
    {
      title: "Toque no e-mail que deseja ler",
      instruction: "Na sua 'Caixa de entrada', os e-mails mais recentes ficam no topo. Toque na linha do e-mail que você quer abrir.",
      imageAlt: "Lista de e-mails recebidos na caixa de entrada do Gmail.",
    },
    {
      title: "Leia a mensagem com calma",
      instruction: "O texto do e-mail abrirá na tela inteira. Para voltar à lista principal, toque na setinha de voltar no topo esquerdo.",
      imageAlt: "E-mail aberto com remetente, assunto, texto e seta de voltar destacada.",
    },
  ],

  "enviar-email-gmail": [
    {
      title: "Toque no botão 'Escrever'",
      instruction: "No canto inferior direito do aplicativo Gmail, toque no botão oval 'Escrever' (com desenho de caneta).",
      imageAlt: "Tela do Gmail com o botão flutuante Escrever em destaque.",
    },
    {
      title: "Preencha para quem vai a mensagem",
      instruction: "No campo 'Para', digite o endereço de e-mail da pessoa. No campo 'Assunto', escreva um resumo do motivo do contato.",
      imageAlt: "Campos 'Para' e 'Assunto' destacados na tela de novo e-mail.",
    },
    {
      title: "Escreva o texto da sua mensagem",
      instruction: "Toque na área grande em branco abaixo do assunto e digite sua mensagem com calma pelo teclado.",
      imageAlt: "Área de composição de texto do e-mail preenchida.",
    },
    {
      title: "Toque no aviãozinho azul para enviar",
      instruction: "No canto superior direito, toque no ícone em forma de triângulo/aviãozinho azul para disparar a mensagem.",
      imageAlt: "Ícone azul de envio no topo superior direito destacado.",
    },
  ],

  "recuperar-senha-gmail": [
    {
      title: "Toque em 'Esqueceu a senha?'",
      instruction: "Na tela de login do Google, digite o seu endereço de e-mail e toque no texto azul 'Esqueceu a senha?'.",
      imageAlt: "Tela de login do Google destacando a opção Esqueceu a senha.",
    },
    {
      title: "Escolha confirmação por SMS no celular",
      instruction: "Selecione a opção para receber um código de segurança por mensagem de texto (SMS) no seu número de telefone.",
      imageAlt: "Opções de recuperação do Google destacando envio de SMS.",
    },
    {
      title: "Digite o código recebido",
      instruction: "Abra a mensagem SMS recebida, veja os 6 números do código Google e digite-os na tela do aplicativo.",
      imageAlt: "Campo para inserção do código de 6 dígitos recebido por SMS.",
      warning: "Nunca diga esse código por telefone a ninguém. Ele é de uso exclusivo seu.",
    },
    {
      title: "Cadastre uma nova senha forte",
      instruction: "Crie uma nova senha, anote em seu caderno particular de anotações em casa e toque em 'Salvar senha'.",
      imageAlt: "Tela de criação e confirmação da nova senha da conta Google.",
    },
  ],

  "responder-email-gmail": [
    {
      title: "Abra o e-mail que recebeu",
      instruction: "Toque na mensagem que você quer responder para abri-la na tela inteira.",
      imageAlt: "Mensagem de e-mail aberta.",
    },
    {
      title: "Toque em Responder no rodapé",
      instruction: "Role até o final do e-mail e toque no botão 'Responder' (ícone de seta virada para a esquerda).",
      imageAlt: "Botão Responder destacado no final da mensagem.",
    },
    {
      title: "Digite sua resposta e envie",
      instruction: "Escreva seu texto e toque no aviãozinho azul no canto superior direito para mandar a resposta.",
      imageAlt: "Campo de resposta com texto e botão de envio destacado.",
    },
  ],

  "anexar-foto-documento-gmail": [
    {
      title: "Ao escrever o e-mail, olhe o topo",
      instruction: "Com a tela de escrever e-mail aberta, olhe para a barra no canto superior direito.",
      imageAlt: "Barra superior da tela de nova mensagem do Gmail.",
    },
    {
      title: "Toque no ícone de clipe de papel",
      instruction: "Toque no desenho de 'Clipe de papel' e selecione a opção 'Anexar arquivo'.",
      imageAlt: "Menu suspenso com a opção Anexar arquivo destacada.",
    },
    {
      title: "Escolha o arquivo no celular",
      instruction: "Toque na foto ou documento em PDF salvo no seu celular que deseja enviar junto.",
      imageAlt: "Gerenciador de arquivos do celular exibindo fotos e documentos.",
    },
    {
      title: "Confira e envie",
      instruction: "Veja o arquivo carregado na parte de baixo do e-mail e toque no aviãozinho azul para enviar.",
      imageAlt: "Anexo anexado ao e-mail com botão azul de envio.",
    },
  ],

  "baixar-anexo-gmail": [
    {
      title: "Abra o e-mail com o arquivo",
      instruction: "Toque na mensagem que tem o anexo que você precisa baixar.",
      imageAlt: "E-mail com anexo exibido na tela.",
    },
    {
      title: "Role até o final do e-mail",
      instruction: "Desça a tela até encontrar o retângulo com a prévia do arquivo ou foto.",
      imageAlt: "Cartão do arquivo anexo no final do e-mail.",
    },
    {
      title: "Toque na setinha para baixo",
      instruction: "Toque no ícone de 'Seta apontando para baixo' (Download). O arquivo será salvo na pasta Downloads do seu celular.",
      imageAlt: "Ícone de download destacado no anexo.",
    },
  ],

  "apagar-emails-lixeira-gmail": [
    {
      title: "Segure o dedo sobre o e-mail",
      instruction: "Na caixa de entrada, aperte e segure o dedo por 2 segundos na mensagem que quer apagar até aparecer uma marquinha de seleção.",
      imageAlt: "E-mail selecionado na lista de entrada.",
    },
    {
      title: "Toque na lixeira no topo",
      instruction: "Olhe para a parte superior da tela e toque no desenho de 'Lixeira'.",
      imageAlt: "Barra superior do Gmail com o ícone de lixeira em destaque.",
    },
    {
      title: "Confira a exclusão",
      instruction: "A mensagem sumirá da caixa de entrada e irá para a lixeira. Uma tarja preta confirmará que foi excluído.",
      imageAlt: "Aviso de confirmação de exclusão na parte inferior.",
    },
  ],

  "favoritar-email-estrela-gmail": [
    {
      title: "Localize o e-mail importante",
      instruction: "Na lista de e-mails, procure o recado ou recibo que você não quer perder de vista.",
      imageAlt: "Lista de e-mails com estrelas vazias ao lado.",
    },
    {
      title: "Toque na estrelinha ao lado da mensagem",
      instruction: "No cantinho direito da linha do e-mail, toque no desenho de estrela. Ela ficará toda amarela/dourada.",
      imageAlt: "Estrela amarela preenchida ao lado do e-mail.",
    },
    {
      title: "Ache na pasta Com Estrela",
      instruction: "Quando quiser achar essas mensagens, toque nas três barrinhas no topo esquerdo e escolha 'Com estrela'.",
      imageAlt: "Menu lateral destacando a pasta Com estrela.",
    },
  ],

  "pesquisar-email-antigo-gmail": [
    {
      title: "Toque na barra 'Pesquisar no e-mail'",
      instruction: "No topo do aplicativo, toque dentro da barra branca de pesquisa.",
      imageAlt: "Barra de pesquisa do Gmail em destaque.",
    },
    {
      title: "Digite o nome da pessoa ou empresa",
      instruction: "Digite o assunto que procura (ex: 'Exame', 'Boleto', 'Maria') e toque na lupa do teclado.",
      imageAlt: "Teclado aberto digitando o termo de pesquisa.",
    },
    {
      title: "Toque no e-mail encontrado",
      instruction: "O aplicativo mostrará apenas as mensagens que têm aquela palavra. Toque na mensagem para ler.",
      imageAlt: "Lista de resultados da pesquisa com o e-mail procurado.",
    },
  ],

  "identificar-golpe-email-gmail": [
    {
      title: "Desconfie de pedidos de dinheiro ou prêmios",
      instruction: "Se receber e-mail dizendo que você ganhou um prêmio que não concorreu ou que sua conta bancária foi bloqueada, PARE.",
      imageAlt: "E-mail suspeito de golpe com tom alarmista.",
      warning: "Bancos não pedem senha nem atualização cadastral por e-mail.",
    },
    {
      title: "Olhe quem é o remetente real",
      instruction: "Toque no nome de quem mandou para ver o endereço de e-mail completo. Se tiver letras e números estranhos, é golpe.",
      imageAlt: "Detalhes do remetente com endereço suspeito em destaque.",
    },
    {
      title: "NUNCA clique em botões ou links azuis",
      instruction: "Não aperte botões como 'Clique aqui para atualizar' ou 'Baixar fatura'. Eles levam para páginas falsas.",
      imageAlt: "Aviso de segurança alertando para não clicar em links do e-mail.",
    },
    {
      title: "Toque nos três pontinhos e Denuncie Spam",
      instruction: "No topo direito do e-mail, toque nos três pontinhos e selecione 'Denunciar spam' para bloquear o golpista.",
      imageAlt: "Opção Denunciar spam no menu do Gmail.",
    },
  ],

  "esvaziar-lixeira-gmail": [
    {
      title: "Abra o menu lateral",
      instruction: "No topo esquerdo do Gmail, toque no ícone de três barrinhas horizontais.",
      imageAlt: "Ícone de menu de três barrinhas no canto superior esquerdo.",
    },
    {
      title: "Toque na pasta 'Lixeira'",
      instruction: "Role a lista para baixo e toque na opção 'Lixeira' (ícone de lata de lixo).",
      imageAlt: "Menu lateral do Gmail destacando a pasta Lixeira.",
    },
    {
      title: "Toque em 'Esvaziar lixeira agora'",
      instruction: "No topo das mensagens descartadas, toque no texto azul 'Esvaziar lixeira agora'.",
      imageAlt: "Botão azul Esvaziar lixeira agora em destaque.",
    },
    {
      title: "Confirme a limpeza",
      instruction: "Toque em 'Esvaziar' na confirmação. Todo o espaço ocupado por e-mails velhos será liberado na sua conta.",
      imageAlt: "Janela de confirmação com botão de esvaziar definitivo.",
    },
  ],

  "cancelar-envio-email-gmail": [
    {
      title: "Logo após enviar, olhe para o rodapé",
      instruction: "Assim que tocar no botão de envio do e-mail, olhe imediatamente para a parte de baixo da tela.",
      imageAlt: "Faixa preta de notificação aparecendo no rodapé do celular.",
    },
    {
      title: "Toque rapidamente em 'Desfazer'",
      instruction: "Aparecerá uma tarja preta dizendo 'Enviado' com a palavra 'Desfazer' em amarelo ou azul. Dê um toque rápido em 'Desfazer'.",
      imageAlt: "Botão Desfazer em destaque na faixa preta inferior.",
    },
    {
      title: "Corrija o e-mail antes de enviar",
      instruction: "O envio será cancelado e o seu e-mail voltará aberto na tela para você corrigir o texto ou o destinatário.",
      imageAlt: "E-mail reaberto para edição segura.",
    },
  ],

  "marcar-email-como-lido-gmail": [
    {
      title: "Segure o dedo sobre a mensagem",
      instruction: "Segure o dedo em cima do e-mail que está em negrito (não lido) até aparecer o sinal de verificado.",
      imageAlt: "E-mail em negrito selecionado com marca de verificação.",
    },
    {
      title: "Toque no ícone de envelope aberto no topo",
      instruction: "Olhe para a barra superior e toque no desenho de um 'Envelope aberto'.",
      imageAlt: "Ícone de envelope aberto na barra superior.",
    },
    {
      title: "Confira a mensagem marcada como lida",
      instruction: "As letras da mensagem ficarão normais e a bolinha de aviso sumirá da sua tela.",
      imageAlt: "Caixa de entrada com mensagem em formato normal de leitura.",
    },
  ],

  "trocar-senha-gmail": [
    {
      title: "Toque na sua foto de perfil",
      instruction: "No canto superior direito do Gmail, toque no círculo com a sua foto ou inicial do nome.",
      imageAlt: "Foto de perfil no canto superior direito do Gmail.",
    },
    {
      title: "Toque em 'Conta do Google'",
      instruction: "Toque no botão 'Conta do Google' ou 'Gerenciar sua Conta do Google'.",
      imageAlt: "Painel da conta Google com botão Gerenciar Conta.",
    },
    {
      title: "Toque na aba 'Segurança'",
      instruction: "Arraste as abas superiores para o lado e toque em 'Segurança'. Depois toque em 'Senha'.",
      imageAlt: "Aba Segurança destacando o campo Senha.",
    },
    {
      title: "Cadastre e confirme a nova senha",
      instruction: "Digite sua senha antiga para confirmar que é você, depois digite a nova senha segura e toque em 'Alterar senha'.",
      imageAlt: "Campos de criação e confirmação da nova senha.",
    },
  ],

  "bloquear-remetente-spam-gmail": [
    {
      title: "Abra a mensagem da empresa chata",
      instruction: "Toque no e-mail de propaganda ou mensagens indesejadas para abrir.",
      imageAlt: "E-mail de propaganda aberto.",
    },
    {
      title: "Toque nos três pontinhos ao lado do nome",
      instruction: "Atenção: toque nos três pontinhos pequenos que ficam ao lado do nome de quem enviou (não nos do topo da tela).",
      imageAlt: "Três pontinhos ao lado do nome do remetente em destaque.",
    },
    {
      title: "Toque em 'Bloquear [Nome]'",
      instruction: "Selecione a opção 'Bloquear'. As próximas mensagens dessa empresa irão direto para o lixo sem incomodar você.",
      imageAlt: "Opção Bloquear remetente no menu suspenso.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════
  // ── YOUTUBE (15 scripts) ──────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  "pesquisar-video-youtube": [
    {
      title: "Abra o aplicativo YouTube",
      instruction: "Toque no ícone vermelho do YouTube com o triângulo branco de reproduzir no centro.",
      imageAlt: "Tela inicial do celular com o ícone do YouTube destacado.",
    },
    {
      title: "Toque na lupa no topo",
      instruction: "No canto superior direito, toque no desenho de lupa. Se preferir falar em vez de digitar, toque no microfone.",
      imageAlt: "Barra superior do YouTube destacando o ícone de lupa e o microfone.",
    },
    {
      title: "Escolha o vídeo nos resultados",
      instruction: "Veja a lista de vídeos que apareceram e toque na foto do vídeo que você deseja assistir.",
      imageAlt: "Lista de resultados de pesquisa com capas de vídeos em destaque.",
    },
  ],

  "aumentar-volume-youtube": [
    {
      title: "Use os botões de volume do celular",
      instruction: "Aperte o botão de volume para cima na lateral do seu aparelho para deixar o som bem audível.",
      imageAlt: "Indicação dos botões físicos de volume na lateral do aparelho.",
    },
    {
      title: "Toque no vídeo para ver os controles",
      instruction: "Dê um toque no centro do vídeo. Aparecerão botões brancos na tela.",
      imageAlt: "Vídeo do YouTube com controles de reprodução visíveis.",
    },
    {
      title: "Toque no quadradinho de tela cheia",
      instruction: "No cantinho inferior direito do vídeo, toque no pequeno quadrado para deitar a tela e ver em tela inteira.",
      imageAlt: "Ícone de quadrado no canto inferior direito do vídeo destacado.",
    },
  ],

  "salvar-video-youtube": [
    {
      title: "Toque no vídeo que você gostou",
      instruction: "Abra o vídeo que você deseja guardar para ver novamente outro dia.",
      imageAlt: "Vídeo sendo reproduzido no YouTube.",
    },
    {
      title: "Deslize os botões abaixo do vídeo",
      instruction: "Abaixo do vídeo, onde tem Curtir e Compartilhar, deslize os botões para o lado até achar 'Salvar'.",
      imageAlt: "Barra de ações abaixo do vídeo com a opção Salvar em destaque.",
    },
    {
      title: "Toque em Salvar e escolha a lista",
      instruction: "Toque em 'Salvar' e selecione 'Assistir mais tarde'. Para achar depois, toque em 'Você' no rodapé do YouTube.",
      imageAlt: "Menu de confirmação de vídeo salvo na lista Assistir mais tarde.",
    },
  ],

  "pausar-e-voltar-video-youtube": [
    {
      title: "Dê um toque no centro do vídeo",
      instruction: "Toque uma vez no meio da tela para fazer os botões de controle aparecerem.",
      imageAlt: "Vídeo do YouTube com controles brancos visíveis.",
    },
    {
      title: "Toque nas duas barrinhas para pausar",
      instruction: "No centro da tela, toque nas duas barrinhas verticais (||). O vídeo ficará congelado para você fazer o que precisa.",
      imageAlt: "Botão central de pausa em destaque.",
    },
    {
      title: "Arraste a bolinha vermelha para voltar",
      instruction: "Na barra vermelha no rodapé do vídeo, coloque o dedo na bolinha e puxe para a esquerda para voltar a cena.",
      imageAlt: "Linha do tempo vermelha com a bolinha sendo arrastada para trás.",
    },
  ],

  "pular-anuncios-youtube": [
    {
      title: "Aguarde a contagem de 5 segundos",
      instruction: "Quando começar a propaganda, repare no canto inferior direito do vídeo a contagem 'Pular em 5, 4, 3...'.",
      imageAlt: "Propaganda no YouTube com contagem regressiva no canto direito.",
    },
    {
      title: "Toque no botão 'Pular anúncio'",
      instruction: "Assim que a contagem terminar, aparecerá um retângulo cinza escrito 'Pular anúncio'. Dê um toque nele.",
      imageAlt: "Botão Pular anúncio destacado no canto do vídeo.",
    },
    {
      title: "Aproveite seu vídeo sem interrupção",
      instruction: "A propaganda sumirá e o seu vídeo principal começará a tocar imediatamente.",
      imageAlt: "Vídeo principal iniciando a reprodução.",
    },
  ],

  "inscrever-se-canal-youtube": [
    {
      title: "Localize o nome do canal abaixo do vídeo",
      instruction: "Olhe logo abaixo da tela do vídeo onde aparece a foto redonda e o nome de quem gravou.",
      imageAlt: "Área de identificação do canal abaixo do vídeo.",
    },
    {
      title: "Toque no botão 'Inscrever-se'",
      instruction: "Toque no botão em formato de pílula (geralmente preto ou branco) escrito 'Inscrever-se'. É 100% gratuito e seguro.",
      imageAlt: "Botão Inscrever-se em destaque.",
    },
    {
      title: "Toque no sininho para receber avisos",
      instruction: "Toque no desenho de 'Sino' ao lado e escolha 'Todas'. Assim o YouTube avisa quando sair vídeo novo desse criador.",
      imageAlt: "Ícone de sininho ativado confirmando notificações.",
    },
  ],

  "ativar-legendas-youtube": [
    {
      title: "Toque na tela do vídeo",
      instruction: "Dê um toque no centro do vídeo enquanto ele estiver tocando para mostrar os botões de controle.",
      imageAlt: "Controles do vídeo visíveis na tela.",
    },
    {
      title: "Toque no quadradinho 'CC' no topo",
      instruction: "No canto superior direito do vídeo, toque no ícone com as duas letras 'CC' (legendas).",
      imageAlt: "Ícone CC no canto superior direito do player.",
    },
    {
      title: "Acompanhe o texto na tela",
      instruction: "As falas do vídeo começarão a aparecer escritas em letras brancas na parte inferior da tela.",
      imageAlt: "Legendas em português aparecendo no rodapé do vídeo.",
    },
  ],

  "diminuir-velocidade-video-youtube": [
    {
      title: "Toque na engrenagem de configurações",
      instruction: "Dê um toque no vídeo e depois toque no desenho de 'Engrenagem' no canto superior direito.",
      imageAlt: "Ícone de engrenagem no topo direito do vídeo.",
    },
    {
      title: "Toque em 'Velocidade da reprodução'",
      instruction: "No menu que abrir na parte de baixo da tela, procure e toque em 'Velocidade da reprodução'.",
      imageAlt: "Menu de configurações com a opção Velocidade da reprodução destacada.",
    },
    {
      title: "Escolha a velocidade 0.75x",
      instruction: "Selecione a opção '0.75x' (um pouco mais lenta) para o apresentador falar mais pausado.",
      imageAlt: "Lista de velocidades destacando 0.75x.",
    },
    {
      title: "Assista com calma",
      instruction: "O vídeo tocará em ritmo mais devagar, facilitando anotar ingredientes de receitas ou entender explicações.",
      imageAlt: "Vídeo sendo reproduzido em velocidade mais calma.",
    },
  ],

  "ver-historico-videos-youtube": [
    {
      title: "Toque na aba 'Você' no rodapé",
      instruction: "No canto inferior direito da tela do YouTube, toque no círculo com a sua foto ou desenho de pessoa chamado 'Você'.",
      imageAlt: "Rodapé do YouTube com a aba Você em destaque.",
    },
    {
      title: "Localize a seção 'Histórico'",
      instruction: "No topo dessa tela, você verá a lista de vídeos que você assistiu recentemente.",
      imageAlt: "Carrossel de histórico com as capas dos vídeos recentes.",
    },
    {
      title: "Toque no vídeo para rever",
      instruction: "Toque na capa do vídeo que você queria rever. Ele continuará exatamente de onde você parou.",
      imageAlt: "Vídeo reabrindo na posição anterior.",
    },
  ],

  "compartilhar-video-familia-youtube": [
    {
      title: "Olhe os botões abaixo do vídeo",
      instruction: "Abaixo da tela do vídeo, procure a barra com os botões Curtir, Compartilhar e Salvar.",
      imageAlt: "Barra de botões abaixo do reprodutor do YouTube.",
    },
    {
      title: "Toque no botão 'Compartilhar'",
      instruction: "Toque no botão com o desenho de uma seta curvada escrito 'Compartilhar'.",
      imageAlt: "Botão Compartilhar em destaque.",
    },
    {
      title: "Toque no ícone do WhatsApp",
      instruction: "Na janelinha que abrir na parte de baixo, selecione o círculo verde do WhatsApp.",
      imageAlt: "Opções de compartilhamento destacando o WhatsApp.",
    },
    {
      title: "Escolha a pessoa e envie",
      instruction: "Selecione a conversa ou grupo da família e toque na setinha verde para mandar o link do vídeo.",
      imageAlt: "Conversa do WhatsApp com o link do vídeo enviado.",
    },
  ],

  "assistir-transmissoes-ao-vivo-youtube": [
    {
      title: "Pesquise pelo evento ou missa",
      instruction: "Na barra de busca do YouTube, digite o nome do canal ou evento (ex: 'Missa ao vivo', 'Jornal ao vivo').",
      imageAlt: "Barra de busca com pesquisa de transmissão ao vivo.",
    },
    {
      title: "Procure a tag vermelha 'AO VIVO'",
      instruction: "Nos resultados, procure os vídeos que têm um selo vermelho escrito 'AO VIVO' na capa.",
      imageAlt: "Capa de vídeo exibindo a etiqueta vermelha AO VIVO.",
    },
    {
      title: "Toque para assistir em tempo real",
      instruction: "Dê um toque no vídeo. Você estará acompanhando a cerimônia ou notícia no mesmo instante em que ela acontece.",
      imageAlt: "Transmissão ao vivo sendo reproduzida com chat e indicador ao vivo.",
    },
  ],

  "melhorar-qualidade-imagem-youtube": [
    {
      title: "Toque na engrenagem no vídeo",
      instruction: "Dê um toque no centro do vídeo e toque no desenho de 'Engrenagem' no canto superior direito.",
      imageAlt: "Ícone de engrenagem no canto superior direito.",
    },
    {
      title: "Toque em 'Qualidade'",
      instruction: "No menu inferior, toque na primeira opção: 'Qualidade' (com desenho de engrenagem).",
      imageAlt: "Menu de configurações destacando a opção Qualidade.",
    },
    {
      title: "Escolha 'Qualidade de imagem mais alta'",
      instruction: "Toque na opção 'Qualidade de imagem mais alta'. O YouTube ajustará o vídeo para a imagem mais bonita e nítida.",
      imageAlt: "Opções de qualidade destacando Imagem mais alta.",
    },
    {
      title: "Aguarde a imagem clarear",
      instruction: "Em poucos segundos o vídeo carregará em alta definição com letras e rostos totalmente nítidos.",
      imageAlt: "Vídeo em alta definição com nitidez.",
    },
  ],

  "desativar-reproducao-automatica-youtube": [
    {
      title: "Abra qualquer vídeo",
      instruction: "Comece a reproduzir qualquer vídeo no aplicativo YouTube.",
      imageAlt: "Vídeo tocando na tela do celular.",
    },
    {
      title: "Olhe para a parte superior do vídeo",
      instruction: "Dê um toque na tela e olhe para o topo do vídeo, ao lado da engrenagem.",
      imageAlt: "Topo do reprodutor com ícone de chavinha de reprodução.",
    },
    {
      title: "Desative a chavinha com triângulo",
      instruction: "Toque na pequena chave com triângulo e duas barrinhas. Ela ficará desligada (com símbolo de pausa), impedindo vídeos seguintes de tocarem sozinhos.",
      imageAlt: "Chavinha desativada confirmando que o autoplay está desligado.",
    },
  ],

  "pesquisar-por-voz-youtube": [
    {
      title: "Toque no microfone no topo",
      instruction: "No canto superior direito da tela inicial do YouTube, toque no desenho de 'Microfone' (ao lado da lupa).",
      imageAlt: "Ícone de microfone no topo direito do YouTube.",
    },
    {
      title: "Permita o uso do microfone se pedir",
      instruction: "Se o celular perguntar pela primeira vez, toque em 'Permitir' para o YouTube ouvir você.",
      imageAlt: "Janela de permissão do microfone.",
    },
    {
      title: "Fale o que deseja ouvir ou assistir",
      instruction: "Fale com clareza (ex: 'Músicas antigas dos anos 70', 'Receita de bolo de fubá'). O YouTube buscará na mesma hora.",
      imageAlt: "Tela de escuta do YouTube transcrevendo a fala para busca.",
    },
  ],

  "criar-lista-musicas-favoritas-youtube": [
    {
      title: "No vídeo da música, toque em 'Salvar'",
      instruction: "Na barra de botões abaixo do vídeo, procure e toque no botão 'Salvar'.",
      imageAlt: "Botão Salvar destacado abaixo do vídeo.",
    },
    {
      title: "Toque em 'Nova playlist'",
      instruction: "Na janelinha que subir no rodapé, toque em 'Nova playlist' com o sinal de Mais (+).",
      imageAlt: "Opção Nova playlist em destaque.",
    },
    {
      title: "Digite o nome da sua lista",
      instruction: "Escreva um nome simples (ex: 'Minhas Músicas') e toque no botão 'Criar'.",
      imageAlt: "Campo de título da playlist preenchido.",
    },
    {
      title: "Ache sua lista na aba 'Você'",
      instruction: "Pronto! Sempre que quiser ouvir suas músicas reunidas, toque na aba 'Você' no rodapé do YouTube.",
      imageAlt: "Aba Você com a nova playlist criada.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════
  // ── GOOGLE FOTOS (15 scripts) ─────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  "encontrar-fotos-antigas": [
    {
      title: "Abra o aplicativo Google Fotos",
      instruction: "Toque no ícone do Google Fotos (desenho de catavento com pétalas coloridas).",
      imageAlt: "Tela inicial com o ícone do Google Fotos em destaque.",
    },
    {
      title: "Role a tela para cima com o dedo",
      instruction: "Passe o dedo na tela de baixo para cima. Você verá os meses e os anos das fotos passando no canto direito.",
      imageAlt: "Mural de fotos com indicador lateral de anos e meses.",
    },
    {
      title: "Toque na foto para abrir grande",
      instruction: "Ao achar a foto que queria, dê um toque nela. Ela vai abrir ocupando a tela inteira com nitidez.",
      imageAlt: "Foto da família aberta em tela cheia.",
    },
  ],

  "compartilhar-fotos-galeria": [
    {
      title: "Abra a foto que você quer enviar",
      instruction: "No Google Fotos, toque na imagem que você quer mostrar para seus amigos ou família.",
      imageAlt: "Foto aberta em tela cheia.",
    },
    {
      title: "Toque no botão 'Compartilhar'",
      instruction: "No rodapé da tela, toque no primeiro botão à esquerda: 'Compartilhar' (ícone de seta ou ramos).",
      imageAlt: "Barra inferior da foto com o botão Compartilhar em destaque.",
    },
    {
      title: "Escolha o aplicativo ou contato",
      instruction: "Na janelinha que abrir na parte de baixo, escolha o aplicativo de mensagens ou toque no contato desejado.",
      imageAlt: "Janela de compartilhamento destacando os aplicativos e contatos.",
    },
    {
      title: "Confirme e envie",
      instruction: "Confira o nome da pessoa que vai receber a foto e confirme o envio.",
      imageAlt: "Tela de confirmação com o botão de envio.",
    },
  ],

  "liberar-espaco-fotos": [
    {
      title: "Toque na sua foto de perfil no topo",
      instruction: "No canto superior direito do Google Fotos, toque no círculo com a sua foto ou com a inicial do seu nome.",
      imageAlt: "Tela principal do Fotos com a foto de perfil destacada no canto superior direito.",
    },
    {
      title: "Toque em 'Liberar espaço'",
      instruction: "Procure e toque no botão 'Liberar espaço neste dispositivo' (ícone de lixeira ou vassourinha).",
      imageAlt: "Menu de perfil com a opção Liberar espaço em destaque.",
    },
    {
      title: "Confira a quantidade de espaço",
      instruction: "O aplicativo mostrará quanto espaço você vai economizar sem perder nada que já foi salvo na nuvem.",
      imageAlt: "Mensagem informativa mostrando a quantidade de Gigabytes a serem liberados.",
    },
    {
      title: "Toque no botão azul 'Liberar'",
      instruction: "Confirme tocando no botão azul. O celular apagará apenas as cópias locais, mantendo tudo salvo para sempre na internet.",
      imageAlt: "Botão azul de confirmação de liberação de espaço com segurança.",
    },
  ],

  "criar-album-fotos": [
    {
      title: "Toque na aba 'Biblioteca' ou 'Coleções'",
      instruction: "No rodapé do Google Fotos, toque na aba 'Biblioteca' ou 'Coleções' (ícone de pastas).",
      imageAlt: "Rodapé do aplicativo com a aba Biblioteca destacada.",
    },
    {
      title: "Toque no botão 'Novo álbum'",
      instruction: "Toque no cartão com o sinal de Mais (+) escrito 'Novo álbum'.",
      imageAlt: "Cartão Novo álbum em destaque.",
    },
    {
      title: "Digite o título do álbum",
      instruction: "Escreva o nome do álbum (ex: 'Netos', 'Aniversário 70 Anos', 'Viagem à Praia').",
      imageAlt: "Campo de título do novo álbum preenchido.",
    },
    {
      title: "Selecione as fotos e toque em Concluir",
      instruction: "Toque no botão 'Adicionar fotos', marque as fotos desejadas e toque em 'Concluir' no canto superior direito.",
      imageAlt: "Fotos selecionadas com botão Concluir em destaque.",
    },
  ],

  "apagar-fotos-borradas-fotos": [
    {
      title: "Abra a foto que ficou ruim",
      instruction: "Dê um toque na foto tremida, escura ou repetida para ela abrir na tela.",
      imageAlt: "Foto borrada aberta na tela.",
    },
    {
      title: "Toque no ícone de lixeira no rodapé",
      instruction: "No canto inferior direito, toque no desenho de 'Lixeira' (Excluir).",
      imageAlt: "Ícone de lixeira no rodapé em destaque.",
    },
    {
      title: "Toque em 'Mover para a lixeira'",
      instruction: "Confirme tocando no botão azul 'Mover para a lixeira'. A foto ruim sairá da sua galeria.",
      imageAlt: "Botão de confirmação de exclusão.",
    },
  ],

  "recuperar-fotos-lixeira-fotos": [
    {
      title: "Abra a aba 'Biblioteca' ou 'Coleções'",
      instruction: "No rodapé do Google Fotos, toque na aba 'Biblioteca' ou 'Coleções'.",
      imageAlt: "Aba Biblioteca selecionada no rodapé.",
    },
    {
      title: "Toque na pasta 'Lixeira'",
      instruction: "Na parte de cima da tela, procure e abra a pasta chamada 'Lixeira'.",
      imageAlt: "Pasta Lixeira destacada no menu do Fotos.",
    },
    {
      title: "Segure o dedo sobre a foto apagada",
      instruction: "Procure a foto que você apagou por engano e aperte e segure o dedo sobre ela para selecionar.",
      imageAlt: "Foto selecionada dentro da lixeira.",
    },
    {
      title: "Toque em 'Restaurar'",
      instruction: "No rodapé da tela, toque no botão 'Restaurar'. A foto voltará imediatamente para a sua galeria principal.",
      imageAlt: "Botão Restaurar destacado no rodapé.",
    },
  ],

  "favoritar-fotos-fotos": [
    {
      title: "Abra a foto que você mais gostou",
      instruction: "Dê um toque na foto especial para abri-la em tamanho grande.",
      imageAlt: "Foto bonita aberta na tela.",
    },
    {
      title: "Toque na estrelinha no topo da tela",
      instruction: "No topo superior direito, toque no desenho de 'Estrela' vazia. Ela ficará toda preenchida de branco.",
      imageAlt: "Estrela preenchida no topo da foto.",
    },
    {
      title: "Ache na pasta Favoritos",
      instruction: "Pronto! Todas as fotos favoritadas ficam reunidas na pasta 'Favoritos' na aba Biblioteca para você mostrar aos amigos.",
      imageAlt: "Pasta Favoritos na aba Biblioteca.",
    },
  ],

  "procurar-fotos-pessoas-fotos": [
    {
      title: "Toque na aba 'Pesquisar' no rodapé",
      instruction: "No rodapé do aplicativo, toque no ícone de lupa escrito 'Pesquisar'.",
      imageAlt: "Aba Pesquisar destacada no rodapé do Fotos.",
    },
    {
      title: "Olhe a seção 'Pessoas e animais'",
      instruction: "Na parte de cima da tela de pesquisa, você verá círculos com os rostos dos seus familiares.",
      imageAlt: "Círculos com fotos de rostos de familiares em destaque.",
    },
    {
      title: "Toque no rosto da pessoa",
      instruction: "Dê um toque no rosto do seu filho ou neto. O aplicativo mostrará todas as fotos onde ele aparece desde pequeno.",
      imageAlt: "Mural com todas as fotos daquela pessoa reunidas.",
    },
  ],

  "cortar-clarear-foto-fotos": [
    {
      title: "Abra a foto que deseja melhorar",
      instruction: "Toque na foto que está escura ou com bordas indesejadas.",
      imageAlt: "Foto aberta em tela cheia.",
    },
    {
      title: "Toque no botão 'Editar'",
      instruction: "No rodapé da tela, toque no botão 'Editar' (ícone com três barrinhas de ajuste).",
      imageAlt: "Botão Editar destacado no rodapé.",
    },
    {
      title: "Ajuste o corte ou o brilho",
      instruction: "Toque em 'Cortar' para enquadrar melhor ou toque em 'Ajustar' > 'Brilho' para clarear a imagem.",
      imageAlt: "Ferramenta de corte e brilho em ação.",
    },
    {
      title: "Toque em 'Salvar cópia'",
      instruction: "No canto inferior direito, toque no botão azul 'Salvar cópia'. O Google Fotos manterá a original e a nova ajustada.",
      imageAlt: "Botão azul Salvar cópia em destaque.",
    },
  ],

  "baixar-foto-da-nuvem-fotos": [
    {
      title: "Abra a foto desejada",
      instruction: "Dê um toque na fotografia para vê-la em tamanho grande.",
      imageAlt: "Fotografia aberta no aplicativo.",
    },
    {
      title: "Toque nos três pontinhos no topo direito",
      instruction: "No canto superior direito da tela, toque nos três pontinhos verticais.",
      imageAlt: "Ícone de três pontinhos no topo da foto.",
    },
    {
      title: "Toque em 'Fazer download'",
      instruction: "No menu de ações, toque em 'Fazer download'. Uma cópia da foto será gravada direto na memória do celular.",
      imageAlt: "Opção Fazer download destacada no menu.",
    },
  ],

  "enviar-varias-fotos-fotos": [
    {
      title: "Segure o dedo sobre a primeira foto",
      instruction: "Na galeria, segure o dedo por 2 segundos na primeira foto até ela ficar com uma bolinha azul de verificado.",
      imageAlt: "Primeira foto marcada com círculo azul.",
    },
    {
      title: "Dê um toque nas outras fotos",
      instruction: "Agora basta dar um toque em cada uma das outras fotos que você também deseja mandar juntas.",
      imageAlt: "Várias fotos marcadas com círculos azuis de seleção.",
    },
    {
      title: "Toque no botão 'Compartilhar'",
      instruction: "No canto superior esquerdo ou rodapé, toque no ícone de 'Compartilhar'.",
      imageAlt: "Botão Compartilhar em destaque com contagem de fotos.",
    },
    {
      title: "Escolha o contato e envie",
      instruction: "Selecione o aplicativo de mensagens e o amigo que vai receber todas as fotos selecionadas de uma vez.",
      imageAlt: "Confirmação de envio do lote de fotos.",
    },
  ],

  "criar-colagem-fotos": [
    {
      title: "Toque na aba 'Biblioteca' ou 'Coleções'",
      instruction: "No rodapé do Fotos, toque em 'Biblioteca' ou 'Coleções'.",
      imageAlt: "Aba Biblioteca selecionada.",
    },
    {
      title: "Toque em 'Utilitários' e 'Colagem'",
      instruction: "Procure e toque no botão 'Colagem' (ícone com quadradinhos divididos).",
      imageAlt: "Opção Colagem destacada no menu de utilitários.",
    },
    {
      title: "Escolha de 2 a 6 fotos",
      instruction: "Dê um toque nas fotos daquele momento especial que você quer colocar lado a lado.",
      imageAlt: "Fotos selecionadas para a montagem.",
    },
    {
      title: "Toque em 'Criar' no topo",
      instruction: "Toque no botão 'Criar' no canto superior direito. O aplicativo gerará a colagem pronta para você salvar ou compartilhar.",
      imageAlt: "Colagem montada pronta para visualização.",
    },
  ],

  "conferir-backup-ativado-fotos": [
    {
      title: "Toque na sua foto de perfil",
      instruction: "No canto superior direito da tela inicial do Fotos, dê um toque na sua foto ou inicial de perfil.",
      imageAlt: "Foto de perfil no canto superior direito.",
    },
    {
      title: "Olhe o aviso de status do backup",
      instruction: "Veja o texto logo abaixo do seu nome: se estiver escrito 'Backup concluído' com uma nuvem verde, está tudo protegido.",
      imageAlt: "Painel da conta mostrando Backup concluído com ícone de nuvem.",
    },
    {
      title: "Ative se estiver desativado",
      instruction: "Se disser 'O backup está desativado', basta dar um toque para ativar e garantir que nenhuma foto se perca.",
      imageAlt: "Botão para ativar backup se necessário.",
    },
  ],

  "ver-detalhes-data-local-fotos": [
    {
      title: "Abra a foto desejada",
      instruction: "Toque na fotografia para abri-la em tela cheia.",
      imageAlt: "Foto aberta na tela inteira.",
    },
    {
      title: "Deslize o dedo de baixo para cima",
      instruction: "Passe o dedo na tela de baixo para cima como se estivesse empurrando a foto para cima.",
      imageAlt: "Painel de informações subindo na parte inferior da tela.",
    },
    {
      title: "Confira a data e o mapa",
      instruction: "Você verá o dia da semana, o ano em que foi tirada e um mapinha mostrando a cidade e o bairro onde você estava.",
      imageAlt: "Informações de data, horário e mapa de localização da foto.",
    },
  ],

  "compartilhar-album-familia-fotos": [
    {
      title: "Abra o álbum de fotos criado",
      instruction: "Na aba Biblioteca, toque no álbum que você montou para a família.",
      imageAlt: "Álbum de fotos aberto na tela.",
    },
    {
      title: "Toque no botão 'Compartilhar'",
      instruction: "No topo do álbum, toque no botão 'Compartilhar' (ícone de pessoa ou ramos de envio).",
      imageAlt: "Botão Compartilhar no cabeçalho do álbum.",
    },
    {
      title: "Convide os familiares",
      instruction: "Selecione o contato dos seus filhos ou netos ou toque em 'Criar link' para mandar no WhatsApp.",
      imageAlt: "Janela com lista de contatos para convite ao álbum.",
    },
    {
      title: "Envie e acompanhem juntos",
      instruction: "Todos que receberem poderão ver as fotos do álbum e também adicionar fotos novas da família.",
      imageAlt: "Álbum compartilhado ativo com fotos de vários familiares.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════
  // ── UBER (15 scripts) ─────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  "pedir-carro-uber": [
    {
      title: "Abra o aplicativo Uber",
      instruction: "Toque no ícone preto com o nome 'Uber' na tela do seu celular.",
      imageAlt: "Tela inicial do celular com o ícone do aplicativo Uber em destaque.",
    },
    {
      title: "Toque na caixa 'Para onde?'",
      instruction: "No meio da tela, toque na barra de pesquisa 'Para onde?' e digite o endereço completo do local aonde você vai.",
      imageAlt: "Tela principal do Uber com a barra de busca Para onde em destaque.",
    },
    {
      title: "Escolha a opção UberX e veja o preço",
      instruction: "O aplicativo mostrará as opções. O 'UberX' é o carro comum com o valor mais econômico. Confira o preço na tela.",
      imageAlt: "Lista de categorias de viagem com UberX e preço em destaque.",
    },
    {
      title: "Toque em 'Confirmar UberX'",
      instruction: "Toque no botão preto 'Confirmar UberX' no rodapé. O sistema começará a procurar um motorista perto de você.",
      imageAlt: "Botão preto de confirmação no rodapé da tela do Uber.",
    },
  ],

  "acompanhar-motorista-uber": [
    {
      title: "Veja a foto e o nome do motorista",
      instruction: "Assim que um motorista aceitar a viagem, a tela mostrará o nome dele, a foto e a nota de avaliação.",
      imageAlt: "Cartão inferior do Uber mostrando a foto e nome do motorista.",
    },
    {
      title: "DECORE A PLACA E A COR DO CARRO",
      instruction: "Olhe com muita atenção para as 7 letras e números da PLACA, o modelo do carro e a cor indicados na tela.",
      imageAlt: "Área destacando a placa do veículo, marca e cor.",
      warning: "Segurança total: só entre no carro se a placa de metal do veículo for IDÊNTICA à da sua tela.",
    },
    {
      title: "Acompanhe o carrinho no mapa",
      instruction: "A tela mostra onde o carro está e quantos minutos faltam para ele parar no seu local de embarque.",
      imageAlt: "Mapa com trajeto e tempo estimado de chegada do motorista.",
    },
    {
      title: "Confira a placa e embarque",
      instruction: "Quando o carro parar, vá até a traseira do veículo, leia a placa e pergunte: 'Qual o seu nome?'. Se estiver correto, embarque com tranquilidade.",
      imageAlt: "Ilustração demonstrativa de conferência da placa antes do embarque seguro.",
    },
  ],

  "pagar-uber-dinheiro-cartao": [
    {
      title: "Antes de pedir, olhe o rodapé da tela",
      instruction: "Na tela onde você escolhe o carro UberX, olhe para a linha logo acima do botão preto de confirmação.",
      imageAlt: "Tela de confirmação do Uber destacando o método de pagamento.",
    },
    {
      title: "Toque na forma de pagamento atual",
      instruction: "Toque no símbolo do cartão ou dinheiro que estiver aparecendo para abrir as opções de pagamento.",
      imageAlt: "Opções de pagamento com Dinheiro, Cartão de Crédito e Pix.",
    },
    {
      title: "Escolha Dinheiro ou Cartão cadastrado",
      instruction: "Selecione 'Dinheiro' se quiser pagar em cédulas ao motorista no final da corrida, ou 'Cartão' para pagar direto no app.",
      imageAlt: "Seleção confirmada de Dinheiro ou Cartão.",
      warning: "Se pagar em dinheiro, peça sempre o troco correto ao motorista antes de sair do carro.",
    },
  ],

  "cancelar-viagem-uber": [
    {
      title: "Deslize o painel inferior para cima",
      instruction: "Na tela com o motorista a caminho, arraste com o dedo o cartão inferior para cima para ver mais opções.",
      imageAlt: "Painel de detalhes da viagem expandido.",
    },
    {
      title: "Toque no botão 'Cancelar viagem'",
      instruction: "Procure e toque no botão vermelho escrito 'Cancelar viagem'.",
      imageAlt: "Botão vermelho Cancelar viagem em destaque.",
    },
    {
      title: "Confirme o cancelamento",
      instruction: "Toque em 'Sim, cancelar'. A corrida será cancelada imediatamente sem custo nos primeiros minutos.",
      imageAlt: "Confirmação de cancelamento da corrida.",
    },
  ],

  "compartilhar-viagem-familia-uber": [
    {
      title: "Durante a viagem, olhe a tela",
      instruction: "Com a corrida em andamento, procure o botão 'Compartilhar status da viagem'.",
      imageAlt: "Botão Compartilhar status da viagem no mapa.",
    },
    {
      title: "Toque no ícone do WhatsApp",
      instruction: "Selecione o WhatsApp na lista de aplicativos para enviar o link seguro.",
      imageAlt: "Opções de compartilhamento destacando o WhatsApp.",
    },
    {
      title: "Envie para os filhos ou parentes",
      instruction: "Selecione o contato da família e envie. Eles verão o carro andando no mapa em tempo real até você chegar.",
      imageAlt: "Link de acompanhamento enviado na conversa da família.",
    },
  ],

  "mandar-mensagem-motorista-uber": [
    {
      title: "Toque no ícone de balão de mensagem",
      instruction: "Na parte de baixo da tela, ao lado da foto do motorista, toque no desenho de balãozinho de conversa.",
      imageAlt: "Ícone de chat ao lado do motorista.",
    },
    {
      title: "Digite o ponto de referência",
      instruction: "Escreva onde você está esperando (ex: 'Estou com camisa azul em frente ao portão').",
      imageAlt: "Campo de mensagem do chat com o motorista.",
    },
    {
      title: "Toque na setinha para enviar",
      instruction: "Toque no botão de envio. O motorista lerá o recado sem precisar saber o seu número pessoal de telefone.",
      imageAlt: "Mensagem enviada com sucesso no chat do Uber.",
    },
  ],

  "ligar-para-motorista-uber": [
    {
      title: "Toque no ícone de telefone",
      instruction: "Ao lado da foto do motorista na tela, toque no desenho de fone de telefone.",
      imageAlt: "Ícone de telefone destacado no cartão do motorista.",
    },
    {
      title: "Escolha 'Ligação gratuita pelo app'",
      instruction: "Selecione a opção de ligação gratuita pela internet. O aplicativo conectará sem revelar seu número.",
      imageAlt: "Opção de chamada pelo aplicativo em destaque.",
    },
    {
      title: "Converse e combine o embarque",
      instruction: "Explique onde você está aguardando com calma e desligue no botão vermelho ao terminar.",
      imageAlt: "Tela de chamada com motorista em andamento.",
    },
  ],

  "adicionar-parada-uber": [
    {
      title: "Na tela de digitar destino, olhe o sinal Mais (+)",
      instruction: "Ao digitar para onde vai, olhe para o lado direito da caixa de endereço e toque no sinal de '+'.",
      imageAlt: "Sinal de mais ao lado do campo de destino.",
    },
    {
      title: "Digite o endereço da parada",
      instruction: "Digite o endereço do local intermediário onde deseja parar primeiro (ex: padaria, farmácia).",
      imageAlt: "Campo de parada intermediária preenchido.",
    },
    {
      title: "Toque em Pronto",
      instruction: "Toque no botão preto 'Pronto'. O aplicativo recalculará a rota passando pelos dois lugares.",
      imageAlt: "Rota com duas paradas traçada no mapa.",
    },
    {
      title: "Confirme o valor e peça a viagem",
      instruction: "Confira o preço total das paradas e toque em 'Confirmar' para chamar o carro.",
      imageAlt: "Valor recalculado com botão de confirmação.",
    },
  ],

  "avaliar-motorista-elogio-uber": [
    {
      title: "Ao sair do carro, olhe a tela",
      instruction: "Assim que a viagem terminar, o aplicativo abrirá a tela 'Como foi sua viagem com [Nome]?' com 5 estrelas.",
      imageAlt: "Tela de avaliação do motorista com 5 estrelas.",
    },
    {
      title: "Toque na quinta estrela",
      instruction: "Se a viagem foi calma e segura, toque na última estrela da direita para dar a nota máxima de 5 estrelas.",
      imageAlt: "Cinco estrelas preenchidas em dourado.",
    },
    {
      title: "Deixe um elogio e conclua",
      instruction: "Toque em 'Excelente conversa' ou 'Carro limpo' e toque em Concluir para agradecer ao motorista.",
      imageAlt: "Opções de elogios e botão Concluir destacados.",
    },
  ],

  "informar-objeto-esquecido-uber": [
    {
      title: "Toque na aba 'Atividade' no rodapé",
      instruction: "No rodapé do aplicativo Uber, toque no ícone de relógio escrito 'Atividade'.",
      imageAlt: "Aba Atividade no rodapé do aplicativo.",
    },
    {
      title: "Toque na viagem em que perdeu o item",
      instruction: "Selecione a viagem recente onde você esqueceu seu pertence.",
      imageAlt: "Viagem recente selecionada no histórico.",
    },
    {
      title: "Toque em 'Encontrar item perdido'",
      instruction: "Role para baixo nas opções de ajuda e toque em 'Encontrar item perdido'.",
      imageAlt: "Opção Encontrar item perdido em destaque.",
    },
    {
      title: "Fale com o motorista para combinar devolução",
      instruction: "Digite seu telefone para o Uber ligar para você e colocar você em contato com o motorista para devolver o item.",
      imageAlt: "Formulário de contato seguro para devolução de itens.",
    },
  ],

  "pedir-carro-para-outra-pessoa-uber": [
    {
      title: "Toque na barra 'Para onde?'",
      instruction: "Abra o aplicativo e dê um toque na caixa de pesquisa de endereço.",
      imageAlt: "Barra de busca Para onde.",
    },
    {
      title: "Toque em 'Para mim' no topo",
      instruction: "No alto da tela, toque onde diz 'Para mim' e selecione 'Adicionar passageiro'.",
      imageAlt: "Opção de seleção de passageiro com botão Adicionar passageiro.",
    },
    {
      title: "Escolha o contato do familiar",
      instruction: "Selecione o contato da pessoa para quem você está pedindo o carro na sua agenda.",
      imageAlt: "Lista de contatos da agenda.",
    },
    {
      title: "Coloque o endereço e chame",
      instruction: "Coloque onde ela está e para onde vai. Ela receberá um SMS no celular dela com os dados da placa e do motorista.",
      imageAlt: "Confirmação de corrida solicitada para terceiro.",
    },
  ],

  "usar-botao-seguranca-uber": [
    {
      title: "Durante a viagem, procure o escudo azul",
      instruction: "Olhe para o mapa durante a corrida: há um pequeno círculo com um desenho de 'Escudo azul'.",
      imageAlt: "Escudo azul de segurança no canto do mapa do Uber.",
    },
    {
      title: "Dê um toque no escudo azul",
      instruction: "O aplicativo abrirá o painel 'Recursos de segurança da Uber'.",
      imageAlt: "Menu de recursos de segurança aberto na tela.",
    },
    {
      title: "Acesse ajuda rápida ou ligue 190",
      instruction: "Você pode compartilhar a rota com familiares ou tocar em 'Ligar para a polícia (190)' em caso de emergência real.",
      imageAlt: "Opções de emergência e botão 190 destacados.",
    },
  ],

  "cadastrar-cartao-credito-uber": [
    {
      title: "Toque na aba 'Conta' no rodapé",
      instruction: "No canto inferior direito do aplicativo, toque no ícone de pessoa escrito 'Conta'.",
      imageAlt: "Aba Conta selecionada no rodapé.",
    },
    {
      title: "Toque em 'Carteira' ou 'Pagamento'",
      instruction: "Procure e toque na opção 'Carteira' ou 'Formas de pagamento'.",
      imageAlt: "Menu de opções destacando Carteira.",
    },
    {
      title: "Toque em 'Adicionar forma de pagamento'",
      instruction: "Toque no botão com sinal de Mais (+) e selecione 'Cartão de crédito ou débito'.",
      imageAlt: "Opção Cartão de crédito selecionada.",
    },
    {
      title: "Digite os dados do cartão e salve",
      instruction: "Informe o número do cartão, a data de validade e o código de 3 dígitos atrás do cartão. Toque em 'Salvar'.",
      imageAlt: "Formulário de cartão seguro com botão Salvar.",
      warning: "O Uber guarda seus dados de forma criptografada e nunca cobra nada sem você pedir a viagem.",
    },
  ],

  "ver-recibo-historico-uber": [
    {
      title: "Toque na aba 'Atividade' no rodapé",
      instruction: "No rodapé do Uber, toque no ícone de relógio chamado 'Atividade'.",
      imageAlt: "Aba Atividade destacada no rodapé.",
    },
    {
      title: "Toque na viagem que deseja consultar",
      instruction: "Veja a lista com todas as suas corridas passadas com a data e valor. Toque na que você quer examinar.",
      imageAlt: "Lista de viagens passadas com valores e datas.",
    },
    {
      title: "Veja o recibo detalhado",
      instruction: "A tela mostrará o mapa do trajeto percorrido, o nome do motorista e o recibo com o valor exato cobrado.",
      imageAlt: "Recibo detalhado da viagem com valor e rota.",
    },
  ],

  "consultar-sua-nota-passageiro-uber": [
    {
      title: "Toque na aba 'Conta' no rodapé",
      instruction: "No canto inferior direito do Uber, dê um toque no menu 'Conta'.",
      imageAlt: "Aba Conta no rodapé do aplicativo.",
    },
    {
      title: "Olhe logo abaixo do seu nome",
      instruction: "Na parte de cima da tela, logo abaixo do seu nome, você verá uma estrela dourada com um número (ex: 4.95).",
      imageAlt: "Cabeçalho da conta com nome e estrelas de avaliação de passageiro.",
    },
    {
      title: "Toque na sua nota para ver detalhes",
      instruction: "Ao tocar na sua nota, você poderá ver quantos motoristas deram 5 estrelas para você nas suas viagens.",
      imageAlt: "Detalhamento das avaliações de passageiro recebidas.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════
  // ── GOOGLE MAPS (15 scripts) ──────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  "colocar-endereco-maps": [
    {
      title: "Abra o Google Maps",
      instruction: "Toque no ícone do Google Maps (desenho de pino de localização colorido).",
      imageAlt: "Tela inicial com o ícone do Google Maps em destaque.",
    },
    {
      title: "Toque na barra 'Pesquise aqui'",
      instruction: "Toque na caixa branca no topo da tela. Você pode digitar o nome da rua ou tocar no microfone para falar o nome do local.",
      imageAlt: "Barra de pesquisa do Maps com campo de texto e microfone destacados.",
    },
    {
      title: "Toque em 'Rotas'",
      instruction: "O mapa encontrará o local. Toque no botão azul 'Rotas' no canto inferior esquerdo para traçar o melhor caminho.",
      imageAlt: "Painel do local com o botão azul Rotas em destaque.",
    },
    {
      title: "Toque em 'Iniciar' para ouvir o GPS",
      instruction: "Toque no botão azul 'Iniciar'. O celular começará a falar em voz alta onde você deve virar.",
      imageAlt: "Tela de navegação com a rota azul e botão Iniciar em destaque.",
    },
  ],

  "caminho-onibus-maps": [
    {
      title: "Pesquise o endereço de destino",
      instruction: "No Google Maps, digite o endereço para onde você quer ir e toque no botão azul 'Rotas'.",
      imageAlt: "Pesquisa de endereço no Maps com o botão Rotas selecionado.",
    },
    {
      title: "Toque no ícone de Ônibus no topo",
      instruction: "Na parte de cima da tela, toque no desenho de um 'Ônibus/Trem' (transporte público) entre as opções de carro e a pé.",
      imageAlt: "Barra superior com os meios de transporte destacando o ícone de ônibus.",
    },
    {
      title: "Veja as linhas de ônibus disponíveis",
      instruction: "O aplicativo mostrará os números das linhas de ônibus, o horário que ele passa no ponto e o tempo total de viagem.",
      imageAlt: "Lista de linhas de ônibus com números, cores e horários em destaque.",
    },
    {
      title: "Toque na linha para ver os pontos",
      instruction: "Toque no trajeto escolhido para ver onde pegar o ônibus, quantos pontos passar e o nome do ponto onde você deve descer.",
      imageAlt: "Instruções passo a passo com nome da rua do ponto de embarque e desembarque.",
    },
  ],

  "compartilhar-localizacao-maps": [
    {
      title: "Toque na sua foto de perfil no topo",
      instruction: "No canto superior direito da tela do Maps, toque no círculo com a sua foto ou inicial.",
      imageAlt: "Foto de perfil no canto superior direito do Maps.",
    },
    {
      title: "Toque em 'Compartilhar local'",
      instruction: "No menu que abrir, toque na opção 'Compartilhar local' (ícone com desenho de pessoa e sinal de ondas).",
      imageAlt: "Menu de opções destacando Compartilhar local.",
    },
    {
      title: "Escolha o tempo de compartilhamento",
      instruction: "Escolha se quer compartilhar por 1 hora ou até você desativar manualmente.",
      imageAlt: "Opções de tempo de compartilhamento de localização.",
    },
    {
      title: "Envie para o familiar no WhatsApp",
      instruction: "Selecione o contato da sua família para mandar o link seguro. Eles poderão ver onde você está andando no mapa.",
      imageAlt: "Confirmação de envio da localização no WhatsApp.",
    },
  ],

  "salvar-endereco-casa-maps": [
    {
      title: "Toque na aba 'Salvos' no rodapé",
      instruction: "No rodapé do Google Maps, toque no ícone de bandeirinha chamado 'Salvos'.",
      imageAlt: "Aba Salvos no rodapé do Maps.",
    },
    {
      title: "Toque em 'Marcados' e escolha 'Casa'",
      instruction: "Na parte superior da tela de salvos, toque em 'Marcados' e depois toque na linha escrita 'Casa'.",
      imageAlt: "Opção Casa com desenho de casinha destacada.",
    },
    {
      title: "Digite o endereço da sua residência",
      instruction: "Digite a sua rua, número, bairro e cidade e selecione o resultado correspondente.",
      imageAlt: "Campo de endereço de residência preenchido.",
    },
    {
      title: "Toque em 'Salvar'",
      instruction: "Pronto! Sempre que estiver na rua, basta falar no microfone 'Ir para casa' para o GPS te guiar de volta sem digitar nada.",
      imageAlt: "Endereço de casa salvo com ícone de casinha no mapa.",
    },
  ],

  "encontrar-farmacia-hospital-maps": [
    {
      title: "Olhe a barra de categorias abaixo da busca",
      instruction: "Na tela inicial do Maps, logo abaixo da barra branca de pesquisa, deslize os botões redondos para o lado.",
      imageAlt: "Carrossel de categorias de locais abaixo da barra de busca.",
    },
    {
      title: "Toque em 'Farmácias' ou 'Hospitais'",
      instruction: "Toque no botão com desenho de cruz vermelha escrito 'Farmácias' ou 'Hospitais'.",
      imageAlt: "Botão de Farmácias ou Hospitais destacado.",
    },
    {
      title: "Veja a lista por ordem de proximidade",
      instruction: "O mapa mostrará os locais mais perto de onde você está, indicando se estão abertos agora e com botão para ligar.",
      imageAlt: "Lista de farmácias próximas com distâncias e horários.",
    },
  ],

  "ver-foto-da-fachada-streetview-maps": [
    {
      title: "Pesquise o endereço que deseja conhecer",
      instruction: "Digite o endereço da consulta médica ou casa de amigo na barra de pesquisa do Maps.",
      imageAlt: "Local encontrado no mapa.",
    },
    {
      title: "Olhe para o quadradinho com foto no rodapé",
      instruction: "No canto inferior esquerdo, toque na foto pequena que tem uma seta circular branca no meio.",
      imageAlt: "Miniatura do Street View no canto inferior esquerdo.",
    },
    {
      title: "Gire a imagem com o dedo em 360 graus",
      instruction: "A tela mostrará a foto real da rua como se você estivesse lá na calçada. Deslize o dedo para os lados para ver a vizinhança.",
      imageAlt: "Foto panorâmica de 360 graus da rua e da fachada.",
    },
  ],

  "saber-se-transito-parado-maps": [
    {
      title: "Traçe a sua rota no mapa",
      instruction: "Coloque o destino desejado e toque no botão azul 'Rotas'.",
      imageAlt: "Rota traçada no mapa entre origem e destino.",
    },
    {
      title: "Observe as cores da linha do trajeto",
      instruction: "Olhe para a linha da rota: linha azul significa trânsito livre; linha laranja significa trânsito lento; linha vermelha é engarrafamento.",
      imageAlt: "Trajeto com trechos coloridos em azul, laranja e vermelho.",
    },
    {
      title: "Escolha a rota mais rápida",
      instruction: "Se a rota principal estiver muito vermelha, toque na linha cinza alternativa para ir por um caminho sem trânsito.",
      imageAlt: "Opções de rotas alternativas com tempos estimados.",
    },
  ],

  "baixar-mapa-sem-internet-maps": [
    {
      title: "Toque na sua foto de perfil",
      instruction: "No canto superior direito da tela do Maps, toque no círculo com a sua foto.",
      imageAlt: "Foto de perfil no canto superior direito.",
    },
    {
      title: "Toque em 'Mapas off-line'",
      instruction: "No menu suspenso, procure e toque na opção 'Mapas off-line' (com desenho de mapa cortado).",
      imageAlt: "Opção Mapas off-line destacada.",
    },
    {
      title: "Toque em 'Selecione seu próprio mapa'",
      instruction: "Enquadre o retângulo azul em cima da sua cidade ou do trajeto da sua viagem.",
      imageAlt: "Área da cidade selecionada dentro do retângulo de download.",
    },
    {
      title: "Toque em 'Download'",
      instruction: "Toque no botão azul 'Download'. O mapa ficará gravado no seu celular e funcionará mesmo se acabar a internet na rua.",
      imageAlt: "Barra de progresso do download do mapa concluída.",
    },
  ],

  "ver-horario-funcionamento-maps": [
    {
      title: "Pesquise o comércio ou consultório",
      instruction: "Digite o nome da clínica, cartório ou supermercado na barra de busca.",
      imageAlt: "Ficha do local aberta no mapa.",
    },
    {
      title: "Arraste o painel branco para cima",
      instruction: "Coloque o dedo no painel inferior e puxe para cima para ler as informações completas.",
      imageAlt: "Painel de detalhes do estabelecimento expandido.",
    },
    {
      title: "Olhe a linha 'Horário de funcionamento'",
      instruction: "Veja se diz em verde 'Aberto agora' ou em vermelho 'Fechado'. Dê um toque para ver o horário que fecha hoje.",
      imageAlt: "Tabela de horários de funcionamento por dia da semana.",
    },
  ],

  "medir-distancia-tempo-maps": [
    {
      title: "Pesquise o endereço de destino",
      instruction: "Digite para onde você vai e toque no botão azul 'Rotas'.",
      imageAlt: "Tela de rotas traçadas.",
    },
    {
      title: "Olhe para a faixa verde ou azul no rodapé",
      instruction: "No rodapé da tela, o Maps mostra em letras grandes: os minutos de viagem e a distância em quilômetros (ex: '25 min (12 km)').",
      imageAlt: "Faixa inferior com tempo de viagem e quilometragem em destaque.",
    },
    {
      title: "Veja a hora de chegada",
      instruction: "Logo ao lado, você verá o horário exato em que vai chegar ao local se sair agora.",
      imageAlt: "Horário previsto de chegada destacado.",
    },
  ],

  "adicionar-parada-caminho-maps": [
    {
      title: "Com o GPS já navegando, olhe o canto da tela",
      instruction: "Durante a navegação com o mapa aberto, toque no desenho de 'Lupa' no canto superior direito.",
      imageAlt: "Ícone de lupa de busca ao longo da rota.",
    },
    {
      title: "Escolha o que precisa achar no caminho",
      instruction: "Toque em 'Postos de gasolina', 'Restaurantes' ou digite o nome de uma padaria no caminho.",
      imageAlt: "Lista de categorias para parada no caminho.",
    },
    {
      title: "Toque no local escolhido",
      instruction: "O mapa mostrará os locais que ficam exatamente na sua estrada e quantos minutos a mais vai demorar.",
      imageAlt: "Posto selecionado na rota com tempo adicional.",
    },
    {
      title: "Toque em 'Adicionar parada'",
      instruction: "Toque no botão verde 'Adicionar parada'. O GPS te levará primeiro até lá e depois retomará o destino final.",
      imageAlt: "Rota atualizada incluindo a parada intermediária.",
    },
  ],

  "evitar-pedagios-maps": [
    {
      title: "Trace a rota para a sua viagem",
      instruction: "Pesquise a cidade de destino e toque no botão 'Rotas'.",
      imageAlt: "Rota entre cidades traçada no mapa.",
    },
    {
      title: "Toque nos três pontinhos no topo direito",
      instruction: "No canto superior direito (ao lado de onde você digita o destino), toque nos três pontinhos verticais.",
      imageAlt: "Três pontinhos no topo da tela de rotas.",
    },
    {
      title: "Toque em 'Opções de trajeto'",
      instruction: "No menu de opções, toque em 'Opções de trajeto' ou 'Opções'.",
      imageAlt: "Menu de opções de trajeto em destaque.",
    },
    {
      title: "Marque a caixa 'Evitar pedágios'",
      instruction: "Marque a caixinha 'Evitar pedágios' e toque em Concluir. O mapa recalculará a rota usando apenas rodovias gratuitas.",
      imageAlt: "Caixa Evitar pedágios marcada e rota alternativa gratuita.",
    },
  ],

  "salvar-onde-estacionou-maps": [
    {
      title: "Ao estacionar o carro, abra o Maps",
      instruction: "Com o carro já parado na vaga, abra o aplicativo Google Maps.",
      imageAlt: "Tela do Maps mostrando a bolinha azul de localização atual.",
    },
    {
      title: "Dê um toque na bolinha azul no mapa",
      instruction: "Toque bem em cima do ponto azul que representa onde você está agora.",
      imageAlt: "Ponto azul selecionado com menu inferior aberto.",
    },
    {
      title: "Toque em 'Salvar local de estacionamento'",
      instruction: "No menu azul que abrir, toque em 'Salvar estacionamento'. Uma letra 'P' amarela ficará marcada no mapa para você achar a vaga na volta.",
      imageAlt: "Pino amarelo com letra P confirmando local do carro salvo.",
    },
  ],

  "ver-caminho-a-pe-maps": [
    {
      title: "Pesquise o destino e toque em 'Rotas'",
      instruction: "Coloque o endereço para onde você vai e toque no botão azul 'Rotas'.",
      imageAlt: "Tela de rotas com meios de transporte no topo.",
    },
    {
      title: "Toque no ícone da pessoa caminhando",
      instruction: "Na barra superior de transportes, toque no desenho de uma 'Pessoa andando a pé'.",
      imageAlt: "Ícone de pedestre selecionado no topo.",
    },
    {
      title: "Siga as linhas pontilhadas azuis",
      instruction: "Toque em 'Iniciar'. O mapa mostrará o trajeto mais plano e seguro pelas calçadas para caminhar com tranquilidade.",
      imageAlt: "Caminho pontilhado de pedestre traçado no mapa.",
    },
  ],

  "conferir-avaliacoes-comentarios-maps": [
    {
      title: "Pesquise o comércio, consultório ou cartório",
      instruction: "Digite o nome do estabelecimento na barra de busca do Maps.",
      imageAlt: "Ficha do local aberta no mapa.",
    },
    {
      title: "Arraste a tela e toque na aba 'Avaliações'",
      instruction: "Puxe a ficha para cima e toque na aba 'Avaliações' (ao lado de Visão geral).",
      imageAlt: "Aba Avaliações com a média de estrelas em destaque.",
    },
    {
      title: "Leia a opinião de outros clientes",
      instruction: "Role para baixo para ler os comentários reais deixados por outras pessoas sobre a limpeza, atendimento e fila do local.",
      imageAlt: "Lista de comentários e depoimentos de clientes sobre o local.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════
  // ── INSTAGRAM (15 scripts) ────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  "ver-fotos-instagram": [
    {
      title: "Abra o aplicativo Instagram",
      instruction: "Toque no ícone colorido em tons de roxo e rosa com o desenho de uma camerazinha branca.",
      imageAlt: "Tela inicial do celular com o aplicativo Instagram em destaque.",
    },
    {
      title: "Deslize o dedo para cima para ver fotos",
      instruction: "Passe o dedo na tela de baixo para cima para rolar o feed e ver as fotos publicadas pelas pessoas que você segue.",
      imageAlt: "Feed de fotos do Instagram rolando na tela.",
    },
    {
      title: "Dê dois toques na foto para curtir",
      instruction: "Quando gostar de uma foto, dê dois toques rápidos com o dedo bem em cima dela. Um coraçãozinho branco vai aparecer no meio da foto.",
      imageAlt: "Foto com coração animado confirmando a curtida.",
    },
  ],

  "enviar-mensagem-instagram": [
    {
      title: "Abra o Instagram",
      instruction: "Abra o aplicativo Instagram no seu celular.",
      imageAlt: "Tela inicial do Instagram.",
    },
    {
      title: "Toque no ícone do Direct no topo",
      instruction: "No canto superior direito, toque no ícone em forma de balãozinho de mensagem ou aviãozinho de papel.",
      imageAlt: "Cabeçalho do Instagram destacando o ícone de mensagens no canto superior direito.",
    },
    {
      title: "Escolha o amigo na lista",
      instruction: "Toque no nome da pessoa com quem você deseja conversar ou use a barra de pesquisa para achar o perfil dela.",
      imageAlt: "Lista de conversas do Direct com amigos em destaque.",
    },
    {
      title: "Digite e toque em Enviar",
      instruction: "Toque na barra de mensagem no rodapé, digite o recado e toque no botão azul 'Enviar'. A conversa é 100% privada.",
      imageAlt: "Conversa do Direct com campo de texto e botão Enviar.",
    },
  ],

  "assistir-stories-instagram": [
    {
      title: "Olhe para as bolinhas no topo da tela",
      instruction: "No início do aplicativo, repare nos círculos coloridos com as fotos dos seus amigos na parte de cima.",
      imageAlt: "Fileira de círculos coloridos de Stories no topo do Instagram.",
    },
    {
      title: "Dê um toque no primeiro círculo",
      instruction: "Toque na bolinha do amigo para abrir a foto ou vídeo que ele postou hoje.",
      imageAlt: "Story aberto ocupando a tela cheia.",
    },
    {
      title: "Dê um toque na tela para avançar",
      instruction: "Para ir para a próxima foto, basta dar um toque rápido no lado direito da tela. Para sair, deslize o dedo para baixo.",
      imageAlt: "Story avançando para a próxima foto.",
    },
  ],

  "publicar-foto-feed-instagram": [
    {
      title: "Toque no botão com sinal de Mais (+)",
      instruction: "No rodapé da tela (ou no topo), toque no quadrado com um sinal de Mais (+) no centro.",
      imageAlt: "Botão de criação com sinal de mais em destaque.",
    },
    {
      title: "Escolha a foto na galeria",
      instruction: "Dê um toque na foto que você quer postar e toque na setinha azul 'Avançar' no canto superior direito.",
      imageAlt: "Galeria de imagens do celular selecionando uma foto.",
    },
    {
      title: "Escreva uma legenda carinhosa",
      instruction: "Toque em 'Escreva uma legenda...' e digite uma mensagem contando sobre o momento especial da foto.",
      imageAlt: "Campo de legenda com texto preenchido.",
    },
    {
      title: "Toque no botão azul 'Compartilhar'",
      instruction: "Toque no botão azul 'Compartilhar' no topo direito. A foto será publicada no seu mural para seus amigos curtirem.",
      imageAlt: "Botão azul Compartilhar em destaque confirmando a publicação.",
    },
  ],

  "curtir-comentar-foto-instagram": [
    {
      title: "Olhe abaixo da foto do amigo",
      instruction: "Logo abaixo da imagem no feed, repare nos três símbolos: Coração, Balãozinho e Aviãozinho.",
      imageAlt: "Barra de interação abaixo da foto no Instagram.",
    },
    {
      title: "Toque no desenho de balãozinho",
      instruction: "Toque no segundo ícone (balão de fala) para abrir os comentários daquela publicação.",
      imageAlt: "Tela de comentários aberta com caixa de texto no rodapé.",
    },
    {
      title: "Digite sua mensagem e toque em Publicar",
      instruction: "Escreva seu elogio ou bênção com carinho e toque no botão azul 'Publicar'. O amigo verá seu comentário.",
      imageAlt: "Comentário publicado abaixo da foto.",
    },
  ],

  "pesquisar-amigo-perfil-instagram": [
    {
      title: "Toque na lupa no rodapé",
      instruction: "No rodapé do Instagram, toque no segundo ícone da esquerda: o desenho de uma 'Lupa'.",
      imageAlt: "Ícone de lupa destacado no rodapé.",
    },
    {
      title: "Toque na barra 'Pesquisar' no topo",
      instruction: "Dê um toque na barra cinza no topo da tela e digite o nome completo da pessoa que você procura.",
      imageAlt: "Barra de pesquisa do Instagram com nome digitado.",
    },
    {
      title: "Toque no perfil correto",
      instruction: "Olhe a lista de resultados, confira a foto de perfil da pessoa e toque no nome dela para abrir a página dela.",
      imageAlt: "Lista de perfis encontrados com fotos em destaque.",
    },
  ],

  "seguir-perfil-amigo-instagram": [
    {
      title: "Abra o perfil da pessoa",
      instruction: "Entre na página do amigo, artista ou parente que você encontrou na pesquisa.",
      imageAlt: "Página de perfil do Instagram aberta.",
    },
    {
      title: "Toque no botão azul 'Seguir'",
      instruction: "No alto da tela, logo abaixo da foto da pessoa, toque no botão azul escrito 'Seguir'.",
      imageAlt: "Botão azul Seguir em destaque.",
    },
    {
      title: "Confira a confirmação",
      instruction: "O botão mudará para cinza escrito 'Seguindo'. Agora as fotos e vídeos dessa pessoa aparecerão na sua tela inicial.",
      imageAlt: "Botão Seguindo em cinza confirmando a ação.",
    },
  ],

  "compartilhar-post-amigos-instagram": [
    {
      title: "Na publicação que gostou, olhe os ícones",
      instruction: "Abaixo da foto ou receita, localize o terceiro ícone: o desenho de um 'Aviãozinho de papel'.",
      imageAlt: "Ícone de aviãozinho de papel destacado abaixo do post.",
    },
    {
      title: "Toque no aviãozinho de papel",
      instruction: "Dê um toque no aviãozinho para abrir as opções de compartilhamento.",
      imageAlt: "Menu de compartilhamento aberto na parte inferior.",
    },
    {
      title: "Toque no ícone do WhatsApp",
      instruction: "Na barra de aplicativos no rodapé, toque no círculo verde do WhatsApp.",
      imageAlt: "Ícone do WhatsApp em destaque no menu de envio.",
    },
    {
      title: "Escolha o amigo e envie",
      instruction: "Selecione o contato da família ou o grupo de amigas no WhatsApp e toque na setinha verde para mandar a foto.",
      imageAlt: "Post do Instagram compartilhado com sucesso no WhatsApp.",
    },
  ],

  "salvar-publicacao-instagram": [
    {
      title: "Na foto ou receita especial, olhe a direita",
      instruction: "Abaixo da foto no feed, olhe para o cantinho direito da tela.",
      imageAlt: "Canto inferior direito da publicação no Instagram.",
    },
    {
      title: "Toque no ícone de bandeirinha",
      instruction: "Toque no ícone com desenho de 'Bandeirinha' (marcador). Ele ficará todo preto/preenchido.",
      imageAlt: "Ícone de bandeirinha preenchida confirmando que foi salvo.",
    },
    {
      title: "Ache seus salvos no perfil",
      instruction: "Quando quiser rever suas receitas ou fotos guardadas, vá no seu perfil, toque nas 3 barrinhas no topo e escolha 'Salvos'.",
      imageAlt: "Pasta de Salvos no perfil do Instagram.",
    },
  ],

  "deixar-perfil-privado-instagram": [
    {
      title: "Toque na sua foto de perfil no rodapé",
      instruction: "No canto inferior direito, toque no círculo com a sua foto para abrir a sua página.",
      imageAlt: "Aba de perfil no canto inferior direito.",
    },
    {
      title: "Toque nas três barrinhas no topo direito",
      instruction: "No alto da tela, toque nas três barrinhas horizontais (menu de configurações).",
      imageAlt: "Menu de três barrinhas no topo direito.",
    },
    {
      title: "Toque em 'Privacidade da conta'",
      instruction: "Role a lista de configurações e toque na opção 'Privacidade da conta' (ícone de cadeado).",
      imageAlt: "Opção Privacidade da conta com ícone de cadeado.",
    },
    {
      title: "Ative a chave 'Conta privada'",
      instruction: "Toque na chavinha ao lado de 'Conta privada' para deixá-la azul/ligada e confirme. Agora apenas quem você aprovar verá suas fotos.",
      imageAlt: "Chave Conta privada ativada confirmando perfil fechado.",
    },
  ],

  "bloquear-perfil-estranho-instagram": [
    {
      title: "Abra o perfil da pessoa indesejada",
      instruction: "Entre na página da pessoa desconhecida ou que está incomodando você.",
      imageAlt: "Perfil de usuário estranho no Instagram.",
    },
    {
      title: "Toque nos três pontinhos no topo direito",
      instruction: "No canto superior direito da tela do perfil, toque nos três pontinhos.",
      imageAlt: "Três pontinhos no topo direito do perfil.",
    },
    {
      title: "Toque na opção 'Bloquear'",
      instruction: "No menu vermelho que abrir na tela, toque na opção 'Bloquear'.",
      imageAlt: "Menu suspenso com a opção Bloquear em destaque.",
    },
    {
      title: "Confirme o bloqueio",
      instruction: "Toque no botão azul 'Bloquear' na confirmação. Essa pessoa não verá seu nome nem poderá mandar mensagens para você.",
      imageAlt: "Janela de confirmação confirmando bloqueio.",
    },
  ],

  "gravar-story-camera-instagram": [
    {
      title: "Na tela inicial, deslize para a direita",
      instruction: "Com o dedo no meio da tela inicial do Instagram, empurre a tela para o lado direito para ligar a câmera.",
      imageAlt: "Câmera de Stories abrindo na tela cheia.",
    },
    {
      title: "Tire uma foto ou segure para gravar vídeo",
      instruction: "Dê um toque no círculo branco grande para tirar uma foto, ou segure o dedo nele para gravar um vídeo com sua voz.",
      imageAlt: "Botão disparador branco central em destaque.",
    },
    {
      title: "Escreva uma mensagem se quiser",
      instruction: "Toque no ícone 'Aa' no topo da tela para escrever um 'Bom dia' ou colocar uma figurinha.",
      imageAlt: "Ferramenta de texto do Story com mensagem digitada.",
    },
    {
      title: "Toque em 'Seu Story' no rodapé",
      instruction: "No canto inferior esquerdo, toque no botão redondo branco com sua foto escrito 'Seu Story'. Todos os seus amigos verão por 24 horas.",
      imageAlt: "Botão Seu Story no canto inferior esquerdo.",
    },
  ],

  "silenciar-publicacoes-instagram": [
    {
      title: "Abra o perfil da pessoa que posta demais",
      instruction: "Entre na página do amigo cujas postagens você não deseja mais ver no feed.",
      imageAlt: "Perfil do amigo aberto.",
    },
    {
      title: "Toque no botão cinza 'Seguindo'",
      instruction: "Logo abaixo da foto de perfil dele, toque no botão 'Seguindo'.",
      imageAlt: "Botão Seguindo em destaque.",
    },
    {
      title: "Toque na opção 'Silenciar'",
      instruction: "No menu que abrir, toque na opção 'Silenciar' (ícone de sino com risco).",
      imageAlt: "Opção Silenciar no menu suspenso.",
    },
    {
      title: "Ative a chave 'Publicações' e 'Stories'",
      instruction: "Ligue as chavinhas azuis para silenciar. Os posts dele sumirão da sua tela sem você precisar desfazer a amizade.",
      imageAlt: "Chaves de silenciar ativadas com sucesso.",
    },
  ],

  "tirar-som-videos-instagram": [
    {
      title: "Quando um vídeo começar a tocar som alto",
      instruction: "Se você estiver passando o feed e um vídeo começar a tocar som alto de surpresa, mantenha a calma.",
      imageAlt: "Vídeo tocando com áudio no feed do Instagram.",
    },
    {
      title: "Dê um toque rápido no centro do vídeo",
      instruction: "Dê um toque rápido no meio da imagem do vídeo. Um ícone de alto-falante com um 'X' mudo aparecerá na tela.",
      imageAlt: "Ícone de som mudo com um X branco aparecendo no vídeo.",
    },
    {
      title: "Navegue em silêncio",
      instruction: "O áudio será desligado na mesma hora e todos os próximos vídeos continuarão sem som até você tocar novamente.",
      imageAlt: "Feed rodando silenciosamente sem incomodar.",
    },
  ],

  "desativar-notificacoes-instagram": [
    {
      title: "Abra o seu perfil e toque nas três barrinhas",
      instruction: "Toque na sua foto no canto inferior direito e depois toque nas três barrinhas no topo direito.",
      imageAlt: "Menu de três barrinhas no topo do perfil.",
    },
    {
      title: "Toque em 'Notificações'",
      instruction: "No menu de configurações, procure e toque em 'Notificações' (ícone de sininho).",
      imageAlt: "Opção Notificações em destaque.",
    },
    {
      title: "Ative a chave 'Pausar tudo'",
      instruction: "No topo, ligue a chavinha 'Pausar tudo' e selecione quantas horas você quer descansar.",
      imageAlt: "Chave Pausar tudo ativada com seleção de horário.",
    },
    {
      title: "Descanse sem apitos",
      instruction: "O celular não fará nenhum barulho nem mostrará avisos enquanto o descanso estiver ativado.",
      imageAlt: "Tela de notificações pausadas em silêncio.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════
  // ── FACEBOOK (15 roteiros) ────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  "entrar-facebook": [
    {
      title: "Abra o aplicativo oficial",
      instruction: "Toque no ícone azul do Facebook para abrir o aplicativo.",
      imageAlt: "Tela inicial do celular com o aplicativo Facebook destacado.",
    },
    {
      title: "Digite seu telefone ou e-mail",
      instruction: "Na tela de entrada, digite o telefone ou endereço de e-mail ligado à sua conta.",
      imageAlt: "Tela de login do Facebook com campo de identificação.",
    },
    {
      title: "Digite sua senha",
      instruction: "Digite a senha somente no aplicativo oficial e toque em 'Entrar'.",
      imageAlt: "Tela de senha do Facebook com o campo protegido.",
      warning: "Nunca informe sua senha em links recebidos por mensagem.",
    },
    {
      title: "Confirme a segurança, se aparecer",
      instruction: "Se o Facebook pedir um código ou confirmação de identidade, siga a tela oficial para concluir o acesso.",
      imageAlt: "Tela de confirmação de segurança do Facebook.",
    },
  ],

  "pesquisar-amigo-facebook": [
    {
      title: "Toque na lupa",
      instruction: "Na tela inicial do Facebook, toque no ícone de lupa para pesquisar.",
      imageAlt: "Barra superior do Facebook com a lupa destacada.",
    },
    {
      title: "Digite o nome da pessoa",
      instruction: "Digite o nome completo do amigo ou familiar na barra de pesquisa.",
      imageAlt: "Campo de pesquisa do Facebook com um nome digitado.",
    },
    {
      title: "Confira e abra o perfil correto",
      instruction: "Compare foto, cidade e amigos em comum antes de tocar no perfil encontrado.",
      imageAlt: "Resultados de pesquisa com perfis e fotos de identificação.",
    },
  ],

  "adicionar-amigo-facebook": [
    {
      title: "Abra o perfil da pessoa",
      instruction: "Pesquise e entre no perfil do amigo ou familiar que você conhece.",
      imageAlt: "Perfil do Facebook aberto.",
    },
    {
      title: "Toque em 'Adicionar aos amigos'",
      instruction: "Toque no botão 'Adicionar aos amigos' abaixo do nome da pessoa.",
      imageAlt: "Botão Adicionar aos amigos destacado no perfil.",
    },
    {
      title: "Confira a solicitação enviada",
      instruction: "O botão mudará para 'Solicitação enviada'. Aguarde a pessoa aceitar.",
      imageAlt: "Perfil mostrando a solicitação de amizade enviada.",
    },
  ],

  "publicar-texto-facebook": [
    {
      title: "Toque em 'No que você está pensando?'",
      instruction: "Na tela inicial, toque na caixa com a pergunta 'No que você está pensando?'.",
      imageAlt: "Tela inicial do Facebook com a caixa de nova publicação destacada.",
    },
    {
      title: "Escreva sua mensagem",
      instruction: "Digite com calma o texto que deseja compartilhar.",
      imageAlt: "Tela de criação de publicação com texto digitado.",
    },
    {
      title: "Confira o público",
      instruction: "Toque na opção de público, como 'Amigos', e escolha quem poderá ver a publicação.",
      imageAlt: "Seletor de público da publicação.",
    },
    {
      title: "Toque em 'Publicar'",
      instruction: "Confira o texto e toque no botão 'Publicar'.",
      imageAlt: "Botão Publicar destacado na tela de criação.",
    },
  ],

  "publicar-foto-facebook": [
    {
      title: "Abra uma nova publicação",
      instruction: "Na tela inicial, toque em 'Foto/vídeo' ou na caixa 'No que você está pensando?'.",
      imageAlt: "Opção Foto ou vídeo destacada na tela inicial.",
    },
    {
      title: "Escolha a foto da galeria",
      instruction: "Toque na foto que deseja publicar e depois em 'Avançar', se aparecer.",
      imageAlt: "Galeria do celular com uma foto selecionada.",
    },
    {
      title: "Escreva uma legenda",
      instruction: "Se quiser, escreva uma mensagem contando sobre a foto.",
      imageAlt: "Campo de legenda preenchido na publicação.",
    },
    {
      title: "Confira o público e publique",
      instruction: "Escolha quem poderá ver a foto e toque em 'Publicar'.",
      imageAlt: "Prévia da foto com público e botão Publicar.",
    },
  ],

  "curtir-publicacao-facebook": [
    {
      title: "Encontre a publicação",
      instruction: "Role o feed até encontrar a foto, vídeo ou mensagem que deseja reagir.",
      imageAlt: "Feed do Facebook com uma publicação em destaque.",
    },
    {
      title: "Toque em 'Curtir'",
      instruction: "Toque no botão com o desenho de polegar abaixo da publicação.",
      imageAlt: "Botão Curtir destacado abaixo de uma publicação.",
    },
    {
      title: "Escolha outra reação, se quiser",
      instruction: "Pressione o botão Curtir para escolher uma reação diferente, como coração ou risada.",
      imageAlt: "Menu de reações do Facebook.",
    },
  ],

  "comentar-publicacao-facebook": [
    {
      title: "Toque em 'Comentar'",
      instruction: "Abaixo da publicação, toque no botão com desenho de balão de conversa.",
      imageAlt: "Botão Comentar destacado abaixo da publicação.",
    },
    {
      title: "Digite o comentário",
      instruction: "Toque no campo de comentário e escreva sua mensagem.",
      imageAlt: "Campo de comentário do Facebook com teclado aberto.",
    },
    {
      title: "Envie o comentário",
      instruction: "Toque na seta ou no botão de envio do teclado para publicar o comentário.",
      imageAlt: "Comentário publicado abaixo da foto.",
    },
  ],

  "compartilhar-publicacao-facebook": [
    {
      title: "Abra o menu da publicação",
      instruction: "Encontre a publicação e toque em 'Compartilhar'.",
      imageAlt: "Botão Compartilhar destacado abaixo de uma publicação.",
    },
    {
      title: "Escolha onde compartilhar",
      instruction: "Escolha 'Compartilhar agora', 'Compartilhar no seu perfil' ou enviar para alguém.",
      imageAlt: "Menu de opções de compartilhamento do Facebook.",
    },
    {
      title: "Escreva uma mensagem, se desejar",
      instruction: "Adicione um comentário próprio antes da publicação compartilhada, se quiser.",
      imageAlt: "Tela de compartilhamento com campo de comentário.",
    },
    {
      title: "Confirme o compartilhamento",
      instruction: "Confira o público e toque em 'Publicar' ou 'Enviar'.",
      imageAlt: "Tela de confirmação do compartilhamento.",
    },
  ],

  "assistir-stories-facebook": [
    {
      title: "Veja os círculos no topo",
      instruction: "Na tela inicial, observe os círculos com fotos dos amigos na área de Stories.",
      imageAlt: "Fila de Stories no topo do Facebook.",
    },
    {
      title: "Toque em um Story",
      instruction: "Toque no círculo de um amigo para abrir a foto ou vídeo.",
      imageAlt: "Story do Facebook aberto em tela cheia.",
    },
    {
      title: "Avance ou saia",
      instruction: "Toque no lado direito para avançar, no lado esquerdo para voltar ou deslize para baixo para sair.",
      imageAlt: "Story avançando para a próxima publicação.",
    },
  ],

  "enviar-mensagem-facebook": [
    {
      title: "Abra o Messenger",
      instruction: "No Facebook, toque no ícone de mensagens ou abra o aplicativo Messenger.",
      imageAlt: "Ícone de mensagens do Facebook destacado.",
    },
    {
      title: "Escolha a conversa",
      instruction: "Toque no nome do amigo ou use a pesquisa para encontrar a pessoa.",
      imageAlt: "Lista de conversas do Messenger.",
    },
    {
      title: "Digite a mensagem",
      instruction: "Toque no campo de texto, escreva a mensagem e confira o destinatário.",
      imageAlt: "Conversa do Messenger com campo de texto preenchido.",
    },
    {
      title: "Toque em enviar",
      instruction: "Toque na seta ou no botão de envio para mandar a mensagem.",
      imageAlt: "Botão de envio do Messenger em destaque.",
    },
  ],

  "fazer-chamada-video-facebook": [
    {
      title: "Abra a conversa",
      instruction: "No Messenger, entre na conversa da pessoa que você deseja chamar.",
      imageAlt: "Conversa do Messenger aberta.",
    },
    {
      title: "Toque na filmadora",
      instruction: "No topo da conversa, toque no ícone de câmera ou filmadora.",
      imageAlt: "Ícone de chamada de vídeo no topo do Messenger.",
    },
    {
      title: "Permita câmera e microfone",
      instruction: "Se o celular perguntar, permita o uso da câmera e do microfone durante a chamada.",
      imageAlt: "Solicitação de permissões para câmera e microfone.",
    },
    {
      title: "Encerre a chamada",
      instruction: "Quando terminar, toque no botão vermelho para desligar.",
      imageAlt: "Chamada de vídeo com botão vermelho de encerramento.",
    },
  ],

  "criar-album-facebook": [
    {
      title: "Abra seu perfil",
      instruction: "Toque na sua foto de perfil e procure a área de fotos.",
      imageAlt: "Perfil do Facebook com a área Fotos destacada.",
    },
    {
      title: "Escolha criar álbum",
      instruction: "Toque em 'Álbuns' e depois em 'Criar álbum'.",
      imageAlt: "Área de fotos com a opção Criar álbum.",
    },
    {
      title: "Dê um nome e adicione fotos",
      instruction: "Digite o nome do álbum e selecione as fotos da galeria.",
      imageAlt: "Tela de criação de álbum com nome e fotos selecionadas.",
    },
    {
      title: "Escolha o público e salve",
      instruction: "Escolha quem poderá ver o álbum e toque em 'Publicar' ou 'Salvar'.",
      imageAlt: "Álbum criado com seletor de público.",
    },
  ],

  "salvar-publicacao-facebook": [
    {
      title: "Abra o menu da publicação",
      instruction: "Na publicação que deseja guardar, toque nos três pontinhos.",
      imageAlt: "Menu de uma publicação do Facebook.",
    },
    {
      title: "Toque em 'Salvar publicação'",
      instruction: "Escolha 'Salvar publicação' ou uma opção com nome parecido.",
      imageAlt: "Opção Salvar publicação destacada.",
    },
    {
      title: "Encontre seus itens salvos",
      instruction: "No menu do perfil, abra 'Itens salvos' para rever a publicação.",
      imageAlt: "Área Itens salvos do Facebook.",
    },
  ],

  "ajustar-privacidade-facebook": [
    {
      title: "Abra o menu do perfil",
      instruction: "Toque na sua foto, nas três barrinhas ou na engrenagem de configurações.",
      imageAlt: "Menu do Facebook com configurações destacado.",
    },
    {
      title: "Entre em Configurações e privacidade",
      instruction: "Toque em 'Configurações e privacidade' e depois em 'Configurações'.",
      imageAlt: "Menu de Configurações e privacidade do Facebook.",
    },
    {
      title: "Abra a verificação de privacidade",
      instruction: "Procure 'Verificação de privacidade' ou 'Público das publicações'.",
      imageAlt: "Área de privacidade com opções de público.",
    },
    {
      title: "Escolha quem pode ver",
      instruction: "Selecione Amigos ou outra opção desejada e revise antes de sair.",
      imageAlt: "Seletor de público das publicações do Facebook.",
    },
  ],

  "bloquear-denunciar-facebook": [
    {
      title: "Abra o perfil suspeito",
      instruction: "Entre no perfil ou na publicação que deseja bloquear ou denunciar.",
      imageAlt: "Perfil suspeito do Facebook aberto.",
    },
    {
      title: "Toque nos três pontinhos",
      instruction: "No perfil ou na publicação, toque nos três pontinhos para abrir as opções.",
      imageAlt: "Menu de opções do Facebook com três pontinhos.",
    },
    {
      title: "Escolha bloquear ou denunciar",
      instruction: "Toque em 'Bloquear' ou 'Encontrar suporte ou denunciar' e escolha o motivo.",
      imageAlt: "Opções Bloquear e Denunciar destacadas.",
    },
    {
      title: "Confirme a ação",
      instruction: "Leia a confirmação e toque em 'Bloquear' ou 'Enviar denúncia' somente se estiver correto.",
      imageAlt: "Tela de confirmação de bloqueio ou denúncia.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════
  // ── PLAY STORE (15 roteiros) ──────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════
  "abrir-play-store": [
    {
      title: "Encontre a Play Store",
      instruction: "Procure o ícone de um triângulo colorido chamado 'Play Store' e toque nele.",
      imageAlt: "Tela inicial do Android com o ícone da Play Store destacado.",
    },
    {
      title: "Confira a loja oficial",
      instruction: "Veja se a tela mostra o nome Play Store e a conta Google correta no canto superior.",
      imageAlt: "Tela inicial da Play Store com a conta Google visível.",
    },
    {
      title: "Veja a tela inicial",
      instruction: "Na tela inicial, você encontrará aplicativos, jogos e a barra de pesquisa.",
      imageAlt: "Página inicial da Play Store com categorias e barra de pesquisa.",
    },
  ],

  "pesquisar-aplicativo-play-store": [
    {
      title: "Toque na barra de pesquisa",
      instruction: "No topo da Play Store, toque em 'Pesquisar apps e jogos'.",
      imageAlt: "Barra de pesquisa da Play Store destacada.",
    },
    {
      title: "Digite o nome do aplicativo",
      instruction: "Escreva o nome do aplicativo que deseja encontrar.",
      imageAlt: "Barra de pesquisa com nome de aplicativo digitado.",
    },
    {
      title: "Veja os resultados",
      instruction: "Leia os nomes e os ícones dos resultados para localizar o aplicativo correto.",
      imageAlt: "Lista de resultados da Play Store.",
    },
    {
      title: "Abra o aplicativo correto",
      instruction: "Confira o desenvolvedor e toque no resultado correspondente.",
      imageAlt: "Página de detalhes de um aplicativo na Play Store.",
    },
  ],

  "instalar-aplicativo-gratis-play-store": [
    {
      title: "Abra a página do aplicativo",
      instruction: "Pesquise o aplicativo e toque no resultado correto.",
      imageAlt: "Página do aplicativo com nome e ícone visíveis.",
    },
    {
      title: "Confira se é gratuito",
      instruction: "Veja se o botão mostra 'Instalar' e se não aparece um preço ou uma cobrança.",
      imageAlt: "Página de aplicativo gratuito com botão Instalar.",
    },
    {
      title: "Toque em 'Instalar'",
      instruction: "Toque no botão 'Instalar' e aguarde o download terminar.",
      imageAlt: "Download do aplicativo em andamento na Play Store.",
    },
    {
      title: "Abra o aplicativo",
      instruction: "Quando aparecer o botão 'Abrir', toque nele ou procure o novo ícone na tela do celular.",
      imageAlt: "Aplicativo instalado com botão Abrir.",
    },
  ],

  "atualizar-aplicativo-play-store": [
    {
      title: "Abra a página do aplicativo",
      instruction: "Pesquise o aplicativo na Play Store e toque no resultado correto.",
      imageAlt: "Página do aplicativo na Play Store.",
    },
    {
      title: "Toque em 'Atualizar'",
      instruction: "Se aparecer o botão 'Atualizar', toque nele e aguarde o download.",
      imageAlt: "Botão Atualizar destacado na Play Store.",
    },
    {
      title: "Confira a versão atualizada",
      instruction: "Quando aparecer 'Abrir', o aplicativo estará atualizado.",
      imageAlt: "Aplicativo atualizado com botão Abrir.",
    },
  ],

  "atualizar-todos-play-store": [
    {
      title: "Abra o menu da conta",
      instruction: "Na Play Store, toque na sua foto ou inicial no canto superior direito.",
      imageAlt: "Foto de perfil da conta Google na Play Store.",
    },
    {
      title: "Entre em 'Gerenciar apps e dispositivo'",
      instruction: "Toque em 'Gerenciar apps e dispositivo' e procure as atualizações disponíveis.",
      imageAlt: "Menu da Play Store com Gerenciar apps e dispositivo destacado.",
    },
    {
      title: "Toque em 'Atualizar tudo'",
      instruction: "Se estiver conectado ao Wi-Fi ou desejar usar seus dados, toque em 'Atualizar tudo'.",
      imageAlt: "Lista de atualizações com botão Atualizar tudo.",
    },
  ],

  "desinstalar-aplicativo-play-store": [
    {
      title: "Abra o menu da conta",
      instruction: "Toque na sua foto ou inicial no canto superior direito da Play Store.",
      imageAlt: "Menu da conta Google na Play Store.",
    },
    {
      title: "Abra 'Gerenciar apps e dispositivo'",
      instruction: "Toque em 'Gerenciar apps e dispositivo' e depois em 'Gerenciar'.",
      imageAlt: "Área de gerenciamento de aplicativos instalada.",
    },
    {
      title: "Escolha o aplicativo",
      instruction: "Toque no aplicativo que deseja remover e confira o nome e o ícone.",
      imageAlt: "Lista de aplicativos instalados com um app selecionado.",
    },
    {
      title: "Toque em desinstalar",
      instruction: "Toque no ícone de lixeira ou em 'Desinstalar' e confirme somente se estiver correto.",
      imageAlt: "Confirmação de desinstalação do aplicativo.",
    },
  ],

  "ver-aplicativos-instalados-play-store": [
    {
      title: "Abra o menu da conta",
      instruction: "Na Play Store, toque na sua foto ou inicial.",
      imageAlt: "Perfil da conta Google destacado na Play Store.",
    },
    {
      title: "Toque em 'Gerenciar apps e dispositivo'",
      instruction: "Abra a área que mostra o espaço e os aplicativos instalados.",
      imageAlt: "Menu Gerenciar apps e dispositivo.",
    },
    {
      title: "Abra a aba 'Gerenciar'",
      instruction: "Confira a lista de aplicativos instalados e toque em um deles para ver detalhes.",
      imageAlt: "Lista de aplicativos instalados na Play Store.",
    },
  ],

  "ativar-atualizacao-automatica-play-store": [
    {
      title: "Abra as configurações da Play Store",
      instruction: "Toque na sua foto, abra 'Configurações' e entre em 'Preferências de rede'.",
      imageAlt: "Configurações da Play Store com Preferências de rede.",
    },
    {
      title: "Toque em atualização automática",
      instruction: "Escolha 'Atualizar apps automaticamente'.",
      imageAlt: "Opção de atualização automática na Play Store.",
    },
    {
      title: "Escolha a rede",
      instruction: "Marque 'Somente por Wi-Fi' para economizar seu pacote de internet.",
      imageAlt: "Opções de rede para atualização automática.",
    },
    {
      title: "Confirme a preferência",
      instruction: "Toque em 'Concluído' ou feche a tela. A Play Store usará essa preferência nas próximas atualizações.",
      imageAlt: "Preferência de atualização automática salva.",
    },
  ],

  "baixar-jogo-play-store": [
    {
      title: "Pesquise o jogo",
      instruction: "Toque na barra de pesquisa e digite o nome do jogo desejado.",
      imageAlt: "Pesquisa de jogo na Play Store.",
    },
    {
      title: "Confira preço e informações",
      instruction: "Veja se o jogo é gratuito e leia se existem anúncios ou compras dentro do aplicativo.",
      imageAlt: "Página de jogo com informações de preço e compras.",
    },
    {
      title: "Toque em 'Instalar'",
      instruction: "Se estiver tudo certo, toque em 'Instalar' e aguarde o download.",
      imageAlt: "Instalação de jogo em andamento.",
    },
    {
      title: "Abra o jogo",
      instruction: "Quando aparecer 'Abrir', toque no botão para iniciar o jogo.",
      imageAlt: "Jogo instalado com botão Abrir.",
    },
  ],

  "conferir-avaliacoes-play-store": [
    {
      title: "Abra a página do aplicativo",
      instruction: "Pesquise o app e toque no resultado para abrir os detalhes.",
      imageAlt: "Página de detalhes de um aplicativo.",
    },
    {
      title: "Veja a nota em estrelas",
      instruction: "Observe a nota média e a quantidade de avaliações recebidas.",
      imageAlt: "Nota média e estrelas do aplicativo.",
    },
    {
      title: "Leia avaliações recentes",
      instruction: "Role até as avaliações e leia comentários recentes antes de decidir instalar.",
      imageAlt: "Comentários de usuários na página do aplicativo.",
    },
  ],

  "ler-seguranca-aplicativo-play-store": [
    {
      title: "Abra a seção de informações",
      instruction: "Na página do app, role a tela e procure 'Segurança dos dados' ou 'Sobre este app'.",
      imageAlt: "Seção de segurança dos dados na Play Store.",
    },
    {
      title: "Confira os dados coletados",
      instruction: "Leia quais tipos de dados o aplicativo pode coletar ou compartilhar.",
      imageAlt: "Informações demonstrativas sobre dados coletados.",
    },
    {
      title: "Confira o desenvolvedor e as permissões",
      instruction: "Verifique o nome do desenvolvedor e desconfie se o app pedir permissões sem relação com sua função.",
      imageAlt: "Nome do desenvolvedor e informações de permissões.",
    },
  ],

  "ativar-controle-parental-play-store": [
    {
      title: "Abra as configurações",
      instruction: "Na Play Store, toque na sua foto e depois em 'Configurações'.",
      imageAlt: "Configurações da Play Store abertas.",
    },
    {
      title: "Entre em 'Família'",
      instruction: "Toque em 'Família' e depois em 'Controle dos pais'.",
      imageAlt: "Área Família com Controle dos pais destacado.",
    },
    {
      title: "Ative o controle e crie um PIN",
      instruction: "Ative a chave e crie um PIN que somente o responsável conheça.",
      imageAlt: "Tela de criação de PIN do controle parental.",
    },
    {
      title: "Escolha as classificações",
      instruction: "Selecione a faixa etária permitida para aplicativos, jogos ou filmes.",
      imageAlt: "Classificações de idade do controle parental.",
    },
  ],

  "ver-espaco-aplicativo-play-store": [
    {
      title: "Pesquise o aplicativo",
      instruction: "Na Play Store, pesquise o nome do aplicativo e abra a página correta.",
      imageAlt: "Aplicativo aberto na página da Play Store.",
    },
    {
      title: "Veja o tamanho do download",
      instruction: "Role a página e procure o tamanho aproximado do aplicativo ou do download.",
      imageAlt: "Informação de tamanho do aplicativo na Play Store.",
    },
    {
      title: "Confira o espaço do celular",
      instruction: "Se o aparelho estiver cheio, libere espaço antes de instalar um aplicativo grande.",
      imageAlt: "Aviso demonstrativo sobre espaço insuficiente.",
    },
  ],

  "compartilhar-link-aplicativo-play-store": [
    {
      title: "Abra a página do aplicativo",
      instruction: "Pesquise o aplicativo na Play Store e abra o resultado correto.",
      imageAlt: "Página do aplicativo na Play Store.",
    },
    {
      title: "Toque nos três pontinhos",
      instruction: "No canto superior direito, toque nos três pontinhos e escolha 'Compartilhar'.",
      imageAlt: "Menu da página do aplicativo com a opção Compartilhar.",
    },
    {
      title: "Escolha o aplicativo de envio",
      instruction: "Escolha WhatsApp ou outro aplicativo e envie o link para a pessoa certa.",
      imageAlt: "Tela de compartilhamento do link da Play Store.",
    },
  ],

  "denunciar-aplicativo-play-store": [
    {
      title: "Abra a página do aplicativo",
      instruction: "Pesquise o aplicativo suspeito, mas não o instale para fazer a denúncia.",
      imageAlt: "Página de aplicativo suspeito na Play Store.",
    },
    {
      title: "Abra o menu de opções",
      instruction: "Toque nos três pontinhos no canto superior direito da página.",
      imageAlt: "Menu de opções da página do aplicativo.",
    },
    {
      title: "Escolha denunciar",
      instruction: "Toque em 'Sinalizar como inadequado' ou em uma opção semelhante e escolha o motivo.",
      imageAlt: "Formulário de denúncia de aplicativo.",
    },
    {
      title: "Envie a denúncia",
      instruction: "Confira o motivo e toque em 'Enviar'.",
      imageAlt: "Confirmação de envio da denúncia.",
    },
  ],
};
