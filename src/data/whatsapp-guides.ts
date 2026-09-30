import type { Task } from "@/types/content";
import type { EditorialStep } from "@/data/gov-br-guides";

export const whatsappGroups = [
  "Mensagens e Áudios",
  "Chamadas e Vídeo",
  "Fotos e Mídia",
  "Segurança e Ajustes",
] as const;

export type WhatsAppGroup = typeof whatsappGroups[number];

export const whatsappTasks: Task[] = [
  // ── Grupo 1: Mensagens e Áudios ──────────────────────────────────
  {
    id: "task-enviar-mensagem-texto-whatsapp",
    applicationId: "app-whatsapp",
    title: "Enviar mensagem",
    slug: "enviar-mensagem-texto-whatsapp",
    description: "Aprenda a abrir a conversa, digitar no teclado e enviar uma mensagem.",
    difficulty: "easy",
    safetyWarning: "Confira o nome do contato antes de tocar no botão de enviar.",
    searchTerms: ["mandar mensagem", "escrever zap", "mensagem texto", "conversa zap"],
    availability: "available",
    status: "published",
    categoryGroup: "Mensagens e Áudios",
    stepCount: 3,
  },
  {
    id: "task-enviar-audio-whatsapp",
    applicationId: "app-whatsapp",
    title: "Enviar um áudio",
    slug: "enviar-audio-whatsapp",
    description: "Aprenda a segurar o microfone para falar e enviar seu áudio com calma.",
    difficulty: "easy",
    safetyWarning: "Se errar o que falou, basta arrastar o dedo para a esquerda para apagar o áudio.",
    searchTerms: ["mandar áudio", "mensagem de voz", "audio", "gravar voz", "zap"],
    availability: "available",
    status: "published",
    categoryGroup: "Mensagens e Áudios",
    stepCount: 5,
  },
  {
    id: "task-ouvir-audio-whatsapp",
    applicationId: "app-whatsapp",
    title: "Ouvir um áudio",
    slug: "ouvir-audio-whatsapp",
    description: "Aprenda a dar o play e ouvir o áudio bem baixinho encostando o celular no ouvido.",
    difficulty: "easy",
    safetyWarning: "Colocar o celular no ouvido faz o som sair só para você, como numa ligação.",
    searchTerms: ["ouvir audio", "escutar voz", "tocar audio", "ouvir zap"],
    availability: "available",
    status: "published",
    categoryGroup: "Mensagens e Áudios",
    stepCount: 3,
  },
  {
    id: "task-fixar-conversa-whatsapp",
    applicationId: "app-whatsapp",
    title: "Fixar uma conversa",
    slug: "fixar-conversa-whatsapp",
    description: "Deixe as conversas dos seus filhos ou netos sempre no início da lista para achar fácil.",
    difficulty: "easy",
    safetyWarning: "Você pode fixar até 3 conversas no topo da sua lista do WhatsApp.",
    searchTerms: ["fixar conversa", "alfinete zap", "conversa no topo", "destacar conversa"],
    availability: "available",
    status: "published",
    categoryGroup: "Mensagens e Áudios",
    stepCount: 3,
  },

  // ── Grupo 2: Chamadas e Vídeo ────────────────────────────────────
  {
    id: "task-fazer-chamada-whatsapp",
    applicationId: "app-whatsapp",
    title: "Fazer uma ligação",
    slug: "fazer-chamada-whatsapp",
    description: "Aprenda a telefonar de graça pelo WhatsApp usando a internet do celular.",
    difficulty: "easy",
    safetyWarning: "A chamada pelo WhatsApp usa a internet e não gasta seus créditos de celular.",
    searchTerms: ["ligar", "ligação", "telefonar", "chamada de voz", "zap"],
    availability: "available",
    status: "published",
    categoryGroup: "Chamadas e Vídeo",
    stepCount: 5,
  },
  {
    id: "task-fazer-chamada-video-whatsapp",
    applicationId: "app-whatsapp",
    title: "Chamada de vídeo",
    slug: "fazer-chamada-video-whatsapp",
    description: "Converse vendo o rosto da pessoa pela câmera do celular.",
    difficulty: "easy",
    safetyWarning: "Fique em local bem iluminado e segure o celular na altura dos olhos.",
    searchTerms: ["chamada de video", "ver no zap", "videochamada", "filmadora zap"],
    availability: "available",
    status: "published",
    categoryGroup: "Chamadas e Vídeo",
    stepCount: 3,
  },

  // ── Grupo 3: Fotos e Mídia ───────────────────────────────────────
  {
    id: "task-enviar-foto-whatsapp",
    applicationId: "app-whatsapp",
    title: "Enviar foto ou vídeo",
    slug: "enviar-foto-whatsapp",
    description: "Compartilhe fotos de família, recibos ou lembranças da sua galeria.",
    difficulty: "easy",
    safetyWarning: "Confira a foto escolhida na prévia antes de tocar no botão verde de enviar.",
    searchTerms: ["mandar foto", "enviar foto zap", "mandar imagem", "foto galeria"],
    availability: "available",
    status: "published",
    categoryGroup: "Fotos e Mídia",
    stepCount: 4,
  },
  {
    id: "task-tirar-foto-na-hora-whatsapp",
    applicationId: "app-whatsapp",
    title: "Tirar foto na hora",
    slug: "tirar-foto-na-hora-whatsapp",
    description: "Abra a câmera direto na conversa, tire a foto e mande no mesmo instante.",
    difficulty: "easy",
    safetyWarning: "Segure o celular com as duas mãos para a foto não sair tremida.",
    searchTerms: ["tirar foto zap", "camera zap", "foto na hora", "bater foto"],
    availability: "available",
    status: "published",
    categoryGroup: "Fotos e Mídia",
    stepCount: 3,
  },
  {
    id: "task-apagar-mensagem-whatsapp",
    applicationId: "app-whatsapp",
    title: "Apagar mensagem",
    slug: "apagar-mensagem-whatsapp",
    description: "Como excluir uma mensagem ou foto enviada para a conversa errada.",
    difficulty: "easy",
    safetyWarning: "Para que a outra pessoa não veja, escolha sempre 'Apagar para todos'.",
    searchTerms: ["apagar mensagem", "excluir mensagem", "apagar zap", "apagar para todos"],
    availability: "available",
    status: "published",
    categoryGroup: "Fotos e Mídia",
    stepCount: 3,
  },
  {
    id: "task-compartilhar-localizacao-whatsapp",
    applicationId: "app-whatsapp",
    title: "Enviar localização",
    slug: "compartilhar-localizacao-whatsapp",
    description: "Mostre no mapa onde você está para seus filhos ou netos acompanharem sua chegada.",
    difficulty: "medium",
    safetyWarning: "Só envie sua localização para familiares e pessoas de total confiança.",
    searchTerms: ["localizacao zap", "onde estou", "compartilhar local", "gps zap"],
    availability: "available",
    status: "published",
    categoryGroup: "Fotos e Mídia",
    stepCount: 4,
  },

  // ── Grupo 4: Segurança e Ajustes ─────────────────────────────────
  {
    id: "task-adicionar-contato-whatsapp",
    applicationId: "app-whatsapp",
    title: "Adicionar contato",
    slug: "adicionar-contato-whatsapp",
    description: "Cadastre o número de telefone de um amigo ou médico para poder mandar mensagens.",
    difficulty: "easy",
    safetyWarning: "Não se esqueça de colocar o DDD de 2 números antes do número do telefone.",
    searchTerms: ["adicionar contato", "salvar numero", "novo contato", "cadastrar telefone"],
    availability: "available",
    status: "published",
    categoryGroup: "Segurança e Ajustes",
    stepCount: 4,
  },
  {
    id: "task-silenciar-grupo-whatsapp",
    applicationId: "app-whatsapp",
    title: "Silenciar grupo",
    slug: "silenciar-grupo-whatsapp",
    description: "Faça o celular parar de apitar o tempo todo com mensagens de grupos barulhentos.",
    difficulty: "easy",
    safetyWarning: "Silenciar o grupo não faz você sair dele, apenas tira os barulhos de aviso.",
    searchTerms: ["silenciar grupo", "parar barulho zap", "tirar som grupo", "grupo apitando"],
    availability: "available",
    status: "published",
    categoryGroup: "Segurança e Ajustes",
    stepCount: 3,
  },
  {
    id: "task-bloquear-contato-whatsapp",
    applicationId: "app-whatsapp",
    title: "Bloquear contato",
    slug: "bloquear-contato-whatsapp",
    description: "Impeça que pessoas desconhecidas ou chatas mandem mensagens ou liguem para você.",
    difficulty: "easy",
    safetyWarning: "A pessoa bloqueada não verá mais seus recados nem saberá que você a bloqueou.",
    searchTerms: ["bloquear pessoa", "contato indesejado", "mensagem suspeita", "bloquear zap"],
    availability: "available",
    status: "published",
    categoryGroup: "Segurança e Ajustes",
    stepCount: 5,
  },
  {
    id: "task-identificar-golpe-whatsapp",
    applicationId: "app-whatsapp",
    title: "Identificar golpes",
    slug: "identificar-golpe-whatsapp",
    description: "Saiba o que fazer ao receber mensagem de número novo pedindo dinheiro urgente.",
    difficulty: "easy",
    safetyWarning: "Nunca faça Pix ou transferência antes de ligar para a pessoa no número antigo dela.",
    searchTerms: ["golpe zap", "falso filho", "pedindo dinheiro", "golpe do pix whatsapp"],
    availability: "available",
    status: "published",
    categoryGroup: "Segurança e Ajustes",
    stepCount: 4,
  },
  {
    id: "task-aumentar-letra-whatsapp",
    applicationId: "app-whatsapp",
    title: "Aumentar letra",
    slug: "aumentar-letra-whatsapp",
    description: "Deixe as letras do WhatsApp bem grandes para ler sem forçar a vista.",
    difficulty: "easy",
    safetyWarning: "A alteração não apaga nenhuma mensagem, apenas aumenta as letras na tela.",
    searchTerms: ["aumentar letra", "letra grande", "tamanho da fonte", "letra zap"],
    availability: "available",
    status: "published",
    categoryGroup: "Segurança e Ajustes",
    stepCount: 4,
  },
];

