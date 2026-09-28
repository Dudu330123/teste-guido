import type { Task } from "@/types/content";

export interface EditorialStep {
  title: string;
  instruction: string;
  imageAlt: string;
  warning?: string;
}

export const govBrGroups = [
  "Conta e Acesso",
  "Meu INSS",
  "Saúde e SUS",
  "Documentos e Direitos",
] as const;

export type GovBrGroup = typeof govBrGroups[number];

export const govBrTasks: Task[] = [
  // ── Grupo 1: Conta e Acesso ──────────────────────────────────────
  {
    id: "task-acessar-gov-br",
    applicationId: "app-gov-br",
    title: "Entrar no Gov.br (Login Oficial)",
    slug: "acessar-gov-br",
    description: "Aprenda a fazer login na sua conta Gov.br com CPF e senha.",
    difficulty: "easy",
    safetyWarning: "Nunca informe códigos de acesso ou senhas fora do aplicativo oficial gov.br.",
    searchTerms: ["entrar gov", "login gov", "acessar governo", "cpf e senha", "abrir conta gov"],
    availability: "available",
    status: "published",
    categoryGroup: "Conta e Acesso",
    stepCount: 4,
  },
  {
    id: "task-recuperar-senha-gov-br",
    applicationId: "app-gov-br",
    title: "Recuperar senha pelo banco",
    slug: "recuperar-senha-gov-br",
    description: "Recupere o acesso à sua conta usando o aplicativo do seu banco credenciado.",
    difficulty: "medium",
    safetyWarning: "O Guido nunca pede sua senha ou código de confirmação. Faça o processo apenas no app oficial.",
    searchTerms: ["esqueci senha", "recuperar gov", "senha banco", "recuperar pelo banco", "mudar senha gov"],
    availability: "available",
    status: "published",
    categoryGroup: "Conta e Acesso",
    stepCount: 5,
  },
  {
    id: "task-recuperar-senha-facial-gov-br",
    applicationId: "app-gov-br",
    title: "Recuperar senha com reconhecimento facial",
    slug: "recuperar-senha-facial-gov-br",
    description: "Recupere sua senha tirando uma foto do seu rosto pela câmera do celular.",
    difficulty: "medium",
    safetyWarning: "Fique em local bem iluminado e siga as instruções na tela do aplicativo oficial.",
    searchTerms: ["reconhecimento facial", "recuperar rosto", "selfie gov", "biometria facial gov"],
    availability: "available",
    status: "published",
    categoryGroup: "Conta e Acesso",
    stepCount: 4,
  },
  {
    id: "task-aumentar-nivel-prata-ouro-gov-br",
    applicationId: "app-gov-br",
    title: "Aumentar nível para Prata ou Ouro",
    slug: "aumentar-nivel-prata-ouro-gov-br",
    description: "Suba o nível da sua conta para liberar o Meu INSS, restituição e outros serviços.",
    difficulty: "medium",
    safetyWarning: "A validação é feita diretamente pelo seu banco ou biometria da CNH/TSE.",
    searchTerms: ["nivel prata", "nivel ouro", "subir nivel", "selo de confiabilidade", "conta prata"],
    availability: "available",
    status: "published",
    categoryGroup: "Conta e Acesso",
    stepCount: 4,
  },

  // ── Grupo 2: Meu INSS ─────────────────────────────────────────────
  {
    id: "task-prova-de-vida-gov-br",
    applicationId: "app-gov-br",
    title: "Fazer a Prova de Vida pelo celular",
    slug: "prova-de-vida-gov-br",
    description: "Comprove sua vida pelo reconhecimento facial sem precisar ir à agência bancária.",
    difficulty: "medium",
    safetyWarning: "O INSS não liga pedindo fotos ou dados para prova de vida. Faça apenas dentro do app oficial.",
    searchTerms: ["prova de vida", "inss prova de vida", "biometria inss", "aposentadoria prova de vida"],
    availability: "available",
    status: "published",
    categoryGroup: "Meu INSS",
    stepCount: 4,
  },
  {
    id: "task-extrato-pagamento-inss-gov-br",
    applicationId: "app-gov-br",
    title: "Tirar extrato de pagamento do benefício",
    slug: "extrato-pagamento-inss-gov-br",
    description: "Consulte a data de pagamento, o valor que cairá na conta e eventuais descontos.",
    difficulty: "easy",
    safetyWarning: "Confira sempre se os valores batem com o que foi creditado no seu banco.",
    searchTerms: ["extrato inss", "pagamento inss", "dia do pagamento inss", "valor aposentadoria", "holerite inss"],
    availability: "available",
    status: "published",
    categoryGroup: "Meu INSS",
    stepCount: 3,
  },
  {
    id: "task-bloquear-consignado-inss-gov-br",
    applicationId: "app-gov-br",
    title: "Bloquear e consultar empréstimo consignado",
    slug: "bloquear-consignado-inss-gov-br",
    description: "Veja os contratos ativos em seu nome e bloqueie novos empréstimos contra golpes.",
    difficulty: "easy",
    safetyWarning: "Manter o benefício bloqueado para empréstimo é a melhor proteção contra fraudes financeiras.",
    searchTerms: ["bloquear consignado", "emprestimo inss", "bloquear emprestimo", "extrato de emprestimos"],
    availability: "available",
    status: "published",
    categoryGroup: "Meu INSS",
    stepCount: 4,
  },
  {
    id: "task-extrato-cnis-inss-gov-br",
    applicationId: "app-gov-br",
    title: "Consultar extrato de contribuições (CNIS)",
    slug: "extrato-cnis-inss-gov-br",
    description: "Veja o histórico de todos os seus empregos e recolhimentos da vida toda.",
    difficulty: "easy",
    safetyWarning: "Guarde o extrato baixado em local seguro. Ele contém seus dados previdenciários.",
    searchTerms: ["cnis", "extrato cnis", "tempo de contribuicao", "historico inss", "tempo de servico"],
    availability: "available",
    status: "published",
    categoryGroup: "Meu INSS",
    stepCount: 3,
  },

  // ── Grupo 3: Saúde e SUS ──────────────────────────────────────────
  {
    id: "task-carteira-vacinacao-gov-br",
    applicationId: "app-gov-br",
    title: "Emitir carteira de vacinação digital",
    slug: "carteira-vacinacao-gov-br",
    description: "Consulte as vacinas tomadas e emita o certificado digital de vacinação.",
    difficulty: "easy",
    safetyWarning: "O certificado oficial é emitido pelo Ministério da Saúde com QR Code para validação.",
    searchTerms: ["vacina", "carteira de vacinacao", "certificado vacina", "conecte sus vacinas", "meu sus digital"],
    availability: "available",
    status: "published",
    categoryGroup: "Saúde e SUS",
    stepCount: 3,
  },
  {
    id: "task-cartao-sus-gov-br",
    applicationId: "app-gov-br",
    title: "Ver o Cartão do SUS no celular",
    slug: "cartao-sus-gov-br",
    description: "Tenha o número e o código do seu Cartão Nacional de Saúde sempre à mão no celular.",
    difficulty: "easy",
    safetyWarning: "Você pode apresentar a tela do celular diretamente na recepção de postos e hospitais.",
    searchTerms: ["cartao sus", "numero sus", "cns", "carteirinha sus", "cartao nacional de saude"],
    availability: "available",
    status: "published",
    categoryGroup: "Saúde e SUS",
    stepCount: 3,
  },
  {
    id: "task-farmacia-popular-gov-br",
    applicationId: "app-gov-br",
    title: "Retirar remédios no Farmácia Popular",
    slug: "farmacia-popular-gov-br",
    description: "Gere a autorização digital para retirar medicamentos gratuitos ou com desconto.",
    difficulty: "easy",
    safetyWarning: "Apresente na farmácia a tela do celular com seu documento físico e a receita médica válida.",
    searchTerms: ["farmacia popular", "remedios gratis", "medicamento sus", "pegar remedio farmacia"],
    availability: "available",
    status: "published",
    categoryGroup: "Saúde e SUS",
    stepCount: 3,
  },

  // ── Grupo 4: Documentos e Direitos ────────────────────────────────
  {
    id: "task-cnh-digital-gov-br",
    applicationId: "app-gov-br",
    title: "Baixar a CNH Digital no celular",
    slug: "cnh-digital-gov-br",
    description: "Tenha sua Carteira de Motorista no celular mesmo quando estiver sem internet.",
    difficulty: "medium",
    safetyWarning: "A CNH Digital tem o mesmo valor jurídico da impressa em todo o território nacional.",
    searchTerms: ["cnh digital", "carteira motorista celular", "cdt", "carteira de transito", "habilitacao digital"],
    availability: "available",
    status: "published",
    categoryGroup: "Documentos e Direitos",
    stepCount: 4,
  },
  {
    id: "task-consultar-cpf-gov-br",
    applicationId: "app-gov-br",
    title: "Consultar situação do CPF na Receita",
    slug: "consultar-cpf-gov-br",
    description: "Verifique se o seu CPF está Regular e emita o comprovante de situação cadastral.",
    difficulty: "easy",
    safetyWarning: "A consulta é 100% gratuita no canal oficial da Receita Federal / Gov.br.",
    searchTerms: ["consultar cpf", "situacao cpf", "cpf regular", "comprovante cpf", "receita federal cpf"],
    availability: "available",
    status: "published",
    categoryGroup: "Documentos e Direitos",
    stepCount: 3,
  },
  {
    id: "task-assinar-documento-gov-br",
    applicationId: "app-gov-br",
    title: "Assinar documento digitalmente",
    slug: "assinar-documento-gov-br",
    description: "Assine contratos e documentos em PDF pelo Gov.br com validade jurídica e sem custo.",
    difficulty: "medium",
    safetyWarning: "Só assine documentos que você leu com atenção e confia plenamente em quem enviou.",
    searchTerms: ["assinar documento", "assinador gov", "assinatura digital", "assinar pdf", "iti gov br"],
    availability: "available",
    status: "published",
    categoryGroup: "Documentos e Direitos",
    stepCount: 4,
  },
  {
    id: "task-valores-a-receber-gov-br",
    applicationId: "app-gov-br",
    title: "Consultar Valores a Receber (Dinheiro esquecido)",
    slug: "valores-a-receber-gov-br",
    description: "Consulte se você tem dinheiro esquecido em bancos ou consórcios e receba via Pix.",
    difficulty: "easy",
    safetyWarning: "Cuidado com golpes: o Banco Central nunca manda links por WhatsApp nem cobra taxas para liberar valores.",
    searchTerms: ["valores a receber", "dinheiro esquecido", "banco central", "restituicao esquecida", "dinheiro banco"],
    availability: "available",
    status: "published",
    categoryGroup: "Documentos e Direitos",
    stepCount: 3,
  },
];

