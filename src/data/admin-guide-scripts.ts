import { govBrScripts } from "@/data/gov-br-guides";
import { getLocalGuideImages } from "@/data/local-guide-images";
import { otherAppsScripts } from "@/data/other-apps-guides";
import { whatsappScripts } from "@/data/whatsapp-guides";
import type { GuideStep, OperatingSystem } from "@/types/content";

interface EditorialStep {
  title: string;
  instruction: string;
  imageAlt: string;
  warning?: string;
}

const stopBeforeFinancialConfirmation: EditorialStep = {
  title: "Confira e pare antes de confirmar",
  instruction: "Confira os dados com calma. O roteiro termina antes de senha, biometria ou confirmação.",
  imageAlt: "Tela demonstrativa de conferência, sem dados bancários reais.",
  warning: "O Guido nunca pede senha, código de segurança ou confirmação de uma transação.",
};

const scripts: Record<string, EditorialStep[]> = {
  "pagar-conta-codigo-barras": [
    { title: "Abra o aplicativo oficial", instruction: "Confirme o nome do banco e abra o aplicativo oficial.", imageAlt: "Tela inicial do celular com o aplicativo oficial do banco destacado." },
    { title: "Encontre Pagamentos", instruction: "Procure Pagamentos, Pagar ou uma opção com nome parecido.", imageAlt: "Tela do banco com a área de pagamentos destacada." },
    { title: "Escolha código de barras", instruction: "Escolha pagar conta ou usar código de barras.", imageAlt: "Área de pagamentos com a opção de código de barras destacada." },
    { title: "Leia ou digite o código", instruction: "Use a câmera ou digite os números somente dentro do aplicativo do banco.", imageAlt: "Tela para leitura ou digitação do código, sem números reais." },
    stopBeforeFinancialConfirmation,
  ],
  "fazer-pix": [
    { title: "Abra o aplicativo oficial", instruction: "Confirme o nome do banco e abra o aplicativo oficial.", imageAlt: "Tela inicial do celular com o aplicativo oficial do banco destacado." },
    { title: "Entre na área Pix", instruction: "Procure e toque na opção Pix.", imageAlt: "Tela do banco com a opção Pix destacada." },
    { title: "Escolha enviar ou transferir", instruction: "Procure a opção para fazer, enviar ou transferir um Pix.", imageAlt: "Área Pix com a opção de envio destacada." },
    { title: "Escolha como identificar", instruction: "No banco, escolha chave, contato, dados bancários ou outra opção disponível.", imageAlt: "Tela demonstrativa com formas de identificar o recebedor." },
    { title: "Informe o valor no banco", instruction: "Digite o valor somente no aplicativo oficial e avance para a conferência.", imageAlt: "Tela demonstrativa de valor, sem quantia real." },
    stopBeforeFinancialConfirmation,
  ],
  "ver-comprovante-pix": [
    { title: "Abra o aplicativo oficial", instruction: "Abra o aplicativo oficial do banco.", imageAlt: "Tela inicial do celular com o aplicativo oficial do banco destacado." },
    { title: "Procure o histórico", instruction: "Procure Extrato, Histórico, Atividades ou Comprovantes.", imageAlt: "Tela do banco com a área de histórico destacada." },
    { title: "Escolha a movimentação", instruction: "Localize a movimentação pela data, sem mostrar informações pessoais ao Guido.", imageAlt: "Lista demonstrativa de movimentações sem dados reais." },
    { title: "Abra o comprovante", instruction: "Toque na movimentação e procure Ver comprovante ou Detalhes.", imageAlt: "Detalhes demonstrativos com a opção de comprovante destacada." },
    { title: "Salve somente se precisar", instruction: "Use Compartilhar ou Salvar e escolha apenas uma pessoa ou local de confiança.", imageAlt: "Tela demonstrativa com opções de salvar ou compartilhar." },
  ],
  "cobrar-via-pix": [
    { title: "Abra a área Pix", instruction: "No aplicativo oficial do banco, procure e abra Pix.", imageAlt: "Tela do banco com a opção Pix destacada." },
    { title: "Escolha receber ou cobrar", instruction: "Procure Receber, Cobrar ou uma opção com nome parecido.", imageAlt: "Área Pix com a opção de cobrança destacada." },
    { title: "Escolha a forma de cobrança", instruction: "Escolha QR Code, Pix Copia e Cola ou a forma oferecida pelo banco.", imageAlt: "Tela demonstrativa com formas de cobrança Pix." },
    { title: "Revise antes de gerar", instruction: "Confira se a cobrança mostra somente as informações que você deseja compartilhar.", imageAlt: "Revisão demonstrativa de cobrança, sem dados reais." },
    { title: "Compartilhe com cuidado", instruction: "Envie a cobrança somente para a pessoa certa e nunca compartilhe sua senha.", imageAlt: "Tela demonstrativa para compartilhar uma cobrança." },
  ],
  "enviar-pix-chave": [
    { title: "Abra a área Pix", instruction: "No aplicativo oficial do banco, procure e abra Pix.", imageAlt: "Tela do banco com a opção Pix destacada." },
    { title: "Escolha transferir", instruction: "Toque na opção para fazer, enviar ou transferir um Pix.", imageAlt: "Área Pix com a opção de transferência destacada." },
    { title: "Escolha o tipo de chave", instruction: "Escolha CPF, telefone, e-mail, chave aleatória ou a opção apresentada pelo banco.", imageAlt: "Tela demonstrativa de tipos de chave Pix." },
    { title: "Digite a chave no banco", instruction: "Informe a chave somente dentro do aplicativo oficial.", imageAlt: "Campo demonstrativo de chave Pix, sem dado real." },
    { title: "Confira quem receberá", instruction: "Confira o nome retornado pelo banco. Se não for a pessoa esperada, pare.", imageAlt: "Tela demonstrativa de conferência do recebedor." },
    stopBeforeFinancialConfirmation,
  ],
  "pagar-pix-qr-code": [
    { title: "Abra a área Pix", instruction: "No aplicativo oficial do banco, procure e abra Pix.", imageAlt: "Tela do banco com a opção Pix destacada." },
    { title: "Escolha ler QR Code", instruction: "Procure Ler QR Code, Pagar com QR Code ou uma opção parecida.", imageAlt: "Área Pix com a leitura de QR Code destacada." },
    { title: "Permita a câmera", instruction: "Se o celular perguntar, permita a câmera somente para o aplicativo oficial.", imageAlt: "Pedido demonstrativo de permissão da câmera." },
    { title: "Aponte para o código", instruction: "Mantenha o QR Code inteiro dentro da área indicada na tela.", imageAlt: "Câmera demonstrativa enquadrando um QR Code fictício." },
    { title: "Confira o recebedor", instruction: "Confira o nome e o valor mostrados. Se algo estiver diferente, pare.", imageAlt: "Tela demonstrativa de conferência do Pix." },
    stopBeforeFinancialConfirmation,
  ],
  "baixar-segunda-via-boleto": [
    { title: "Procure o canal oficial", instruction: "Abra somente o aplicativo ou site oficial de quem emitiu a cobrança.", imageAlt: "Tela demonstrativa destacando um canal oficial." },
    { title: "Procure segunda via", instruction: "Procure Boleto, Fatura, Conta ou Segunda via.", imageAlt: "Menu demonstrativo com a opção de segunda via destacada." },
    { title: "Escolha a cobrança", instruction: "Localize a cobrança pela descrição e pelo vencimento.", imageAlt: "Lista demonstrativa de cobranças sem dados reais." },
    { title: "Confira o documento", instruction: "Confira beneficiário, valor e vencimento antes de salvar.", imageAlt: "Boleto fictício com campos de conferência destacados." },
    { title: "Salve em local seguro", instruction: "Baixe ou compartilhe apenas se reconhecer o documento e o destino.", imageAlt: "Tela demonstrativa de download ou compartilhamento." },
  ],
  "trocar-senha-app-banco": [
    { title: "Abra o aplicativo oficial", instruction: "Confirme o nome do banco e abra o aplicativo oficial.", imageAlt: "Tela inicial do celular com o aplicativo do banco destacado." },
    { title: "Procure segurança", instruction: "Procure Perfil, Configurações, Segurança ou Senhas.", imageAlt: "Menu demonstrativo com a área de segurança destacada." },
    { title: "Escolha alterar ou recuperar", instruction: "Escolha alterar a senha ou recuperar o acesso, conforme sua necessidade.", imageAlt: "Tela demonstrativa com opções de senha." },
    { title: "Siga a verificação do banco", instruction: "Faça a verificação somente no aplicativo. Não informe códigos ao Guido ou a outras pessoas.", imageAlt: "Tela demonstrativa de verificação de identidade." },
    { title: "Crie uma senha nova", instruction: "Use uma senha exclusiva e não a salve em mensagens ou fotos.", imageAlt: "Tela demonstrativa para criação de senha, sem caracteres reais." },
  ],
  "identificar-golpe-bancario": [
    { title: "Pare e não responda", instruction: "Não clique em links, não instale aplicativos e não compartilhe a tela.", imageAlt: "Mensagem suspeita fictícia com orientação para parar." },
    { title: "Observe sinais de pressão", instruction: "Desconfie de urgência, ameaça, prêmio ou pedido para testar uma transferência.", imageAlt: "Exemplos fictícios de sinais de golpe." },
    { title: "Não informe códigos", instruction: "Banco não precisa que você diga senha, token ou código recebido para cancelar uma fraude.", imageAlt: "Aviso demonstrativo para não compartilhar códigos." },
    { title: "Procure o canal oficial", instruction: "Feche a mensagem e contate o banco pelo aplicativo, cartão ou site oficial.", imageAlt: "Tela demonstrativa com canais oficiais de atendimento." },
    { title: "Bloqueie o contato", instruction: "Se a mensagem for suspeita, bloqueie e denuncie no aplicativo em que a recebeu.", imageAlt: "Tela demonstrativa com opções de bloquear e denunciar." },
  ],
  "caiu-em-golpe-banco": [
    { title: "Interrompa o contato", instruction: "Pare de responder, não envie novos valores e não instale nada.", imageAlt: "Aviso demonstrativo para interromper contato suspeito." },
    { title: "Fale com o banco agora", instruction: "Use o aplicativo, telefone do cartão ou site oficial para informar a fraude.", imageAlt: "Tela demonstrativa com atendimento oficial do banco." },
    { title: "Informe a movimentação", instruction: "No atendimento oficial, localize a operação e siga a opção de contestação ou fraude.", imageAlt: "Histórico fictício com uma movimentação destacada." },
    { title: "Se foi Pix, procure o MED", instruction: "Pergunte ao banco sobre o Mecanismo Especial de Devolução o mais rápido possível.", imageAlt: "Tela demonstrativa de contestação Pix ou MED." },
    { title: "Proteja seus acessos", instruction: "Siga as orientações oficiais para bloquear cartões e trocar senhas comprometidas.", imageAlt: "Tela demonstrativa de proteção de acesso." },
  ],
  "falar-atendimento-banco-app": [
    { title: "Abra o aplicativo oficial", instruction: "Confirme o nome do banco e abra o aplicativo oficial.", imageAlt: "Tela inicial do celular com o aplicativo do banco destacado." },
    { title: "Procure Ajuda", instruction: "Procure Ajuda, Atendimento, Fale conosco ou um ponto de interrogação.", imageAlt: "Tela do banco com a opção de ajuda destacada." },
    { title: "Escolha o assunto", instruction: "Escolha o assunto mais parecido com o problema.", imageAlt: "Lista demonstrativa de assuntos de atendimento." },
    { title: "Escolha o canal", instruction: "Use chat, ligação ou outro canal exibido dentro do aplicativo oficial.", imageAlt: "Tela demonstrativa com canais de atendimento." },
    { title: "Não compartilhe senha", instruction: "Explique o problema, mas nunca diga senha, token ou código de confirmação.", imageAlt: "Conversa fictícia sem dados pessoais com aviso de segurança." },
  ],
  "bloquear-cartao": [
    { title: "Abra o aplicativo oficial", instruction: "Abra o aplicativo do banco e procure a área Cartões.", imageAlt: "Tela do banco com a área de cartões destacada." },
    { title: "Escolha o cartão", instruction: "Selecione o cartão perdido, roubado ou que você deseja proteger.", imageAlt: "Lista fictícia de cartões com um cartão destacado." },
    { title: "Procure bloquear", instruction: "Procure Bloquear, Bloqueio temporário ou Cartão perdido/roubado.", imageAlt: "Tela de cartão com a opção de bloqueio destacada." },
    { title: "Leia o tipo de bloqueio", instruction: "Confira se o bloqueio é temporário ou definitivo antes de continuar.", imageAlt: "Tela demonstrativa explicando tipos de bloqueio." },
    { title: "Confirme no banco", instruction: "Se a opção estiver correta, siga a confirmação somente no aplicativo oficial.", imageAlt: "Tela demonstrativa de confirmação do bloqueio." },
  ],
  saldo: [
    { title: "Abra o aplicativo oficial", instruction: "Abra o aplicativo oficial do banco e entre na sua conta.", imageAlt: "Tela inicial do celular com o aplicativo do banco destacado." },
    { title: "Procure Conta ou Saldo", instruction: "Na página inicial, procure Saldo, Conta ou um símbolo para mostrar valores.", imageAlt: "Tela bancária fictícia com a área de saldo destacada." },
    { title: "Mostre o valor se estiver oculto", instruction: "Se houver um olho riscado, toque nele para mostrar o saldo.", imageAlt: "Controle demonstrativo para mostrar ou ocultar saldo." },
    { title: "Confira o tipo de saldo", instruction: "Observe se o aplicativo informa saldo disponível, total ou limite separado.", imageAlt: "Tela demonstrativa com tipos de saldo, sem valores reais." },
  ],
  limite: [
    { title: "Abra a área Cartões", instruction: "No aplicativo oficial, procure e abra Cartões.", imageAlt: "Tela do banco com a área de cartões destacada." },
    { title: "Escolha o cartão", instruction: "Selecione o cartão cujo limite você deseja consultar.", imageAlt: "Lista fictícia de cartões com um cartão destacado." },
    { title: "Procure Limites", instruction: "Procure Limite, Meus limites ou Limite disponível.", imageAlt: "Tela de cartão com a área de limites destacada." },
    { title: "Diferencie total e disponível", instruction: "Confira se o valor mostrado é limite total, usado ou disponível.", imageAlt: "Tela demonstrativa de limite sem valores reais." },
  ],
  ...whatsappScripts,
  ...govBrScripts,
  ...otherAppsScripts,
};

/** Gera IDs editoriais estáveis; eles vinculam o print ao mesmo passo em novos deploys. */
export function getAdminScriptSteps(slug: string, operatingSystem: OperatingSystem): GuideStep[] {
  const localImages = getLocalGuideImages(slug);
  return (scripts[slug] ?? []).map((step, index) => ({
    ...step,
    id: `editorial-${slug}-${operatingSystem}-${index + 1}`,
    guideId: `editorial-${slug}-${operatingSystem}`,
    order: index + 1,
    imagePath: localImages[index + 1] ?? "",
    audioPath: `/audio/guias/${slug}/step-${index + 1}.mp3`,
  }));
}

export const adminScriptSlugs = Object.keys(scripts);