export const whatsappScripts: Record<string, EditorialStep[]> = {
  "enviar-mensagem-texto-whatsapp": [
    {
      title: "Abra a conversa",
      instruction: "No WhatsApp, procure e toque no nome da pessoa para quem você deseja escrever.",
      imageAlt: "Lista de conversas do WhatsApp com um contato em destaque.",
    },
    {
      title: "Toque na caixa de mensagem",
      instruction: "Toque na barra branca no rodapé onde está escrito 'Mensagem'. O teclado do celular vai subir na tela.",
      imageAlt: "Conversa do WhatsApp com a caixa de texto destacada e teclado aberto.",
    },
    {
      title: "Digite e toque na setinha verde",
      instruction: "Digite o que você quer dizer com calma. Ao terminar, toque no botão redondo verde com uma setinha branca para enviar.",
      imageAlt: "Botão verde de envio do WhatsApp em destaque.",
    },
  ],

  "enviar-audio-whatsapp": [
    {
      title: "Abra o WhatsApp",
      instruction: "Toque no ícone verde do WhatsApp na tela do seu celular para abrir o aplicativo.",
      imageAlt: "Tela inicial do celular com o ícone do WhatsApp destacado.",
    },
    {
      title: "Escolha a conversa",
      instruction: "Toque no nome da pessoa para quem você deseja enviar o áudio.",
      imageAlt: "Lista de conversas do WhatsApp com o contato selecionado.",
    },
    {
      title: "Localize o microfone",
      instruction: "Encontre o botão verde com o símbolo de microfone no canto inferior direito.",
      imageAlt: "Conversa do WhatsApp com o botão de microfone destacado.",
    },
    {
      title: "Segure para gravar",
      instruction: "Mantenha o dedo pressionado no microfone e fale a sua mensagem com clareza.",
      imageAlt: "Barra de gravação de áudio em andamento com contador de tempo.",
    },
    {
      title: "Solte para enviar",
      instruction: "Quando terminar de falar, solte o botão do microfone. O áudio será enviado na conversa.",
      imageAlt: "Conversa com a mensagem de áudio enviada com sucesso.",
    },
  ],

  "ouvir-audio-whatsapp": [
    {
      title: "Localize a mensagem de áudio",
      instruction: "Na conversa, procure o balão cinza com uma linha e um triângulo de reproduzir (play).",
      imageAlt: "Balão de áudio recebido no WhatsApp.",
    },
    {
      title: "Toque no triângulo de play",
      instruction: "Toque no triângulo apontando para a direita no início da mensagem. O som começará a tocar.",
      imageAlt: "Botão de reproduzir do áudio com destaque.",
    },
    {
      title: "Aproxime do ouvido se quiser privacidade",
      instruction: "Se estiver com outras pessoas por perto, coloque o celular no ouvido como numa ligação. A tela vai apagar e o som tocará bem baixinho só para você.",
      imageAlt: "Ilustração indicando aproximação do aparelho ao ouvido para áudio privado.",
    },
  ],

  "fixar-conversa-whatsapp": [
    {
      title: "Segure o dedo sobre a conversa",
      instruction: "Na lista de conversas, aperte e segure o dedo por 2 segundos na conversa que você quer fixar (vai aparecer uma marquinha verde).",
      imageAlt: "Conversa selecionada na tela inicial do WhatsApp.",
    },
    {
      title: "Toque no ícone de alfinete no topo",
      instruction: "Olhe para o topo da tela e toque no desenho de 'Alfinete' (tachinha).",
      imageAlt: "Barra superior com o ícone de alfinete em destaque.",
    },
    {
      title: "Confira a conversa fixada no topo",
      instruction: "A conversa ficará agora sempre no início da lista com o desenho do alfinete, facilitando o seu acesso todo dia.",
      imageAlt: "Conversa com alfinete fixada na primeira posição da lista.",
    },
  ],

  "fazer-chamada-whatsapp": [
    {
      title: "Abra o WhatsApp",
      instruction: "Toque no ícone do WhatsApp na tela inicial do celular para abrir o aplicativo.",
      imageAlt: "Tela inicial do celular com o WhatsApp destacado.",
    },
    {
      title: "Escolha o contato",
      instruction: "Toque no nome da pessoa para quem você deseja ligar.",
      imageAlt: "Lista de conversas com o contato desejado selecionado.",
    },
    {
      title: "Toque no telefone",
      instruction: "Toque no símbolo de telefone no canto superior direito para fazer a chamada.",
      imageAlt: "Conversa aberta com o ícone de chamada destacado no topo direito.",
    },
    {
      title: "Permita o microfone",
      instruction: "Se o celular perguntar, toque em 'Durante o uso do app' para liberar a sua voz.",
      imageAlt: "Aviso de permissão solicitando acesso ao microfone do celular.",
    },
    {
      title: "Encerre a chamada",
      instruction: "Quando terminar de conversar, toque no botão vermelho redondo para desligar.",
      imageAlt: "Tela de chamada em andamento com o botão vermelho de desligar.",
    },
  ],

  "fazer-chamada-video-whatsapp": [
    {
      title: "Abra a conversa da pessoa",
      instruction: "Entre na conversa da pessoa que você deseja ver por vídeo.",
      imageAlt: "Conversa do WhatsApp com o contato certo.",
    },
    {
      title: "Toque no ícone de filmadora",
      instruction: "No alto da tela, toque no desenho da filmadora (ao lado do telefone). O celular vai ligar a câmera frontal.",
      imageAlt: "Ícone de câmera/filmadora no topo da conversa.",
    },
    {
      title: "Aproveite a conversa e desligue no vermelho",
      instruction: "Segure o celular na altura dos olhos para a outra pessoa ver você com nitidez. Ao terminar, toque no botão vermelho para encerrar.",
      imageAlt: "Tela de chamada de vídeo com imagem da câmera e botão vermelho de encerramento.",
    },
  ],

  "enviar-foto-whatsapp": [
    {
      title: "Abra a conversa",
      instruction: "Abra a conversa da pessoa ou do grupo para quem deseja mandar a foto.",
      imageAlt: "Conversa do WhatsApp aberta.",
    },
    {
      title: "Toque no clipe ou na câmera",
      instruction: "No rodapé, toque no ícone de 'Clipe de papel' ou no desenho de 'Câmera'.",
      imageAlt: "Ícone de clipe e câmera ao lado da caixa de mensagem.",
    },
    {
      title: "Selecione 'Galeria' e escolha a foto",
      instruction: "Toque em 'Galeria' e depois toque na foto ou vídeo que você quer compartilhar.",
      imageAlt: "Mural da galeria de fotos do celular.",
    },
    {
      title: "Confira e toque no botão verde",
      instruction: "A foto abrirá em tamanho grande. Se quiser, escreva uma legenda e toque no botão redondo verde no canto inferior direito para enviar.",
      imageAlt: "Prévia da foto com o botão verde de envio em destaque.",
    },
  ],

  "tirar-foto-na-hora-whatsapp": [
    {
      title: "Toque no ícone de câmera na conversa",
      instruction: "Dentro da conversa, no canto direito da barra de mensagem, toque no desenho de camerazinha.",
      imageAlt: "Câmera ao lado da caixa de mensagem destacada.",
    },
    {
      title: "Aponte e dê um toque no círculo branco",
      instruction: "Enquadre o que você quer fotografar e toque no círculo branco grande no rodapé da tela para tirar a foto.",
      imageAlt: "Tela da câmera com o botão disparador branco em destaque.",
    },
    {
      title: "Toque no botão verde de enviar",
      instruction: "Confira a foto na tela. Se ficou boa, toque no botão redondo verde para enviar na mesma hora.",
      imageAlt: "Foto tirada com o botão verde de envio.",
    },
  ],

  "apagar-mensagem-whatsapp": [
    {
      title: "Segure o dedo sobre a mensagem",
      instruction: "Encontre a mensagem ou foto que você enviou errado e segure o dedo em cima dela por 2 segundos até ela ficar azul/marcada.",
      imageAlt: "Mensagem selecionada com destaque azul no WhatsApp.",
    },
    {
      title: "Toque no ícone de Lixeira no topo",
      instruction: "Olhe para a parte de cima da tela e toque no desenho da lixeira.",
      imageAlt: "Barra superior com o ícone de lixeira em destaque.",
    },
    {
      title: "Escolha 'Apagar para todos'",
      instruction: "Na janelinha que abrir, toque em 'Apagar para todos'. ATENÇÃO: Nunca toque em 'Apagar para mim', senão a mensagem sumirá apenas da sua vista, mas a outra pessoa continuará vendo!",
      imageAlt: "Janela de opções com o botão Apagar para todos destacado.",
      warning: "Escolha sempre 'Apagar para todos'. A opção 'Apagar para mim' apaga só no seu celular e a outra pessoa continuará lendo.",
    },
  ],

  "compartilhar-localizacao-whatsapp": [
    {
      title: "Abra a conversa do familiar",
      instruction: "Abra a conversa da pessoa da família para quem você quer mandar a sua localização.",
      imageAlt: "Conversa com o familiar aberta.",
    },
    {
      title: "Toque no clipe de papel",
      instruction: "No rodapé, toque no ícone de clipe ao lado da caixa de mensagem para abrir as opções de anexo.",
      imageAlt: "Menu de anexos com ícone de clipe destacado.",
    },
    {
      title: "Toque em 'Localização'",
      instruction: "Toque no círculo verde escrito 'Localização'. Se o celular pedir permissão de GPS, toque em 'Durante o uso do app'.",
      imageAlt: "Opção Localização destacada no menu do WhatsApp.",
    },
    {
      title: "Toque em 'Localização atual' ou em tempo real",
      instruction: "Toque em 'Enviar localização atual' para mandar onde você está agora. O familiar receberá o mapa com seu ponto exato.",
      imageAlt: "Mapa com o ponto de localização enviado na conversa.",
      warning: "Compartilhe sua localização apenas com pessoas da sua família e de total confiança.",
    },
  ],

  "adicionar-contato-whatsapp": [
    {
      title: "Toque no botão de nova conversa",
      instruction: "Na tela onde ficam suas conversas, toque no botão redondo verde no canto inferior direito.",
      imageAlt: "Botão verde de nova conversa no canto inferior direito.",
    },
    {
      title: "Toque em 'Novo contato'",
      instruction: "No topo da lista de opções, toque em 'Novo contato' (com o desenho de uma pessoa e sinal de Mais).",
      imageAlt: "Lista de opções destacando Novo contato.",
    },
    {
      title: "Digite o nome e o número de telefone",
      instruction: "Escreva o nome do contato e, no campo de telefone, digite o DDD (ex: 11, 21, 35) e o número completo.",
      imageAlt: "Formulário de cadastro com nome e telefone preenchidos.",
    },
    {
      title: "Toque em 'Salvar'",
      instruction: "Toque no botão 'Salvar' no topo da tela. Agora você já pode mandar mensagens para esse número quando quiser.",
      imageAlt: "Botão Salvar destacado confirmando o novo contato.",
    },
  ],

  "silenciar-grupo-whatsapp": [
    {
      title: "Segure o dedo sobre o grupo",
      instruction: "Na lista de conversas, segure o dedo em cima do grupo que manda muitas mensagens até ficar marcado.",
      imageAlt: "Grupo selecionado na lista de conversas.",
    },
    {
      title: "Toque no alto-falante riscado",
      instruction: "Olhe para a barra no topo da tela e toque no ícone de um alto-falante com um risco cortando.",
      imageAlt: "Ícone de alto-falante riscado no topo.",
    },
    {
      title: "Escolha 'Sempre' e confirme",
      instruction: "Selecione a opção 'Sempre' e toque em 'OK'. O grupo continuará funcionando, mas seu celular não vai mais apitar nem vibrar.",
      imageAlt: "Janela de seleção de tempo com opção Sempre marcada.",
    },
  ],

  "bloquear-contato-whatsapp": [
    {
      title: "Abra a conversa",
      instruction: "Toque na conversa da pessoa ou número que você deseja bloquear.",
      imageAlt: "Lista de conversas com o contato que será bloqueado.",
    },
    {
      title: "Abra os dados do contato",
      instruction: "Toque no nome ou na foto da pessoa no topo da tela para abrir os detalhes.",
      imageAlt: "Topo da conversa com o nome do contato em destaque.",
    },
    {
      title: "Role até o final",
      instruction: "Desça a página de dados do contato até encontrar a opção 'Bloquear contato'.",
      imageAlt: "Fim da página de detalhes do contato com a opção de bloqueio visível.",
    },
    {
      title: "Selecione Bloquear",
      instruction: "Toque em 'Bloquear contato' na lista de opções em vermelho.",
      imageAlt: "Opções de bloqueio destacando o botão Bloquear.",
    },
    {
      title: "Confirme o bloqueio",
      instruction: "Toque em Bloquear para confirmar. A pessoa não poderá mais te ligar ou mandar mensagens.",
      imageAlt: "Confirmação de bloqueio do contato.",
    },
  ],

  "identificar-golpe-whatsapp": [
    {
      title: "Desconfie de pedidos de dinheiro urgente",
      instruction: "Se receber mensagem dizendo 'Mudei de número, me ajuda a pagar uma conta', NÃO responda nem faça Pix.",
      imageAlt: "Mensagem típica de golpe pedindo dinheiro urgente em número novo.",
      warning: "Golpistas usam a foto de parentes (filhos, netos) em números desconhecidos para pedir dinheiro.",
    },
    {
      title: "NUNCA envie dinheiro por mensagem",
      instruction: "Não faça Pix, transferências nem pague boletos enviados por WhatsApp sem falar por voz com a pessoa.",
      imageAlt: "Aviso de segurança alertando para não transferir dinheiro.",
    },
    {
      title: "Ligue para o número antigo do parente",
      instruction: "Abra a agenda do seu celular e ligue para o número de telefone antigo que você sempre usou para falar com esse parente.",
      imageAlt: "Agenda de contatos com o número oficial do familiar em destaque.",
    },
    {
      title: "Bloqueie o número golpista",
      instruction: "Após confirmar que era um golpe, toque nos três pontinhos no topo da conversa falsa e selecione 'Bloquear e denunciar'.",
      imageAlt: "Opção Bloquear e denunciar contato no WhatsApp.",
    },
  ],

  "aumentar-letra-whatsapp": [
    {
      title: "Toque nos três pontinhos na tela inicial",
      instruction: "Na tela onde aparecem todas as suas conversas, toque nos três pontinhos no canto superior direito.",
      imageAlt: "Tela principal do WhatsApp destacando os 3 pontinhos.",
    },
    {
      title: "Toque em Configurações",
      instruction: "Na listinha que abrir, toque na última opção: 'Configurações' (ícone de engrenagem).",
      imageAlt: "Menu suspenso com a opção Configurações destacada.",
    },
    {
      title: "Toque em 'Conversas'",
      instruction: "Procure e toque na opção 'Conversas' (ícone de balão de mensagem).",
      imageAlt: "Lista de configurações destacando a área Conversas.",
    },
    {
      title: "Escolha 'Tamanho da fonte' e marque 'Grande'",
      instruction: "Toque em 'Tamanho da fonte' e escolha a opção 'Grande'. Todas as mensagens do WhatsApp ficarão maiores e fáceis de ler.",
      imageAlt: "Opções de tamanho de fonte com a opção Grande selecionada.",
    },
  ],
};