export const govBrScripts: Record<string, EditorialStep[]> = {
  // ── Grupo 1: Conta e Acesso ──────────────────────────────────────
  "acessar-gov-br": [
    {
      title: "Abra o aplicativo oficial",
      instruction: "Confirme se o aplicativo é o Gov.br oficial com fundo azul e toque para abri-lo.",
      imageAlt: "Tela inicial do celular com o aplicativo oficial Gov.br destacado.",
    },
    {
      title: "Digite o seu CPF",
      instruction: "Toque na caixa 'Digite seu CPF', informe os 11 números e toque no botão azul 'Continuar'.",
      imageAlt: "Tela oficial com o campo de CPF e o botão Continuar destacados.",
    },
    {
      title: "Digite a sua senha",
      instruction: "Digite sua senha secreta cadastrada. O Guido nunca vê nem pede sua senha.",
      imageAlt: "Tela oficial de senha do Gov.br com o campo de senha protegido.",
      warning: "Nunca informe sua senha a terceiros ou em aplicativos não oficiais.",
    },
    {
      title: "Conclua a verificação",
      instruction: "Se o aplicativo pedir um código de duas etapas por SMS ou notificação, confirme para entrar com total segurança.",
      imageAlt: "Tela de confirmação de segurança em duas etapas do Gov.br.",
    },
  ],

  "recuperar-senha-gov-br": [
    {
      title: "Toque em Esqueci minha senha",
      instruction: "Na tela onde pede a senha do Gov.br, procure e toque na opção azul 'Esqueci minha senha'.",
      imageAlt: "Tela de login do Gov.br com a opção Esqueci minha senha destacada.",
    },
    {
      title: "Escolha Login com seu banco",
      instruction: "Na lista de opções de recuperação, escolha 'Login com seu banco'. É o jeito mais fácil, rápido e seguro para quem tem conta.",
      imageAlt: "Lista de opções de recuperação com a opção de bancos credenciados destacada.",
    },
    {
      title: "Selecione o seu banco",
      instruction: "Escolha o banco onde você já tem conta e aplicativo instalado no seu celular (ex: Banco do Brasil, Caixa, Bradesco, Itaú).",
      imageAlt: "Tela de seleção de bancos com as marcas dos bancos brasileiros.",
    },
    {
      title: "Autorize o acesso no app do banco",
      instruction: "O aplicativo do seu banco abrirá automaticamente. Confirme que é você quem está autorizando o acesso ao Gov.br.",
      imageAlt: "Tela de autorização segura dentro do aplicativo do banco.",
      warning: "O banco não solicita transferências nem pagamentos para recuperar senha.",
    },
    {
      title: "Cadastre sua nova senha",
      instruction: "Crie uma nova senha de acesso, anote em um caderno seguro na sua casa e toque em 'Salvar'.",
      imageAlt: "Tela oficial de criação e confirmação de nova senha no Gov.br.",
    },
  ],

  "recuperar-senha-facial-gov-br": [
    {
      title: "Escolha Reconhecimento Facial",
      instruction: "Na tela de recuperação de senha, selecione a opção 'Reconhecimento Facial (Foto)'.",
      imageAlt: "Tela de opções de recuperação com a biometria facial destacada.",
    },
    {
      title: "Permita a câmera do celular",
      instruction: "Toque em 'Permitir' quando o celular pedir autorização para usar a câmera durante o procedimento.",
      imageAlt: "Janela do celular solicitando permissão para usar a câmera.",
    },
    {
      title: "Enquadre o rosto no círculo",
      instruction: "Fique em um ambiente claro e bem iluminado. Coloque seu rosto dentro do círculo e siga os comandos, como piscar os olhos ou sorrir.",
      imageAlt: "Câmera do aplicativo com o círculo de enquadramento facial destacado.",
    },
    {
      title: "Crie a sua nova senha",
      instruction: "Assim que o sistema validar sua foto com o banco de dados oficial, digite e confirme sua nova senha de acesso.",
      imageAlt: "Tela de sucesso da biometria e cadastro de nova senha.",
    },
  ],

  "aumentar-nivel-prata-ouro-gov-br": [
    {
      title: "Abra a área de Segurança",
      instruction: "No aplicativo Gov.br, toque no menu de perfil e selecione 'Segurança da Conta' ou 'Selos de Confiabilidade'.",
      imageAlt: "Menu de perfil do Gov.br com a opção Segurança da Conta destacada.",
    },
    {
      title: "Escolha Aumentar Nível",
      instruction: "Toque em 'Aumentar nível da conta' para liberar o acesso ao Meu INSS, restituição e outros serviços do governo.",
      imageAlt: "Tela indicando o nível atual e o botão para Aumentar Nível.",
    },
    {
      title: "Escolha o tipo de validação",
      instruction: "Escolha validação pelo seu banco credenciado (para nível Prata) ou biometria facial da CNH/TSE (para nível Ouro).",
      imageAlt: "Opções de validação: credenciamento bancário ou biometria facial.",
    },
    {
      title: "Confirme a validação",
      instruction: "Siga a confirmação rápida no app do banco ou na câmera e confira o selo Prata ou Ouro ativado com sucesso.",
      imageAlt: "Tela de parabéns confirmando o novo nível Prata ou Ouro.",
    },
  ],

  // ── Grupo 2: Meu INSS ─────────────────────────────────────────────
  "prova-de-vida-gov-br": [
    {
      title: "Abra o aplicativo Gov.br",
      instruction: "Entre no aplicativo Gov.br com o seu CPF e sua senha cadastrada.",
      imageAlt: "Tela de início do aplicativo Gov.br com login concluído.",
    },
    {
      title: "Toque em Prova de Vida",
      instruction: "Na tela inicial ou na área de serviços em destaque, localize e toque em 'Prova de Vida'.",
      imageAlt: "Tela inicial com o botão Prova de Vida destacado.",
    },
    {
      title: "Faça o reconhecimento facial",
      instruction: "Segure o celular na altura dos olhos em local bem iluminado. Olhe para a câmera e siga os comandos na tela (olhe para a frente, pisque).",
      imageAlt: "Área de leitura facial da Prova de Vida com orientações de luz e posição.",
    },
    {
      title: "Guarde o comprovante",
      instruction: "Confira a mensagem de sucesso: sua Prova de Vida está concluída e seu benefício segue garantido sem você precisar ir ao banco.",
      imageAlt: "Comprovante oficial em verde indicando Prova de Vida Realizada com Sucesso.",
    },
  ],

  "extrato-pagamento-inss-gov-br": [
    {
      title: "Abra o Meu INSS",
      instruction: "Abra o aplicativo Meu INSS no seu celular e toque no botão azul 'Entrar com gov.br'.",
      imageAlt: "Tela inicial do aplicativo Meu INSS com o botão Entrar com gov.br em destaque.",
    },
    {
      title: "Toque em Extrato de Pagamento",
      instruction: "Na tela inicial, localize e toque no botão 'Extrato de Pagamento de Benefício' (ícone com desenho de folha).",
      imageAlt: "Menu de serviços do Meu INSS com o botão Extrato de Pagamento destacado.",
    },
    {
      title: "Confira o valor e a data",
      instruction: "Toque no mês que você deseja consultar para ver o dia do pagamento, o valor que cairá na conta e eventuais descontos autorizados.",
      imageAlt: "Demonstrativo detalhado com mês de referência, valor bruto, descontos e valor líquido.",
    },
  ],

  "bloquear-consignado-inss-gov-br": [
    {
      title: "Acesse o Meu INSS",
      instruction: "Abra o aplicativo Meu INSS e entre com a sua conta Gov.br informando CPF e senha.",
      imageAlt: "Tela inicial do Meu INSS após login.",
    },
    {
      title: "Toque em Extrato de Empréstimos",
      instruction: "Procure e toque em 'Extrato de Empréstimos Consignados' para ver todos os contratos vinculados ao seu benefício.",
      imageAlt: "Menu do Meu INSS com a opção Extrato de Empréstimos Consignados destacada.",
    },
    {
      title: "Confira se há cobranças estranhas",
      instruction: "Examine os valores e os nomes dos bancos. Se houver qualquer desconto não autorizado, guarde o extrato para contestação.",
      imageAlt: "Lista de contratos de empréstimo com parcelas e instituições financeiras.",
    },
    {
      title: "Ative o bloqueio preventivo",
      instruction: "Procure a opção 'Bloquear/Desbloquear Benefício para Empréstimo' e selecione 'Bloquear' para impedir golpes e novas contratações sem sua permissão.",
      imageAlt: "Tela de confirmação do Bloqueio de Empréstimo no benefício.",
      warning: "Você pode desbloquear gratuitamente no mesmo aplicativo a qualquer momento se decidir contratar um empréstimo.",
    },
  ],

  "extrato-cnis-inss-gov-br": [
    {
      title: "Abra o aplicativo Meu INSS",
      instruction: "Entre no Meu INSS com seu CPF e senha Gov.br.",
      imageAlt: "Tela inicial do Meu INSS.",
    },
    {
      title: "Toque em Extrato de Contribuição (CNIS)",
      instruction: "Procure o botão 'Extrato de Contribuição (CNIS)' na lista de serviços em destaque.",
      imageAlt: "Menu de serviços do Meu INSS com a opção CNIS destacada.",
    },
    {
      title: "Visualize e baixe o histórico",
      instruction: "Veja todo o histórico dos seus locais de trabalho e recolhimentos. Toque em 'Baixar PDF' para salvar o documento no celular.",
      imageAlt: "Tela com o extrato previdenciário e o botão Baixar PDF em destaque.",
    },
  ],

  // ── Grupo 3: Saúde e SUS ──────────────────────────────────────────
  "carteira-vacinacao-gov-br": [
    {
      title: "Abra o Meu SUS Digital",
      instruction: "Abra o aplicativo Meu SUS Digital no celular e toque no botão azul 'Entrar com gov.br'.",
      imageAlt: "Tela inicial do aplicativo Meu SUS Digital com o botão de acesso Gov.br.",
    },
    {
      title: "Toque em Vacinas",
      instruction: "Na tela inicial do Meu SUS Digital, procure e toque no botão 'Vacinas' (ícone de seringa).",
      imageAlt: "Menu principal do Meu SUS Digital com o cartão Vacinas destacado.",
    },
    {
      title: "Veja as doses e gere o certificado",
      instruction: "Confira as doses tomadas e toque em 'Emitir Certificado de Vacinação' para visualizar ou salvar o documento oficial com QR Code.",
      imageAlt: "Lista de vacinas com datas e o botão Emitir Certificado destacado.",
    },
  ],

  "cartao-sus-gov-br": [
    {
      title: "Abra o Meu SUS Digital",
      instruction: "Faça login com seu CPF e senha Gov.br no aplicativo Meu SUS Digital.",
      imageAlt: "Tela inicial do Meu SUS Digital logado.",
    },
    {
      title: "Toque no ícone da Carteira",
      instruction: "No alto da tela, toque no desenho do cartãozinho ou no seu nome para abrir a carteira digital.",
      imageAlt: "Cabeçalho do app destacando o ícone do Cartão SUS.",
    },
    {
      title: "Mostre o número e o QR Code",
      instruction: "O aplicativo exibe seu Cartão Nacional de Saúde com o número oficial e código para atendimento em qualquer posto ou hospital do país.",
      imageAlt: "Cartão Nacional de Saúde na tela com nome completo, número do SUS e código QR.",
    },
  ],

  "farmacia-popular-gov-br": [
    {
      title: "Acesse o Meu SUS Digital",
      instruction: "Entre no Meu SUS Digital com sua conta Gov.br.",
      imageAlt: "Tela de login do Meu SUS Digital.",
    },
    {
      title: "Toque em Medicamentos",
      instruction: "Procure e toque na seção 'Farmácia Popular / Medicamentos' para ver os remédios autorizados para sua faixa etária e condições de saúde.",
      imageAlt: "Área de medicamentos e Farmácia Popular destacada no aplicativo.",
    },
    {
      title: "Gere a autorização digital",
      instruction: "Toque em 'Gerar Autorização' e apresente a tela do celular na farmácia credenciada junto com a receita médica e seu documento com foto.",
      imageAlt: "Comprovante digital com código de autorização para retirada de remédios.",
    },
  ],

  // ── Grupo 4: Documentos e Direitos ────────────────────────────────
  "cnh-digital-gov-br": [
    {
      title: "Abra o Carteira Digital de Trânsito",
      instruction: "Abra o aplicativo CDT (Carteira Digital de Trânsito) e toque em 'Entrar com gov.br'.",
      imageAlt: "Tela de início do aplicativo Carteira Digital de Trânsito.",
    },
    {
      title: "Toque em Habilitação",
      instruction: "Na tela inicial, toque no botão 'Habilitação' (ícone de volante ou carteira de motorista).",
      imageAlt: "Menu da CDT com o card Habilitação destacado.",
    },
    {
      title: "Valide sua identidade",
      instruction: "O aplicativo solicitará a confirmação biométrica ou dados da sua CNH física para validar seu documento de forma segura.",
      imageAlt: "Tela de validação segura puxando os dados da CNH.",
    },
    {
      title: "Cadastre uma chave de 4 dígitos",
      instruction: "Crie uma senha simples de 4 números. Ela permite que você abra sua CNH na rua mesmo se estiver sem conexão de internet.",
      imageAlt: "Teclado numérico cadastrando a chave de 4 dígitos de acesso rápido.",
    },
  ],

  "consultar-cpf-gov-br": [
    {
      title: "Acesse a consulta oficial",
      instruction: "Abra o aplicativo Gov.br ou acesse o serviço oficial 'Consulta Situação Cadastral CPF' da Receita Federal.",
      imageAlt: "Página oficial da Receita Federal / Gov.br com a consulta de CPF.",
    },
    {
      title: "Informe o CPF e data de nascimento",
      instruction: "Digite os 11 números do seu CPF e a sua data de nascimento com dia, mês e ano nos campos indicados.",
      imageAlt: "Formulário com campos de CPF e Data de Nascimento destacados.",
    },
    {
      title: "Confira a situação Regular",
      instruction: "Veja na tela se a situação cadastral está 'Regular'. Toque em 'Gerar Comprovante' caso precise apresentar em algum banco ou cartório.",
      imageAlt: "Certidão cadastral mostrando Situação: Regular e botão Gerar Comprovante.",
    },
  ],

  "assinar-documento-gov-br": [
    {
      title: "Acesse o Assinador Gov.br",
      instruction: "Acesse o serviço de assinatura eletrônica oficial (assinador.iti.br ou pelo app Gov.br) com sua conta nível Prata ou Ouro.",
      imageAlt: "Portal oficial de Assinatura Eletrônica do Gov.br.",
    },
    {
      title: "Escolha o documento PDF",
      instruction: "Toque em 'Escolher arquivo' e selecione o documento em PDF salvo no seu celular que precisa ser assinado.",
      imageAlt: "Botão Escolher arquivo e gerenciador de arquivos do celular.",
    },
    {
      title: "Posicione a sua assinatura",
      instruction: "Arraste o retângulo com o seu nome até o campo onde fica a linha da assinatura no documento.",
      imageAlt: "Visualizador de documento com a marca de assinatura sendo posicionada na folha.",
    },
    {
      title: "Confirme com o código SMS",
      instruction: "Digite o código numérico recebido por SMS no seu celular. O documento será assinado com validade jurídica oficial para você baixar e compartilhar.",
      imageAlt: "Confirmação com código de segurança e botão de download do documento assinado.",
      warning: "Só assine documentos que você conhece e confia plenamente em quem enviou.",
    },
  ],

  "valores-a-receber-gov-br": [
    {
      title: "Acesse o site oficial do Banco Central",
      instruction: "Abra a página oficial valoresareceber.bcb.gov.br. Atenção: o endereço oficial sempre termina em .bcb.gov.br.",
      imageAlt: "Página oficial do Banco Central do Brasil - Sistema Valores a Receber.",
      warning: "Cuidado com golpes: o Banco Central nunca manda mensagens cobrando taxa para liberar valores.",
    },
    {
      title: "Entre com a conta Gov.br",
      instruction: "Toque em 'Entrar com gov.br' e acesse com sua conta nível Prata ou Ouro.",
      imageAlt: "Botão de acesso com login Gov.br na página do Banco Central.",
    },
    {
      title: "Consulte o saldo e solicite via Pix",
      instruction: "Veja se você tem dinheiro esquecido em contas antigas ou consórcios e toque em 'Solicitar por Pix' para receber diretamente na sua conta.",
      imageAlt: "Tela com valor a receber encontrado e opção de transferência via chave Pix.",
    },
  ],
};
