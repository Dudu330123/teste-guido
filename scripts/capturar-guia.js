#!/usr/bin/env node
/**
 * capturar-guia.js — Script interativo de captura de telas via ADB
 * Salva em: C:\Users\eduar\OneDrive\Documentos\Guido\capturas de tela\prints\{app}\{slug}\step-N.png
 * Uso: node scripts/capturar-guia.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────────
const ADB_PATH = "C:\\Users\\eduar\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Google.PlatformTools_Microsoft.Winget.Source_8wekyb3d8bbwe\\platform-tools\\adb.exe";
const BASE_DIR = "C:\\Users\\eduar\\OneDrive\\Documentos\\Guido\\capturas de tela\\prints";

// ─── ROTEIROS DOS GUIAS ───────────────────────────────────────────────────────
const GUIAS = {

  // ════════════════════════════════════════════════════════
  // YOUTUBE (15 guias)
  // ════════════════════════════════════════════════════════
  youtube: {
    label: "YouTube",
    tarefas: [
      {
        slug: "pesquisar-video-youtube",
        titulo: "Pesquisar um vídeo",
        passos: [
          { title: "Abra o aplicativo YouTube", instruction: "Toque no ícone vermelho do YouTube com o triângulo branco de reproduzir no centro." },
          { title: "Toque na lupa no topo", instruction: "No canto superior direito, toque no desenho de lupa. Se preferir falar em vez de digitar, toque no microfone." },
          { title: "Escolha o vídeo nos resultados", instruction: "Veja a lista de vídeos que apareceram e toque na foto do vídeo que você deseja assistir." },
        ]
      },
      {
        slug: "aumentar-volume-youtube",
        titulo: "Aumentar o volume",
        passos: [
          { title: "Use os botões de volume do celular", instruction: "Aperte o botão de volume para cima na lateral do seu aparelho para deixar o som bem audível." },
          { title: "Toque no vídeo para ver os controles", instruction: "Dê um toque no centro do vídeo. Aparecerão botões brancos na tela." },
          { title: "Toque no quadradinho de tela cheia", instruction: "No cantinho inferior direito do vídeo, toque no pequeno quadrado para deitar a tela e ver em tela inteira." },
        ]
      },
      {
        slug: "salvar-video-youtube",
        titulo: "Salvar vídeo para assistir depois",
        passos: [
          { title: "Toque no vídeo que você gostou", instruction: "Abra o vídeo que você deseja guardar para ver novamente outro dia." },
          { title: "Deslize os botões abaixo do vídeo", instruction: "Abaixo do vídeo, onde tem Curtir e Compartilhar, deslize os botões para o lado até achar 'Salvar'." },
          { title: "Toque em Salvar e escolha a lista", instruction: "Toque em 'Salvar' e selecione 'Assistir mais tarde'. Para achar depois, toque em 'Você' no rodapé do YouTube." },
        ]
      },
      {
        slug: "pausar-e-voltar-video-youtube",
        titulo: "Pausar e voltar cena do vídeo",
        passos: [
          { title: "Dê um toque no centro do vídeo", instruction: "Toque uma vez no meio da tela para fazer os botões de controle aparecerem." },
          { title: "Toque nas duas barrinhas para pausar", instruction: "No centro da tela, toque nas duas barrinhas verticais (||). O vídeo ficará congelado para você fazer o que precisa." },
          { title: "Arraste a bolinha vermelha para voltar", instruction: "Na barra vermelha no rodapé do vídeo, coloque o dedo na bolinha e puxe para a esquerda para voltar a cena." },
        ]
      },
      {
        slug: "pular-anuncios-youtube",
        titulo: "Pular anúncios",
        passos: [
          { title: "Aguarde a contagem de 5 segundos", instruction: "Quando começar a propaganda, repare no canto inferior direito do vídeo a contagem 'Pular em 5, 4, 3...'." },
          { title: "Toque no botão 'Pular anúncio'", instruction: "Assim que a contagem terminar, aparecerá um retângulo cinza escrito 'Pular anúncio'. Dê um toque nele." },
          { title: "Aproveite seu vídeo sem interrupção", instruction: "A propaganda sumirá e o seu vídeo principal começará a tocar imediatamente." },
        ]
      },
      {
        slug: "inscrever-se-canal-youtube",
        titulo: "Inscrever-se em um canal",
        passos: [
          { title: "Localize o nome do canal abaixo do vídeo", instruction: "Olhe logo abaixo da tela do vídeo onde aparece a foto redonda e o nome de quem gravou." },
          { title: "Toque no botão 'Inscrever-se'", instruction: "Toque no botão em formato de pílula (geralmente preto ou branco) escrito 'Inscrever-se'. É 100% gratuito e seguro." },
          { title: "Toque no sininho para receber avisos", instruction: "Toque no desenho de 'Sino' ao lado e escolha 'Todas'. Assim o YouTube avisa quando sair vídeo novo desse criador." },
        ]
      },
      {
        slug: "ativar-legendas-youtube",
        titulo: "Ativar legendas",
        passos: [
          { title: "Toque na tela do vídeo", instruction: "Dê um toque no centro do vídeo enquanto ele estiver tocando para mostrar os botões de controle." },
          { title: "Toque no quadradinho 'CC' no topo", instruction: "No canto superior direito do vídeo, toque no ícone com as duas letras 'CC' (legendas)." },
          { title: "Acompanhe o texto na tela", instruction: "As falas do vídeo começarão a aparecer escritas em letras brancas na parte inferior da tela." },
        ]
      },
      {
        slug: "diminuir-velocidade-video-youtube",
        titulo: "Diminuir velocidade do vídeo",
        passos: [
          { title: "Toque na engrenagem de configurações", instruction: "Dê um toque no vídeo e depois toque no desenho de 'Engrenagem' no canto superior direito." },
          { title: "Toque em 'Velocidade da reprodução'", instruction: "No menu que abrir na parte de baixo da tela, procure e toque em 'Velocidade da reprodução'." },
          { title: "Escolha a velocidade 0.75x", instruction: "Selecione a opção '0.75x' (um pouco mais lenta) para o apresentador falar mais pausado." },
          { title: "Assista com calma", instruction: "O vídeo tocará em ritmo mais devagar, facilitando anotar ingredientes de receitas ou entender explicações." },
        ]
      },
      {
        slug: "ver-historico-videos-youtube",
        titulo: "Ver histórico de vídeos assistidos",
        passos: [
          { title: "Toque na aba 'Você' no rodapé", instruction: "No canto inferior direito da tela do YouTube, toque no círculo com a sua foto ou desenho de pessoa chamado 'Você'." },
          { title: "Localize a seção 'Histórico'", instruction: "No topo dessa tela, você verá a lista de vídeos que você assistiu recentemente." },
          { title: "Toque no vídeo para rever", instruction: "Toque na capa do vídeo que você queria rever. Ele continuará exatamente de onde você parou." },
        ]
      },
      {
        slug: "compartilhar-video-familia-youtube",
        titulo: "Compartilhar vídeo com a família",
        passos: [
          { title: "Olhe os botões abaixo do vídeo", instruction: "Abaixo da tela do vídeo, procure a barra com os botões Curtir, Compartilhar e Salvar." },
          { title: "Toque no botão 'Compartilhar'", instruction: "Toque no botão com o desenho de uma seta curvada escrito 'Compartilhar'." },
          { title: "Toque no ícone do WhatsApp", instruction: "Na janelinha que abrir na parte de baixo, selecione o círculo verde do WhatsApp." },
          { title: "Escolha a pessoa e envie", instruction: "Selecione a conversa ou grupo da família e toque na setinha verde para mandar o link do vídeo." },
        ]
      },
      {
        slug: "assistir-transmissoes-ao-vivo-youtube",
        titulo: "Assistir transmissões ao vivo",
        passos: [
          { title: "Pesquise pelo evento ou missa", instruction: "Na barra de busca do YouTube, digite o nome do canal ou evento (ex: 'Missa ao vivo', 'Jornal ao vivo')." },
          { title: "Procure a tag vermelha 'AO VIVO'", instruction: "Nos resultados, procure os vídeos que têm um selo vermelho escrito 'AO VIVO' na capa." },
          { title: "Toque para assistir em tempo real", instruction: "Dê um toque no vídeo. Você estará acompanhando a cerimônia ou notícia no mesmo instante em que ela acontece." },
        ]
      },
      {
        slug: "melhorar-qualidade-imagem-youtube",
        titulo: "Melhorar qualidade da imagem",
        passos: [
          { title: "Toque na engrenagem no vídeo", instruction: "Dê um toque no centro do vídeo e toque no desenho de 'Engrenagem' no canto superior direito." },
          { title: "Toque em 'Qualidade'", instruction: "No menu inferior, toque na primeira opção: 'Qualidade' (com desenho de engrenagem)." },
          { title: "Escolha 'Qualidade de imagem mais alta'", instruction: "Toque na opção 'Qualidade de imagem mais alta'. O YouTube ajustará o vídeo para a imagem mais bonita e nítida." },
          { title: "Aguarde a imagem clarear", instruction: "Em poucos segundos o vídeo carregará em alta definição com letras e rostos totalmente nítidos." },
        ]
      },
      {
        slug: "desativar-reproducao-automatica-youtube",
        titulo: "Desativar reprodução automática",
        passos: [
          { title: "Abra qualquer vídeo", instruction: "Comece a reproduzir qualquer vídeo no aplicativo YouTube." },
          { title: "Olhe para a parte superior do vídeo", instruction: "Dê um toque na tela e olhe para o topo do vídeo, ao lado da engrenagem." },
          { title: "Desative a chavinha com triângulo", instruction: "Toque na pequena chave com triângulo e duas barrinhas. Ela ficará desligada (com símbolo de pausa), impedindo vídeos seguintes de tocarem sozinhos." },
        ]
      },
      {
        slug: "pesquisar-por-voz-youtube",
        titulo: "Pesquisar por voz",
        passos: [
          { title: "Toque no microfone no topo", instruction: "No canto superior direito da tela inicial do YouTube, toque no desenho de 'Microfone' (ao lado da lupa)." },
          { title: "Permita o uso do microfone se pedir", instruction: "Se o celular perguntar pela primeira vez, toque em 'Permitir' para o YouTube ouvir você." },
          { title: "Fale o que deseja ouvir ou assistir", instruction: "Fale com clareza (ex: 'Músicas antigas dos anos 70', 'Receita de bolo de fubá'). O YouTube buscará na mesma hora." },
        ]
      },
      {
        slug: "criar-lista-musicas-favoritas-youtube",
        titulo: "Criar lista de músicas favoritas",
        passos: [
          { title: "No vídeo da música, toque em 'Salvar'", instruction: "Na barra de botões abaixo do vídeo, procure e toque no botão 'Salvar'." },
          { title: "Toque em 'Nova playlist'", instruction: "Na janelinha que subir no rodapé, toque em 'Nova playlist' com o sinal de Mais (+)." },
          { title: "Digite o nome da sua lista", instruction: "Escreva um nome simples (ex: 'Minhas Músicas') e toque no botão 'Criar'." },
          { title: "Ache sua lista na aba 'Você'", instruction: "Pronto! Sempre que quiser ouvir suas músicas reunidas, toque na aba 'Você' no rodapé do YouTube." },
        ]
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // GOOGLE MAPS (15 guias)
  // ════════════════════════════════════════════════════════
  maps: {
    label: "Google Maps",
    tarefas: [
      {
        slug: "colocar-endereco-maps",
        titulo: "Colocar endereço e iniciar GPS",
        passos: [
          { title: "Abra o Google Maps", instruction: "Toque no ícone do Google Maps (desenho de pino de localização colorido)." },
          { title: "Toque na barra 'Pesquise aqui'", instruction: "Toque na caixa branca no topo da tela. Você pode digitar o nome da rua ou tocar no microfone para falar o nome do local." },
          { title: "Toque em 'Rotas'", instruction: "O mapa encontrará o local. Toque no botão azul 'Rotas' no canto inferior esquerdo para traçar o melhor caminho." },
          { title: "Toque em 'Iniciar' para ouvir o GPS", instruction: "Toque no botão azul 'Iniciar'. O celular começará a falar em voz alta onde você deve virar." },
        ]
      },
      {
        slug: "caminho-onibus-maps",
        titulo: "Ver caminho de ônibus",
        passos: [
          { title: "Pesquise o endereço de destino", instruction: "No Google Maps, digite o endereço para onde você quer ir e toque no botão azul 'Rotas'." },
          { title: "Toque no ícone de Ônibus no topo", instruction: "Na parte de cima da tela, toque no desenho de um 'Ônibus/Trem' (transporte público) entre as opções de carro e a pé." },
          { title: "Veja as linhas de ônibus disponíveis", instruction: "O aplicativo mostrará os números das linhas de ônibus, o horário que ele passa no ponto e o tempo total de viagem." },
          { title: "Toque na linha para ver os pontos", instruction: "Toque no trajeto escolhido para ver onde pegar o ônibus, quantos pontos passar e o nome do ponto onde você deve descer." },
        ]
      },
      {
        slug: "compartilhar-localizacao-maps",
        titulo: "Compartilhar localização",
        passos: [
          { title: "Toque na sua foto de perfil no topo", instruction: "No canto superior direito da tela do Maps, toque no círculo com a sua foto ou inicial." },
          { title: "Toque em 'Compartilhar local'", instruction: "No menu que abrir, toque na opção 'Compartilhar local' (ícone com desenho de pessoa e sinal de ondas)." },
          { title: "Escolha o tempo de compartilhamento", instruction: "Escolha se quer compartilhar por 1 hora ou até você desativar manualmente." },
          { title: "Envie para o familiar no WhatsApp", instruction: "Selecione o contato da sua família para mandar o link seguro. Eles poderão ver onde você está andando no mapa." },
        ]
      },
      {
        slug: "salvar-endereco-casa-maps",
        titulo: "Salvar endereço de casa",
        passos: [
          { title: "Toque na aba 'Salvos' no rodapé", instruction: "No rodapé do Google Maps, toque no ícone de bandeirinha chamado 'Salvos'." },
          { title: "Toque em 'Marcados' e escolha 'Casa'", instruction: "Na parte superior da tela de salvos, toque em 'Marcados' e depois toque na linha escrita 'Casa'." },
          { title: "Digite o endereço da sua residência", instruction: "Digite a sua rua, número, bairro e cidade e selecione o resultado correspondente." },
          { title: "Toque em 'Salvar'", instruction: "Pronto! Sempre que estiver na rua, basta falar no microfone 'Ir para casa' para o GPS te guiar de volta sem digitar nada." },
        ]
      },
      {
        slug: "encontrar-farmacia-hospital-maps",
        titulo: "Encontrar farmácia ou hospital",
        passos: [
          { title: "Olhe a barra de categorias abaixo da busca", instruction: "Na tela inicial do Maps, logo abaixo da barra branca de pesquisa, deslize os botões redondos para o lado." },
          { title: "Toque em 'Farmácias' ou 'Hospitais'", instruction: "Toque no botão com desenho de cruz vermelha escrito 'Farmácias' ou 'Hospitais'." },
          { title: "Veja a lista por ordem de proximidade", instruction: "O mapa mostrará os locais mais perto de onde você está, indicando se estão abertos agora e com botão para ligar." },
        ]
      },
      {
        slug: "ver-foto-da-fachada-streetview-maps",
        titulo: "Ver foto da fachada (Street View)",
        passos: [
          { title: "Pesquise o endereço que deseja conhecer", instruction: "Digite o endereço da consulta médica ou casa de amigo na barra de pesquisa do Maps." },
          { title: "Olhe para o quadradinho com foto no rodapé", instruction: "No canto inferior esquerdo, toque na foto pequena que tem uma seta circular branca no meio." },
          { title: "Gire a imagem com o dedo em 360 graus", instruction: "A tela mostrará a foto real da rua como se você estivesse lá na calçada. Deslize o dedo para os lados para ver a vizinhança." },
        ]
      },
      {
        slug: "saber-se-transito-parado-maps",
        titulo: "Verificar trânsito",
        passos: [
          { title: "Traçe a sua rota no mapa", instruction: "Coloque o destino desejado e toque no botão azul 'Rotas'." },
          { title: "Observe as cores da linha do trajeto", instruction: "Olhe para a linha da rota: linha azul significa trânsito livre; linha laranja significa trânsito lento; linha vermelha é engarrafamento." },
          { title: "Escolha a rota mais rápida", instruction: "Se a rota principal estiver muito vermelha, toque na linha cinza alternativa para ir por um caminho sem trânsito." },
        ]
      },
      {
        slug: "baixar-mapa-sem-internet-maps",
        titulo: "Baixar mapa para usar sem internet",
        passos: [
          { title: "Toque na sua foto de perfil", instruction: "No canto superior direito da tela do Maps, toque no círculo com a sua foto." },
          { title: "Toque em 'Mapas off-line'", instruction: "No menu suspenso, procure e toque na opção 'Mapas off-line' (com desenho de mapa cortado)." },
          { title: "Toque em 'Selecione seu próprio mapa'", instruction: "Enquadre o retângulo azul em cima da sua cidade ou do trajeto da sua viagem." },
          { title: "Toque em 'Download'", instruction: "Toque no botão azul 'Download'. O mapa ficará gravado no seu celular e funcionará mesmo se acabar a internet na rua." },
        ]
      },
      {
        slug: "ver-horario-funcionamento-maps",
        titulo: "Ver horário de funcionamento",
        passos: [
          { title: "Pesquise o comércio ou consultório", instruction: "Digite o nome da clínica, cartório ou supermercado na barra de busca." },
          { title: "Arraste o painel branco para cima", instruction: "Coloque o dedo no painel inferior e puxe para cima para ler as informações completas." },
          { title: "Olhe a linha 'Horário de funcionamento'", instruction: "Veja se diz em verde 'Aberto agora' ou em vermelho 'Fechado'. Dê um toque para ver o horário que fecha hoje." },
        ]
      },
      {
        slug: "medir-distancia-tempo-maps",
        titulo: "Medir distância e tempo de viagem",
        passos: [
          { title: "Pesquise o endereço de destino", instruction: "Digite para onde você vai e toque no botão azul 'Rotas'." },
          { title: "Olhe para a faixa verde ou azul no rodapé", instruction: "No rodapé da tela, o Maps mostra em letras grandes: os minutos de viagem e a distância em quilômetros (ex: '25 min (12 km)')." },
          { title: "Veja a hora de chegada", instruction: "Logo ao lado, você verá o horário exato em que vai chegar ao local se sair agora." },
        ]
      },
      {
        slug: "adicionar-parada-caminho-maps",
        titulo: "Adicionar parada no caminho",
        passos: [
          { title: "Com o GPS já navegando, olhe o canto da tela", instruction: "Durante a navegação com o mapa aberto, toque no desenho de 'Lupa' no canto superior direito." },
          { title: "Escolha o que precisa achar no caminho", instruction: "Toque em 'Postos de gasolina', 'Restaurantes' ou digite o nome de uma padaria no caminho." },
          { title: "Toque no local escolhido", instruction: "O mapa mostrará os locais que ficam exatamente na sua estrada e quantos minutos a mais vai demorar." },
          { title: "Toque em 'Adicionar parada'", instruction: "Toque no botão verde 'Adicionar parada'. O GPS te levará primeiro até lá e depois retomará o destino final." },
        ]
      },
      {
        slug: "evitar-pedagios-maps",
        titulo: "Evitar pedágios na rota",
        passos: [
          { title: "Trace a rota para a sua viagem", instruction: "Pesquise a cidade de destino e toque no botão 'Rotas'." },
          { title: "Toque nos três pontinhos no topo direito", instruction: "No canto superior direito (ao lado de onde você digita o destino), toque nos três pontinhos verticais." },
          { title: "Toque em 'Opções de trajeto'", instruction: "No menu de opções, toque em 'Opções de trajeto' ou 'Opções'." },
          { title: "Marque a caixa 'Evitar pedágios'", instruction: "Marque a caixinha 'Evitar pedágios' e toque em Concluir. O mapa recalculará a rota usando apenas rodovias gratuitas." },
        ]
      },
      {
        slug: "salvar-onde-estacionou-maps",
        titulo: "Salvar onde estacionou o carro",
        passos: [
          { title: "Ao estacionar o carro, abra o Maps", instruction: "Com o carro já parado na vaga, abra o aplicativo Google Maps." },
          { title: "Dê um toque na bolinha azul no mapa", instruction: "Toque bem em cima do ponto azul que representa onde você está agora." },
          { title: "Toque em 'Salvar local de estacionamento'", instruction: "No menu azul que abrir, toque em 'Salvar estacionamento'. Uma letra 'P' amarela ficará marcada no mapa para você achar a vaga na volta." },
        ]
      },
      {
        slug: "ver-caminho-a-pe-maps",
        titulo: "Ver caminho a pé",
        passos: [
          { title: "Pesquise o destino e toque em 'Rotas'", instruction: "Coloque o endereço para onde você vai e toque no botão azul 'Rotas'." },
          { title: "Toque no ícone da pessoa caminhando", instruction: "Na barra superior de transportes, toque no desenho de uma 'Pessoa andando a pé'." },
          { title: "Siga as linhas pontilhadas azuis", instruction: "Toque em 'Iniciar'. O mapa mostrará o trajeto mais plano e seguro pelas calçadas para caminhar com tranquilidade." },
        ]
      },
      {
        slug: "conferir-avaliacoes-comentarios-maps",
        titulo: "Conferir avaliações de um local",
        passos: [
          { title: "Pesquise o comércio, consultório ou cartório", instruction: "Digite o nome do estabelecimento na barra de busca do Maps." },
          { title: "Arraste a tela e toque na aba 'Avaliações'", instruction: "Puxe a ficha para cima e toque na aba 'Avaliações' (ao lado de Visão geral)." },
          { title: "Leia a opinião de outros clientes", instruction: "Role para baixo para ler os comentários reais deixados por outras pessoas sobre a limpeza, atendimento e fila do local." },
        ]
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // UBER (15 guias)
  // ════════════════════════════════════════════════════════
  uber: {
    label: "Uber",
    tarefas: [
      {
        slug: "pedir-carro-uber",
        titulo: "Pedir um carro",
        passos: [
          { title: "Abra o aplicativo Uber", instruction: "Toque no ícone preto com o nome 'Uber' na tela do seu celular." },
          { title: "Toque na caixa 'Para onde?'", instruction: "No meio da tela, toque na barra de pesquisa 'Para onde?' e digite o endereço completo do local aonde você vai." },
          { title: "Escolha a opção UberX e veja o preço", instruction: "O aplicativo mostrará as opções. O 'UberX' é o carro comum com o valor mais econômico. Confira o preço na tela." },
          { title: "Toque em 'Confirmar UberX'", instruction: "Toque no botão preto 'Confirmar UberX' no rodapé. O sistema começará a procurar um motorista perto de você." },
        ]
      },
      {
        slug: "acompanhar-motorista-uber",
        titulo: "Acompanhar o motorista no mapa",
        passos: [
          { title: "Veja a foto e o nome do motorista", instruction: "Assim que um motorista aceitar a viagem, a tela mostrará o nome dele, a foto e a nota de avaliação." },
          { title: "DECORE A PLACA E A COR DO CARRO", instruction: "Olhe com muita atenção para as 7 letras e números da PLACA, o modelo do carro e a cor indicados na tela." },
          { title: "Acompanhe o carrinho no mapa", instruction: "A tela mostra onde o carro está e quantos minutos faltam para ele parar no seu local de embarque." },
          { title: "Confira a placa e embarque", instruction: "Quando o carro parar, vá até a traseira do veículo, leia a placa e pergunte: 'Qual o seu nome?'. Se estiver correto, embarque com tranquilidade." },
        ]
      },
      {
        slug: "pagar-uber-dinheiro-cartao",
        titulo: "Pagar em dinheiro ou cartão",
        passos: [
          { title: "Antes de pedir, olhe o rodapé da tela", instruction: "Na tela onde você escolhe o carro UberX, olhe para a linha logo acima do botão preto de confirmação." },
          { title: "Toque na forma de pagamento atual", instruction: "Toque no símbolo do cartão ou dinheiro que estiver aparecendo para abrir as opções de pagamento." },
          { title: "Escolha Dinheiro ou Cartão cadastrado", instruction: "Selecione 'Dinheiro' se quiser pagar em cédulas ao motorista no final da corrida, ou 'Cartão' para pagar direto no app." },
        ]
      },
      {
        slug: "cancelar-viagem-uber",
        titulo: "Cancelar uma viagem",
        passos: [
          { title: "Deslize o painel inferior para cima", instruction: "Na tela com o motorista a caminho, arraste com o dedo o cartão inferior para cima para ver mais opções." },
          { title: "Toque no botão 'Cancelar viagem'", instruction: "Procure e toque no botão vermelho escrito 'Cancelar viagem'." },
          { title: "Confirme o cancelamento", instruction: "Toque em 'Sim, cancelar'. A corrida será cancelada imediatamente sem custo nos primeiros minutos." },
        ]
      },
      {
        slug: "compartilhar-viagem-familia-uber",
        titulo: "Compartilhar viagem com a família",
        passos: [
          { title: "Durante a viagem, olhe a tela", instruction: "Com a corrida em andamento, procure o botão 'Compartilhar status da viagem'." },
          { title: "Toque no ícone do WhatsApp", instruction: "Selecione o WhatsApp na lista de aplicativos para enviar o link seguro." },
          { title: "Envie para os filhos ou parentes", instruction: "Selecione o contato da família e envie. Eles verão o carro andando no mapa em tempo real até você chegar." },
        ]
      },
      {
        slug: "mandar-mensagem-motorista-uber",
        titulo: "Mandar mensagem para o motorista",
        passos: [
          { title: "Toque no ícone de balão de mensagem", instruction: "Na parte de baixo da tela, ao lado da foto do motorista, toque no desenho de balãozinho de conversa." },
          { title: "Digite o ponto de referência", instruction: "Escreva onde você está esperando (ex: 'Estou com camisa azul em frente ao portão')." },
          { title: "Toque na setinha para enviar", instruction: "Toque no botão de envio. O motorista lerá o recado sem precisar saber o seu número pessoal de telefone." },
        ]
      },
      {
        slug: "ligar-para-motorista-uber",
        titulo: "Ligar para o motorista",
        passos: [
          { title: "Toque no ícone de telefone", instruction: "Ao lado da foto do motorista na tela, toque no desenho de fone de telefone." },
          { title: "Escolha 'Ligação gratuita pelo app'", instruction: "Selecione a opção de ligação gratuita pela internet. O aplicativo conectará sem revelar seu número." },
          { title: "Converse e combine o embarque", instruction: "Explique onde você está aguardando com calma e desligue no botão vermelho ao terminar." },
        ]
      },
      {
        slug: "adicionar-parada-uber",
        titulo: "Adicionar parada na viagem",
        passos: [
          { title: "Na tela de digitar destino, olhe o sinal Mais (+)", instruction: "Ao digitar para onde vai, olhe para o lado direito da caixa de endereço e toque no sinal de '+'." },
          { title: "Digite o endereço da parada", instruction: "Digite o endereço do local intermediário onde deseja parar primeiro (ex: padaria, farmácia)." },
          { title: "Toque em Pronto", instruction: "Toque no botão preto 'Pronto'. O aplicativo recalculará a rota passando pelos dois lugares." },
          { title: "Confirme o valor e peça a viagem", instruction: "Confira o preço total das paradas e toque em 'Confirmar' para chamar o carro." },
        ]
      },
      {
        slug: "avaliar-motorista-elogio-uber",
        titulo: "Avaliar o motorista",
        passos: [
          { title: "Ao sair do carro, olhe a tela", instruction: "Assim que a viagem terminar, o aplicativo abrirá a tela 'Como foi sua viagem com [Nome]?' com 5 estrelas." },
          { title: "Toque na quinta estrela", instruction: "Se a viagem foi calma e segura, toque na última estrela da direita para dar a nota máxima de 5 estrelas." },
          { title: "Deixe um elogio e conclua", instruction: "Toque em 'Excelente conversa' ou 'Carro limpo' e toque em Concluir para agradecer ao motorista." },
        ]
      },
      {
        slug: "informar-objeto-esquecido-uber",
        titulo: "Informar objeto esquecido",
        passos: [
          { title: "Toque na aba 'Atividade' no rodapé", instruction: "No rodapé do aplicativo Uber, toque no ícone de relógio escrito 'Atividade'." },
          { title: "Toque na viagem em que perdeu o item", instruction: "Selecione a viagem recente onde você esqueceu seu pertence." },
          { title: "Toque em 'Encontrar item perdido'", instruction: "Role para baixo nas opções de ajuda e toque em 'Encontrar item perdido'." },
          { title: "Fale com o motorista para combinar devolução", instruction: "Digite seu telefone para o Uber ligar para você e colocar você em contato com o motorista para devolver o item." },
        ]
      },
      {
        slug: "pedir-carro-para-outra-pessoa-uber",
        titulo: "Pedir carro para outra pessoa",
        passos: [
          { title: "Toque na barra 'Para onde?'", instruction: "Abra o aplicativo e dê um toque na caixa de pesquisa de endereço." },
          { title: "Toque em 'Para mim' no topo", instruction: "No alto da tela, toque onde diz 'Para mim' e selecione 'Adicionar passageiro'." },
          { title: "Escolha o contato do familiar", instruction: "Selecione o contato da pessoa para quem você está pedindo o carro na sua agenda." },
          { title: "Coloque o endereço e chame", instruction: "Coloque onde ela está e para onde vai. Ela receberá um SMS no celular dela com os dados da placa e do motorista." },
        ]
      },
      {
        slug: "usar-botao-seguranca-uber",
        titulo: "Usar o botão de segurança",
        passos: [
          { title: "Durante a viagem, procure o escudo azul", instruction: "Olhe para o mapa durante a corrida: há um pequeno círculo com um desenho de 'Escudo azul'." },
          { title: "Dê um toque no escudo azul", instruction: "O aplicativo abrirá o painel 'Recursos de segurança da Uber'." },
          { title: "Acesse ajuda rápida ou ligue 190", instruction: "Você pode compartilhar a rota com familiares ou tocar em 'Ligar para a polícia (190)' em caso de emergência real." },
        ]
      },
      {
        slug: "cadastrar-cartao-credito-uber",
        titulo: "Cadastrar cartão de crédito",
        passos: [
          { title: "Toque na aba 'Conta' no rodapé", instruction: "No canto inferior direito do aplicativo, toque no ícone de pessoa escrito 'Conta'." },
          { title: "Toque em 'Carteira' ou 'Pagamento'", instruction: "Procure e toque na opção 'Carteira' ou 'Formas de pagamento'." },
          { title: "Toque em 'Adicionar forma de pagamento'", instruction: "Toque no botão com sinal de Mais (+) e selecione 'Cartão de crédito ou débito'." },
          { title: "Digite os dados do cartão e salve", instruction: "Informe o número do cartão, a data de validade e o código de 3 dígitos atrás do cartão. Toque em 'Salvar'." },
        ]
      },
      {
        slug: "ver-recibo-historico-uber",
        titulo: "Ver recibo de viagem passada",
        passos: [
          { title: "Toque na aba 'Atividade' no rodapé", instruction: "No rodapé do Uber, toque no ícone de relógio chamado 'Atividade'." },
          { title: "Toque na viagem que deseja consultar", instruction: "Veja a lista com todas as suas corridas passadas com a data e valor. Toque na que você quer examinar." },
          { title: "Veja o recibo detalhado", instruction: "A tela mostrará o mapa do trajeto percorrido, o nome do motorista e o recibo com o valor exato cobrado." },
        ]
      },
      {
        slug: "consultar-sua-nota-passageiro-uber",
        titulo: "Consultar sua nota de passageiro",
        passos: [
          { title: "Toque na aba 'Conta' no rodapé", instruction: "No canto inferior direito do Uber, dê um toque no menu 'Conta'." },
          { title: "Olhe logo abaixo do seu nome", instruction: "Na parte de cima da tela, logo abaixo do seu nome, você verá uma estrela dourada com um número (ex: 4.95)." },
          { title: "Toque na sua nota para ver detalhes", instruction: "Ao tocar na sua nota, você poderá ver quantos motoristas deram 5 estrelas para você nas suas viagens." },
        ]
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // GOOGLE FOTOS (15 guias)
  // ════════════════════════════════════════════════════════
  "google-fotos": {
    label: "Google Fotos",
    tarefas: [
      {
        slug: "encontrar-fotos-antigas",
        titulo: "Encontrar fotos antigas",
        passos: [
          { title: "Abra o aplicativo Google Fotos", instruction: "Toque no ícone do Google Fotos (desenho de catavento com pétalas coloridas)." },
          { title: "Role a tela para cima com o dedo", instruction: "Passe o dedo na tela de baixo para cima. Você verá os meses e os anos das fotos passando no canto direito." },
          { title: "Toque na foto para abrir grande", instruction: "Ao achar a foto que queria, dê um toque nela. Ela vai abrir ocupando a tela inteira com nitidez." },
        ]
      },
      {
        slug: "compartilhar-fotos-galeria",
        titulo: "Compartilhar foto com amigos",
        passos: [
          { title: "Abra a foto que você quer enviar", instruction: "No Google Fotos, toque na imagem que você quer mostrar para seus amigos ou família." },
          { title: "Toque no botão 'Compartilhar'", instruction: "No rodapé da tela, toque no primeiro botão à esquerda: 'Compartilhar' (ícone de seta ou ramos)." },
          { title: "Escolha o aplicativo ou contato", instruction: "Na janelinha que abrir na parte de baixo, escolha o aplicativo de mensagens ou toque no contato desejado." },
          { title: "Confirme e envie", instruction: "Confira o nome da pessoa que vai receber a foto e confirme o envio." },
        ]
      },
      {
        slug: "liberar-espaco-fotos",
        titulo: "Liberar espaço no celular",
        passos: [
          { title: "Toque na sua foto de perfil no topo", instruction: "No canto superior direito do Google Fotos, toque no círculo com a sua foto ou com a inicial do seu nome." },
          { title: "Toque em 'Liberar espaço'", instruction: "Procure e toque no botão 'Liberar espaço neste dispositivo' (ícone de lixeira ou vassourinha)." },
          { title: "Confira a quantidade de espaço", instruction: "O aplicativo mostrará quanto espaço você vai economizar sem perder nada que já foi salvo na nuvem." },
          { title: "Toque no botão azul 'Liberar'", instruction: "Confirme tocando no botão azul. O celular apagará apenas as cópias locais, mantendo tudo salvo para sempre na internet." },
        ]
      },
      {
        slug: "criar-album-fotos",
        titulo: "Criar álbum de fotos",
        passos: [
          { title: "Toque na aba 'Biblioteca' ou 'Coleções'", instruction: "No rodapé do Google Fotos, toque na aba 'Biblioteca' ou 'Coleções' (ícone de pastas)." },
          { title: "Toque no botão 'Novo álbum'", instruction: "Toque no cartão com o sinal de Mais (+) escrito 'Novo álbum'." },
          { title: "Digite o título do álbum", instruction: "Escreva o nome do álbum (ex: 'Netos', 'Aniversário 70 Anos', 'Viagem à Praia')." },
          { title: "Selecione as fotos e toque em Concluir", instruction: "Toque no botão 'Adicionar fotos', marque as fotos desejadas e toque em 'Concluir' no canto superior direito." },
        ]
      },
      {
        slug: "apagar-fotos-borradas-fotos",
        titulo: "Apagar fotos borradas",
        passos: [
          { title: "Abra a foto que ficou ruim", instruction: "Dê um toque na foto tremida, escura ou repetida para ela abrir na tela." },
          { title: "Toque no ícone de lixeira no rodapé", instruction: "No canto inferior direito, toque no desenho de 'Lixeira' (Excluir)." },
          { title: "Toque em 'Mover para a lixeira'", instruction: "Confirme tocando no botão azul 'Mover para a lixeira'. A foto ruim sairá da sua galeria." },
        ]
      },
      {
        slug: "recuperar-fotos-lixeira-fotos",
        titulo: "Recuperar foto da lixeira",
        passos: [
          { title: "Abra a aba 'Biblioteca' ou 'Coleções'", instruction: "No rodapé do Google Fotos, toque na aba 'Biblioteca' ou 'Coleções'." },
          { title: "Toque na pasta 'Lixeira'", instruction: "Na parte de cima da tela, procure e abra a pasta chamada 'Lixeira'." },
          { title: "Segure o dedo sobre a foto apagada", instruction: "Procure a foto que você apagou por engano e aperte e segure o dedo sobre ela para selecionar." },
          { title: "Toque em 'Restaurar'", instruction: "No rodapé da tela, toque no botão 'Restaurar'. A foto voltará imediatamente para a sua galeria principal." },
        ]
      },
      {
        slug: "favoritar-fotos-fotos",
        titulo: "Favoritar fotos especiais",
        passos: [
          { title: "Abra a foto que você mais gostou", instruction: "Dê um toque na foto especial para abri-la em tamanho grande." },
          { title: "Toque na estrelinha no topo da tela", instruction: "No topo superior direito, toque no desenho de 'Estrela' vazia. Ela ficará toda preenchida de branco." },
          { title: "Ache na pasta Favoritos", instruction: "Pronto! Todas as fotos favoritadas ficam reunidas na pasta 'Favoritos' na aba Biblioteca para você mostrar aos amigos." },
        ]
      },
      {
        slug: "procurar-fotos-pessoas-fotos",
        titulo: "Procurar fotos de uma pessoa",
        passos: [
          { title: "Toque na aba 'Pesquisar' no rodapé", instruction: "No rodapé do aplicativo, toque no ícone de lupa escrito 'Pesquisar'." },
          { title: "Olhe a seção 'Pessoas e animais'", instruction: "Na parte de cima da tela de pesquisa, você verá círculos com os rostos dos seus familiares." },
          { title: "Toque no rosto da pessoa", instruction: "Dê um toque no rosto do seu filho ou neto. O aplicativo mostrará todas as fotos onde ele aparece desde pequeno." },
        ]
      },
      {
        slug: "cortar-clarear-foto-fotos",
        titulo: "Cortar e clarear foto",
        passos: [
          { title: "Abra a foto que deseja melhorar", instruction: "Toque na foto que está escura ou com bordas indesejadas." },
          { title: "Toque no botão 'Editar'", instruction: "No rodapé da tela, toque no botão 'Editar' (ícone com três barrinhas de ajuste)." },
          { title: "Ajuste o corte ou o brilho", instruction: "Toque em 'Cortar' para enquadrar melhor ou toque em 'Ajustar' > 'Brilho' para clarear a imagem." },
          { title: "Toque em 'Salvar cópia'", instruction: "No canto inferior direito, toque no botão azul 'Salvar cópia'. O Google Fotos manterá a original e a nova ajustada." },
        ]
      },
      {
        slug: "baixar-foto-da-nuvem-fotos",
        titulo: "Baixar foto para o celular",
        passos: [
          { title: "Abra a foto desejada", instruction: "Dê um toque na fotografia para vê-la em tamanho grande." },
          { title: "Toque nos três pontinhos no topo direito", instruction: "No canto superior direito da tela, toque nos três pontinhos verticais." },
          { title: "Toque em 'Fazer download'", instruction: "No menu de ações, toque em 'Fazer download'. Uma cópia da foto será gravada direto na memória do celular." },
        ]
      },
      {
        slug: "enviar-varias-fotos-fotos",
        titulo: "Enviar várias fotos de uma vez",
        passos: [
          { title: "Segure o dedo sobre a primeira foto", instruction: "Na galeria, segure o dedo por 2 segundos na primeira foto até ela ficar com uma bolinha azul de verificado." },
          { title: "Dê um toque nas outras fotos", instruction: "Agora basta dar um toque em cada uma das outras fotos que você também deseja mandar juntas." },
          { title: "Toque no botão 'Compartilhar'", instruction: "No canto superior esquerdo ou rodapé, toque no ícone de 'Compartilhar'." },
          { title: "Escolha o contato e envie", instruction: "Selecione o aplicativo de mensagens e o amigo que vai receber todas as fotos selecionadas de uma vez." },
        ]
      },
      {
        slug: "criar-colagem-fotos",
        titulo: "Criar colagem de fotos",
        passos: [
          { title: "Toque na aba 'Biblioteca' ou 'Coleções'", instruction: "No rodapé do Fotos, toque em 'Biblioteca' ou 'Coleções'." },
          { title: "Toque em 'Utilitários' e 'Colagem'", instruction: "Procure e toque no botão 'Colagem' (ícone com quadradinhos divididos)." },
          { title: "Escolha de 2 a 6 fotos", instruction: "Dê um toque nas fotos daquele momento especial que você quer colocar lado a lado." },
          { title: "Toque em 'Criar' no topo", instruction: "Toque no botão 'Criar' no canto superior direito. O aplicativo gerará a colagem pronta para você salvar ou compartilhar." },
        ]
      },
      {
        slug: "conferir-backup-ativado-fotos",
        titulo: "Conferir se backup está ativado",
        passos: [
          { title: "Toque na sua foto de perfil", instruction: "No canto superior direito da tela inicial do Fotos, dê um toque na sua foto ou inicial de perfil." },
          { title: "Olhe o aviso de status do backup", instruction: "Veja o texto logo abaixo do seu nome: se estiver escrito 'Backup concluído' com uma nuvem verde, está tudo protegido." },
          { title: "Ative se estiver desativado", instruction: "Se disser 'O backup está desativado', basta dar um toque para ativar e garantir que nenhuma foto se perca." },
        ]
      },
      {
        slug: "ver-detalhes-data-local-fotos",
        titulo: "Ver data e local da foto",
        passos: [
          { title: "Abra a foto desejada", instruction: "Toque na fotografia para abri-la em tela cheia." },
          { title: "Deslize o dedo de baixo para cima", instruction: "Passe o dedo na tela de baixo para cima como se estivesse empurrando a foto para cima." },
          { title: "Confira a data e o mapa", instruction: "Você verá o dia da semana, o ano em que foi tirada e um mapinha mostrando a cidade e o bairro onde você estava." },
        ]
      },
      {
        slug: "compartilhar-album-familia-fotos",
        titulo: "Compartilhar álbum com a família",
        passos: [
          { title: "Abra o álbum de fotos criado", instruction: "Na aba Biblioteca, toque no álbum que você montou para a família." },
          { title: "Toque no botão 'Compartilhar'", instruction: "No topo do álbum, toque no botão 'Compartilhar' (ícone de pessoa ou ramos de envio)." },
          { title: "Convide os familiares", instruction: "Selecione o contato dos seus filhos ou netos ou toque em 'Criar link' para mandar no WhatsApp." },
          { title: "Envie e acompanhem juntos", instruction: "Todos que receberem poderão ver as fotos do álbum e também adicionar fotos novas da família." },
        ]
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // GMAIL (15 guias)
  // ════════════════════════════════════════════════════════
  gmail: {
    label: "Gmail",
    tarefas: [
      {
        slug: "ler-emails-gmail",
        titulo: "Ler e-mails recebidos",
        passos: [
          { title: "Abra o aplicativo Gmail", instruction: "Procure o aplicativo com desenho de envelope vermelho e branco e toque para abrir." },
          { title: "Toque no e-mail que deseja ler", instruction: "Na sua 'Caixa de entrada', os e-mails mais recentes ficam no topo. Toque na linha do e-mail que você quer abrir." },
          { title: "Leia a mensagem com calma", instruction: "O texto do e-mail abrirá na tela inteira. Para voltar à lista principal, toque na setinha de voltar no topo esquerdo." },
        ]
      },
      {
        slug: "enviar-email-gmail",
        titulo: "Enviar um e-mail",
        passos: [
          { title: "Toque no botão 'Escrever'", instruction: "No canto inferior direito do aplicativo Gmail, toque no botão oval 'Escrever' (com desenho de caneta)." },
          { title: "Preencha para quem vai a mensagem", instruction: "No campo 'Para', digite o endereço de e-mail da pessoa. No campo 'Assunto', escreva um resumo do motivo do contato." },
          { title: "Escreva o texto da sua mensagem", instruction: "Toque na área grande em branco abaixo do assunto e digite sua mensagem com calma pelo teclado." },
          { title: "Toque no aviãozinho azul para enviar", instruction: "No canto superior direito, toque no ícone em forma de triângulo/aviãozinho azul para disparar a mensagem." },
        ]
      },
      {
        slug: "recuperar-senha-gmail",
        titulo: "Recuperar senha esquecida",
        passos: [
          { title: "Toque em 'Esqueceu a senha?'", instruction: "Na tela de login do Google, digite o seu endereço de e-mail e toque no texto azul 'Esqueceu a senha?'." },
          { title: "Escolha confirmação por SMS no celular", instruction: "Selecione a opção para receber um código de segurança por mensagem de texto (SMS) no seu número de telefone." },
          { title: "Digite o código recebido", instruction: "Abra a mensagem SMS recebida, veja os 6 números do código Google e digite-os na tela do aplicativo." },
          { title: "Cadastre uma nova senha forte", instruction: "Crie uma nova senha, anote em seu caderno particular de anotações em casa e toque em 'Salvar senha'." },
        ]
      },
      {
        slug: "responder-email-gmail",
        titulo: "Responder um e-mail",
        passos: [
          { title: "Abra o e-mail que recebeu", instruction: "Toque na mensagem que você quer responder para abri-la na tela inteira." },
          { title: "Toque em Responder no rodapé", instruction: "Role até o final do e-mail e toque no botão 'Responder' (ícone de seta virada para a esquerda)." },
          { title: "Digite sua resposta e envie", instruction: "Escreva seu texto e toque no aviãozinho azul no canto superior direito para mandar a resposta." },
        ]
      },
      {
        slug: "anexar-foto-documento-gmail",
        titulo: "Anexar foto ou documento",
        passos: [
          { title: "Ao escrever o e-mail, olhe o topo", instruction: "Com a tela de escrever e-mail aberta, olhe para a barra no canto superior direito." },
          { title: "Toque no ícone de clipe de papel", instruction: "Toque no desenho de 'Clipe de papel' e selecione a opção 'Anexar arquivo'." },
          { title: "Escolha o arquivo no celular", instruction: "Toque na foto ou documento em PDF salvo no seu celular que deseja enviar junto." },
          { title: "Confira e envie", instruction: "Veja o arquivo carregado na parte de baixo do e-mail e toque no aviãozinho azul para enviar." },
        ]
      },
      {
        slug: "baixar-anexo-gmail",
        titulo: "Baixar arquivo anexado",
        passos: [
          { title: "Abra o e-mail com o arquivo", instruction: "Toque na mensagem que tem o anexo que você precisa baixar." },
          { title: "Role até o final do e-mail", instruction: "Desça a tela até encontrar o retângulo com a prévia do arquivo ou foto." },
          { title: "Toque na setinha para baixo", instruction: "Toque no ícone de 'Seta apontando para baixo' (Download). O arquivo será salvo na pasta Downloads do seu celular." },
        ]
      },
      {
        slug: "apagar-emails-lixeira-gmail",
        titulo: "Apagar e-mails indesejados",
        passos: [
          { title: "Segure o dedo sobre o e-mail", instruction: "Na caixa de entrada, aperte e segure o dedo por 2 segundos na mensagem que quer apagar até aparecer uma marquinha de seleção." },
          { title: "Toque na lixeira no topo", instruction: "Olhe para a parte superior da tela e toque no desenho de 'Lixeira'." },
          { title: "Confira a exclusão", instruction: "A mensagem sumirá da caixa de entrada e irá para a lixeira. Uma tarja preta confirmará que foi excluído." },
        ]
      },
      {
        slug: "favoritar-email-estrela-gmail",
        titulo: "Favoritar e-mail com estrela",
        passos: [
          { title: "Localize o e-mail importante", instruction: "Na lista de e-mails, procure o recado ou recibo que você não quer perder de vista." },
          { title: "Toque na estrelinha ao lado da mensagem", instruction: "No cantinho direito da linha do e-mail, toque no desenho de estrela. Ela ficará toda amarela/dourada." },
          { title: "Ache na pasta Com Estrela", instruction: "Quando quiser achar essas mensagens, toque nas três barrinhas no topo esquerdo e escolha 'Com estrela'." },
        ]
      },
      {
        slug: "pesquisar-email-antigo-gmail",
        titulo: "Pesquisar e-mail antigo",
        passos: [
          { title: "Toque na barra 'Pesquisar no e-mail'", instruction: "No topo do aplicativo, toque dentro da barra branca de pesquisa." },
          { title: "Digite o nome da pessoa ou empresa", instruction: "Digite o assunto que procura (ex: 'Exame', 'Boleto', 'Maria') e toque na lupa do teclado." },
          { title: "Toque no e-mail encontrado", instruction: "O aplicativo mostrará apenas as mensagens que têm aquela palavra. Toque na mensagem para ler." },
        ]
      },
      {
        slug: "identificar-golpe-email-gmail",
        titulo: "Identificar golpe por e-mail",
        passos: [
          { title: "Desconfie de pedidos de dinheiro ou prêmios", instruction: "Se receber e-mail dizendo que você ganhou um prêmio que não concorreu ou que sua conta bancária foi bloqueada, PARE." },
          { title: "Olhe quem é o remetente real", instruction: "Toque no nome de quem mandou para ver o endereço de e-mail completo. Se tiver letras e números estranhos, é golpe." },
          { title: "NUNCA clique em botões ou links azuis", instruction: "Não aperte botões como 'Clique aqui para atualizar' ou 'Baixar fatura'. Eles levam para páginas falsas." },
          { title: "Toque nos três pontinhos e Denuncie Spam", instruction: "No topo direito do e-mail, toque nos três pontinhos e selecione 'Denunciar spam' para bloquear o golpista." },
        ]
      },
      {
        slug: "esvaziar-lixeira-gmail",
        titulo: "Esvaziar lixeira do e-mail",
        passos: [
          { title: "Abra o menu lateral", instruction: "No topo esquerdo do Gmail, toque no ícone de três barrinhas horizontais." },
          { title: "Toque na pasta 'Lixeira'", instruction: "Role a lista para baixo e toque na opção 'Lixeira' (ícone de lata de lixo)." },
          { title: "Toque em 'Esvaziar lixeira agora'", instruction: "No topo das mensagens descartadas, toque no texto azul 'Esvaziar lixeira agora'." },
          { title: "Confirme a limpeza", instruction: "Toque em 'Esvaziar' na confirmação. Todo o espaço ocupado por e-mails velhos será liberado na sua conta." },
        ]
      },
      {
        slug: "cancelar-envio-email-gmail",
        titulo: "Cancelar envio de e-mail",
        passos: [
          { title: "Logo após enviar, olhe para o rodapé", instruction: "Assim que tocar no botão de envio do e-mail, olhe imediatamente para a parte de baixo da tela." },
          { title: "Toque rapidamente em 'Desfazer'", instruction: "Aparecerá uma tarja preta dizendo 'Enviado' com a palavra 'Desfazer' em amarelo ou azul. Dê um toque rápido em 'Desfazer'." },
          { title: "Corrija o e-mail antes de enviar", instruction: "O envio será cancelado e o seu e-mail voltará aberto na tela para você corrigir o texto ou o destinatário." },
        ]
      },
      {
        slug: "marcar-email-como-lido-gmail",
        titulo: "Marcar e-mail como lido",
        passos: [
          { title: "Segure o dedo sobre a mensagem", instruction: "Segure o dedo em cima do e-mail que está em negrito (não lido) até aparecer o sinal de verificado." },
          { title: "Toque no ícone de envelope aberto no topo", instruction: "Olhe para a barra superior e toque no desenho de um 'Envelope aberto'." },
          { title: "Confira a mensagem marcada como lida", instruction: "As letras da mensagem ficarão normais e a bolinha de aviso sumirá da sua tela." },
        ]
      },
      {
        slug: "trocar-senha-gmail",
        titulo: "Trocar senha do Google",
        passos: [
          { title: "Toque na sua foto de perfil", instruction: "No canto superior direito do Gmail, toque no círculo com a sua foto ou inicial do nome." },
          { title: "Toque em 'Conta do Google'", instruction: "Toque no botão 'Conta do Google' ou 'Gerenciar sua Conta do Google'." },
          { title: "Toque na aba 'Segurança'", instruction: "Arraste as abas superiores para o lado e toque em 'Segurança'. Depois toque em 'Senha'." },
          { title: "Cadastre e confirme a nova senha", instruction: "Digite sua senha antiga para confirmar que é você, depois digite a nova senha segura e toque em 'Alterar senha'." },
        ]
      },
      {
        slug: "bloquear-remetente-spam-gmail",
        titulo: "Bloquear remetente de spam",
        passos: [
          { title: "Abra a mensagem da empresa chata", instruction: "Toque no e-mail de propaganda ou mensagens indesejadas para abrir." },
          { title: "Toque nos três pontinhos ao lado do nome", instruction: "Atenção: toque nos três pontinhos pequenos que ficam ao lado do nome de quem enviou (não nos do topo da tela)." },
          { title: "Toque em 'Bloquear [Nome]'", instruction: "Selecione a opção 'Bloquear'. As próximas mensagens dessa empresa irão direto para o lixo sem incomodar você." },
        ]
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // INSTAGRAM (15 guias)
  // ════════════════════════════════════════════════════════
  instagram: {
    label: "Instagram",
    tarefas: [
      {
        slug: "ver-fotos-instagram",
        titulo: "Ver fotos e curtir",
        passos: [
          { title: "Abra o aplicativo Instagram", instruction: "Toque no ícone colorido em tons de roxo e rosa com o desenho de uma camerazinha branca." },
          { title: "Deslize o dedo para cima para ver fotos", instruction: "Passe o dedo na tela de baixo para cima para rolar o feed e ver as fotos publicadas pelas pessoas que você segue." },
          { title: "Dê dois toques na foto para curtir", instruction: "Quando gostar de uma foto, dê dois toques rápidos com o dedo bem em cima dela. Um coraçãozinho branco vai aparecer no meio da foto." },
        ]
      },
      {
        slug: "enviar-mensagem-instagram",
        titulo: "Enviar mensagem direta",
        passos: [
          { title: "Abra o Instagram", instruction: "Abra o aplicativo Instagram no seu celular." },
          { title: "Toque no ícone do Direct no topo", instruction: "No canto superior direito, toque no ícone em forma de balãozinho de mensagem ou aviãozinho de papel." },
          { title: "Escolha o amigo na lista", instruction: "Toque no nome da pessoa com quem você deseja conversar ou use a barra de pesquisa para achar o perfil dela." },
          { title: "Digite e toque em Enviar", instruction: "Toque na barra de mensagem no rodapé, digite o recado e toque no botão azul 'Enviar'. A conversa é 100% privada." },
        ]
      },
      {
        slug: "assistir-stories-instagram",
        titulo: "Assistir Stories",
        passos: [
          { title: "Olhe para as bolinhas no topo da tela", instruction: "No início do aplicativo, repare nos círculos coloridos com as fotos dos seus amigos na parte de cima." },
          { title: "Dê um toque no primeiro círculo", instruction: "Toque na bolinha do amigo para abrir a foto ou vídeo que ele postou hoje." },
          { title: "Dê um toque na tela para avançar", instruction: "Para ir para a próxima foto, basta dar um toque rápido no lado direito da tela. Para sair, deslize o dedo para baixo." },
        ]
      },
      {
        slug: "publicar-foto-feed-instagram",
        titulo: "Publicar foto no feed",
        passos: [
          { title: "Toque no botão com sinal de Mais (+)", instruction: "No rodapé da tela (ou no topo), toque no quadrado com um sinal de Mais (+) no centro." },
          { title: "Escolha a foto na galeria", instruction: "Dê um toque na foto que você quer postar e toque na setinha azul 'Avançar' no canto superior direito." },
          { title: "Escreva uma legenda carinhosa", instruction: "Toque em 'Escreva uma legenda...' e digite uma mensagem contando sobre o momento especial da foto." },
          { title: "Toque no botão azul 'Compartilhar'", instruction: "Toque no botão azul 'Compartilhar' no topo direito. A foto será publicada no seu mural para seus amigos curtirem." },
        ]
      },
      {
        slug: "curtir-comentar-foto-instagram",
        titulo: "Curtir e comentar foto",
        passos: [
          { title: "Olhe abaixo da foto do amigo", instruction: "Logo abaixo da imagem no feed, repare nos três símbolos: Coração, Balãozinho e Aviãozinho." },
          { title: "Toque no desenho de balãozinho", instruction: "Toque no segundo ícone (balão de fala) para abrir os comentários daquela publicação." },
          { title: "Digite sua mensagem e toque em Publicar", instruction: "Escreva seu elogio ou bênção com carinho e toque no botão azul 'Publicar'. O amigo verá seu comentário." },
        ]
      },
      {
        slug: "pesquisar-amigo-perfil-instagram",
        titulo: "Pesquisar amigo ou perfil",
        passos: [
          { title: "Toque na lupa no rodapé", instruction: "No rodapé do Instagram, toque no segundo ícone da esquerda: o desenho de uma 'Lupa'." },
          { title: "Toque na barra 'Pesquisar' no topo", instruction: "Dê um toque na barra cinza no topo da tela e digite o nome completo da pessoa que você procura." },
          { title: "Toque no perfil correto", instruction: "Olhe a lista de resultados, confira a foto de perfil da pessoa e toque no nome dela para abrir a página dela." },
        ]
      },
      {
        slug: "seguir-perfil-amigo-instagram",
        titulo: "Seguir perfil de amigo",
        passos: [
          { title: "Abra o perfil da pessoa", instruction: "Entre na página do amigo, artista ou parente que você encontrou na pesquisa." },
          { title: "Toque no botão azul 'Seguir'", instruction: "No alto da tela, logo abaixo da foto da pessoa, toque no botão azul escrito 'Seguir'." },
          { title: "Confira a confirmação", instruction: "O botão mudará para cinza escrito 'Seguindo'. Agora as fotos e vídeos dessa pessoa aparecerão na sua tela inicial." },
        ]
      },
      {
        slug: "compartilhar-post-amigos-instagram",
        titulo: "Compartilhar post com amigos",
        passos: [
          { title: "Na publicação que gostou, olhe os ícones", instruction: "Abaixo da foto ou receita, localize o terceiro ícone: o desenho de um 'Aviãozinho de papel'." },
          { title: "Toque no aviãozinho de papel", instruction: "Dê um toque no aviãozinho para abrir as opções de compartilhamento." },
          { title: "Toque no ícone do WhatsApp", instruction: "Na barra de aplicativos no rodapé, toque no círculo verde do WhatsApp." },
          { title: "Escolha o amigo e envie", instruction: "Selecione o contato da família ou o grupo de amigas no WhatsApp e toque na setinha verde para mandar a foto." },
        ]
      },
      {
        slug: "salvar-publicacao-instagram",
        titulo: "Salvar publicação para ver depois",
        passos: [
          { title: "Na foto ou receita especial, olhe a direita", instruction: "Abaixo da foto no feed, olhe para o cantinho direito da tela." },
          { title: "Toque no ícone de bandeirinha", instruction: "Toque no ícone com desenho de 'Bandeirinha' (marcador). Ele ficará todo preto/preenchido." },
          { title: "Ache seus salvos no perfil", instruction: "Quando quiser rever suas receitas ou fotos guardadas, vá no seu perfil, toque nas 3 barrinhas no topo e escolha 'Salvos'." },
        ]
      },
      {
        slug: "deixar-perfil-privado-instagram",
        titulo: "Deixar perfil privado",
        passos: [
          { title: "Toque na sua foto de perfil no rodapé", instruction: "No canto inferior direito, toque no círculo com a sua foto para abrir a sua página." },
          { title: "Toque nas três barrinhas no topo direito", instruction: "No alto da tela, toque nas três barrinhas horizontais (menu de configurações)." },
          { title: "Toque em 'Privacidade da conta'", instruction: "Role a lista de configurações e toque na opção 'Privacidade da conta' (ícone de cadeado)." },
          { title: "Ative a chave 'Conta privada'", instruction: "Toque na chavinha ao lado de 'Conta privada' para deixá-la azul/ligada e confirme. Agora apenas quem você aprovar verá suas fotos." },
        ]
      },
      {
        slug: "bloquear-perfil-estranho-instagram",
        titulo: "Bloquear perfil estranho",
        passos: [
          { title: "Abra o perfil da pessoa indesejada", instruction: "Entre na página da pessoa desconhecida ou que está incomodando você." },
          { title: "Toque nos três pontinhos no topo direito", instruction: "No canto superior direito da tela do perfil, toque nos três pontinhos." },
          { title: "Toque na opção 'Bloquear'", instruction: "No menu vermelho que abrir na tela, toque na opção 'Bloquear'." },
          { title: "Confirme o bloqueio", instruction: "Toque no botão azul 'Bloquear' na confirmação. Essa pessoa não verá seu nome nem poderá mandar mensagens para você." },
        ]
      },
      {
        slug: "gravar-story-camera-instagram",
        titulo: "Gravar Story com a câmera",
        passos: [
          { title: "Na tela inicial, deslize para a direita", instruction: "Com o dedo no meio da tela inicial do Instagram, empurre a tela para o lado direito para ligar a câmera." },
          { title: "Tire uma foto ou segure para gravar vídeo", instruction: "Dê um toque no círculo branco grande para tirar uma foto, ou segure o dedo nele para gravar um vídeo com sua voz." },
          { title: "Escreva uma mensagem se quiser", instruction: "Toque no ícone 'Aa' no topo da tela para escrever um 'Bom dia' ou colocar uma figurinha." },
          { title: "Toque em 'Seu Story' no rodapé", instruction: "No canto inferior esquerdo, toque no botão redondo branco com sua foto escrito 'Seu Story'. Todos os seus amigos verão por 24 horas." },
        ]
      },
      {
        slug: "silenciar-publicacoes-instagram",
        titulo: "Silenciar publicações de alguém",
        passos: [
          { title: "Abra o perfil da pessoa que posta demais", instruction: "Entre na página do amigo cujas postagens você não deseja mais ver no feed." },
          { title: "Toque no botão cinza 'Seguindo'", instruction: "Logo abaixo da foto de perfil dele, toque no botão 'Seguindo'." },
          { title: "Toque na opção 'Silenciar'", instruction: "No menu que abrir, toque na opção 'Silenciar' (ícone de sino com risco)." },
          { title: "Ative a chave 'Publicações' e 'Stories'", instruction: "Ligue as chavinhas azuis para silenciar. Os posts dele sumirão da sua tela sem você precisar desfazer a amizade." },
        ]
      },
      {
        slug: "tirar-som-videos-instagram",
        titulo: "Tirar som de vídeos",
        passos: [
          { title: "Quando um vídeo começar a tocar som alto", instruction: "Se você estiver passando o feed e um vídeo começar a tocar som alto de surpresa, mantenha a calma." },
          { title: "Dê um toque rápido no centro do vídeo", instruction: "Dê um toque rápido no meio da imagem do vídeo. Um ícone de alto-falante com um 'X' mudo aparecerá na tela." },
          { title: "Navegue em silêncio", instruction: "O áudio será desligado na mesma hora e todos os próximos vídeos continuarão sem som até você tocar novamente." },
        ]
      },
      {
        slug: "desativar-notificacoes-instagram",
        titulo: "Desativar notificações",
        passos: [
          { title: "Abra o seu perfil e toque nas três barrinhas", instruction: "Toque na sua foto no canto inferior direito e depois toque nas três barrinhas no topo direito." },
          { title: "Toque em 'Notificações'", instruction: "No menu de configurações, procure e toque em 'Notificações' (ícone de sininho)." },
          { title: "Ative a chave 'Pausar tudo'", instruction: "No topo, ligue a chavinha 'Pausar tudo' e selecione quantas horas você quer descansar." },
          { title: "Descanse sem apitos", instruction: "O celular não fará nenhum barulho nem mostrará avisos enquanto o descanso estiver ativado." },
        ]
      },
    ]
  },

};

// ─── CORES NO TERMINAL ────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bright: '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  cyan:   '\x1b[36m',
  red:    '\x1b[31m',
  white:  '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen:'\x1b[42m',
};

function header(txt) { console.log(`\n${C.bgBlue}${C.bright}${C.white}  ${txt}  ${C.reset}\n`); }
function success(txt) { console.log(`${C.green}✔ ${txt}${C.reset}`); }
function info(txt) { console.log(`${C.cyan}ℹ ${txt}${C.reset}`); }
function warn(txt) { console.log(`${C.yellow}⚠ ${txt}${C.reset}`); }
function err(txt) { console.log(`${C.red}✖ ${txt}${C.reset}`); }
function step(n, total, title) {
  console.log(`\n${C.bright}${C.yellow}── Passo ${n}/${total}: ${title}${C.reset}`);
}

// ─── LÓGICA DE CAPTURA VIA ADB ────────────────────────────────────────────────
function capturar(outputPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const adb = spawn(ADB_PATH, ['exec-out', 'screencap', '-p']);
    const outStream = fs.createWriteStream(outputPath);

    adb.stdout.pipe(outStream);

    let stderrOutput = '';
    adb.stderr.on('data', (d) => { stderrOutput += d.toString(); });

    outStream.on('finish', () => {
      const size = fs.statSync(outputPath).size;
      if (size < 1000) {
        fs.unlinkSync(outputPath);
        reject(new Error('Arquivo corrompido (menos de 1KB). Celular conectado?'));
      } else {
        resolve(size);
      }
    });

    adb.on('error', reject);
    outStream.on('error', reject);
  });
}

// ─── INTERFACE DE READLINE ────────────────────────────────────────────────────
function criarRL() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function aguardar(rl, pergunta) {
  return new Promise((resolve) => rl.question(pergunta, resolve));
}

// ─── MENU PRINCIPAL ───────────────────────────────────────────────────────────
async function menuPrincipal(rl) {
  console.clear();
  header('📸 CAPTURADOR DE TELAS — GUIDO');
  console.log('Selecione o aplicativo:\n');

  const apps = Object.keys(GUIAS);
  apps.forEach((key, i) => {
    console.log(`  ${C.bright}${i + 1}${C.reset}. ${GUIAS[key].label}`);
  });
  console.log(`  ${C.bright}0${C.reset}. Sair`);

  const resp = await aguardar(rl, `\nDigite o número: `);
  const idx = parseInt(resp, 10);

  if (idx === 0) {
    console.log('\nAté logo! 👋\n');
    rl.close();
    process.exit(0);
  }

  if (isNaN(idx) || idx < 1 || idx > apps.length) {
    warn('Opção inválida.');
    await aguardar(rl, 'Pressione ENTER para continuar...');
    return menuPrincipal(rl);
  }

  const appKey = apps[idx - 1];
  return menuTarefas(rl, appKey);
}

// ─── MENU DE TAREFAS ──────────────────────────────────────────────────────────
async function menuTarefas(rl, appKey, modoAuto = false, delaySegundos = 5) {
  console.clear();
  const app = GUIAS[appKey];
  const modoLabel = modoAuto
    ? `${C.green}[AUTO ${delaySegundos}s]${C.reset}`
    : `${C.dim}[MANUAL]${C.reset}`;
  header(`📱 ${app.label} — Tarefas  ${modoLabel}`);

  app.tarefas.forEach((t, i) => {
    const dir = path.join(BASE_DIR, appKey, t.slug);
    const capturadasN = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter(f => f.endsWith('.png')).length
      : 0;
    const total = t.passos.length;
    const status = capturadasN >= total
      ? `${C.green}✔ ${capturadasN}/${total}${C.reset}`
      : capturadasN > 0
        ? `${C.yellow}~ ${capturadasN}/${total}${C.reset}`
        : `${C.dim}0/${total}${C.reset}`;
    console.log(`  ${C.bright}${i + 1}${C.reset}. ${t.titulo}  [${status}]`);
  });

  console.log(`\n  ${C.bright}T${C.reset}. Fazer TODAS em sequência`);
  console.log(`  ${C.bright}A${C.reset}. Alternar modo: ${modoAuto ? 'AUTO → MANUAL' : 'MANUAL → AUTO (conta e captura sozinho)'}`);
  console.log(`  ${C.bright}V${C.reset}. Voltar ao menu principal`);
  const resp = await aguardar(rl, `\nDigite o número da tarefa: `);

  if (resp.toLowerCase() === 'v') return menuPrincipal(rl);

  // Alternar modo automático / manual
  if (resp.toLowerCase() === 'a') {
    if (!modoAuto) {
      console.clear();
      header('⚙️  Configurar Modo Automático');
      console.log('No modo automático, o script captura sozinho após uma contagem.');
      console.log('Você tem tempo para fazer a ação no celular antes de capturar.\n');
      const seg = await aguardar(rl, 'Quantos segundos de espera por passo? (padrão: 5): ');
      const novoDelay = parseInt(seg, 10);
      return menuTarefas(rl, appKey, true, isNaN(novoDelay) || novoDelay < 1 ? 5 : novoDelay);
    } else {
      return menuTarefas(rl, appKey, false, 5);
    }
  }

  if (resp.toLowerCase() === 't') {
    console.clear();
    header(`📱 ${app.label} — MODO TODAS AS TAREFAS`);
    console.log(`${C.yellow}Isso vai percorrer todas as ${app.tarefas.length} tarefas em ordem.${C.reset}`);
    console.log(`${C.dim}Tarefas já concluídas serão puladas automaticamente.${C.reset}`);
    if (modoAuto) console.log(`${C.green}Modo automático ativado: ${delaySegundos}s por passo.${C.reset}`);
    console.log('');
    const confirmar = await aguardar(rl, 'Pressione ENTER para começar, ou "s" para cancelar: ');
    if (confirmar.toLowerCase() !== 's') {
      for (const tarefa of app.tarefas) {
        const dir = path.join(BASE_DIR, appKey, tarefa.slug);
        const capturadasN = fs.existsSync(dir)
          ? fs.readdirSync(dir).filter(f => f.endsWith('.png')).length
          : 0;
        if (capturadasN >= tarefa.passos.length) {
          info(`✔ Pulando (já completa): ${tarefa.titulo}`);
          await new Promise(r => setTimeout(r, 600));
          continue;
        }
        await executarCaptura(rl, appKey, tarefa, modoAuto, delaySegundos);
      }
      console.clear();
      header(`✅ ${app.label} — TODAS AS TAREFAS CONCLUÍDAS!`);
      await aguardar(rl, 'Pressione ENTER para voltar ao menu...');
    }
    return menuTarefas(rl, appKey, modoAuto, delaySegundos);
  }

  const idx = parseInt(resp, 10);
  if (isNaN(idx) || idx < 1 || idx > app.tarefas.length) {
    warn('Opção inválida.');
    await aguardar(rl, 'Pressione ENTER para continuar...');
    return menuTarefas(rl, appKey, modoAuto, delaySegundos);
  }

  const tarefa = app.tarefas[idx - 1];
  await executarCaptura(rl, appKey, tarefa, modoAuto, delaySegundos);
  return menuTarefas(rl, appKey, modoAuto, delaySegundos);
}


// ─── CONTAGEM REGRESSIVA ──────────────────────────────────────────────────────
function contagem(segundos) {
  return new Promise((resolve) => {
    let restante = segundos;
    const interval = setInterval(() => {
      process.stdout.write(`\r${C.yellow}⏱  Capturando em ${restante}s... (CTRL+C para parar)   ${C.reset}`);
      restante--;
      if (restante < 0) {
        clearInterval(interval);
        process.stdout.write(`\r${C.cyan}⟳ Capturando agora...                                  ${C.reset}`);
        resolve();
      }
    }, 1000);
  });
}

// ─── EXECUÇÃO DA CAPTURA DE UMA TAREFA ───────────────────────────────────────
async function executarCaptura(rl, appKey, tarefa, modoAuto = false, delaySegundos = 5) {
  console.clear();
  header(`📸 ${GUIAS[appKey].label} › ${tarefa.titulo}`);
  info(`Slug: ${tarefa.slug}`);
  info(`Total de passos: ${tarefa.passos.length}`);
  if (modoAuto) info(`Modo automático: captura em ${delaySegundos}s por passo`);
  console.log('');
  warn('PREPARAÇÃO: Abra o app no celular antes de começar!');
  console.log('');
  const iniciar = await aguardar(rl, 'Pressione ENTER para iniciar os passos, ou "s" para cancelar: ');
  if (iniciar.toLowerCase() === 's') return;

  const outDir = path.join(BASE_DIR, appKey, tarefa.slug);

  for (let i = 0; i < tarefa.passos.length; i++) {
    const passo = tarefa.passos[i];
    const n = i + 1;
    const outputPath = path.join(outDir, `step-${n}.png`);

    console.clear();
    header(`${GUIAS[appKey].label} › ${tarefa.titulo}`);
    step(n, tarefa.passos.length, passo.title);
    console.log('');
    console.log(`${C.white}📋 Instrução:${C.reset}`);
    console.log(`   ${passo.instruction}`);
    console.log('');

    if (fs.existsSync(outputPath)) {
      const size = fs.statSync(outputPath).size;
      warn(`Já existe captura step-${n}.png (${(size / 1024).toFixed(0)} KB)`);
      const sobrescrever = await aguardar(rl, 'Sobrescrever? (s = sim / ENTER = pular): ');
      if (sobrescrever.toLowerCase() !== 's') {
        info('Passo pulado.');
        if (!modoAuto) await aguardar(rl, 'Pressione ENTER para o próximo passo...');
        continue;
      }
    }

    console.log(`${C.dim}Execute a ação acima no celular...${C.reset}`);
    console.log('');

    if (modoAuto) {
      // Modo automático: conta e captura sozinho
      await contagem(delaySegundos);
    } else {
      // Modo manual: espera ENTER
      const resp = await aguardar(rl, `Pressione ENTER para CAPTURAR, ou "s" para pular: `);
      if (resp.toLowerCase() === 's') {
        info('Passo pulado.');
        continue;
      }
    }

    process.stdout.write(`\r${C.cyan}⟳ Capturando...                                        ${C.reset}`);
    try {
      const bytes = await capturar(outputPath);
      console.log(`\r${C.green}✔ Salvo: step-${n}.png (${(bytes / 1024).toFixed(0)} KB)${C.reset}   `);
    } catch (e) {
      console.log(`\r${C.red}✖ Erro: ${e.message}${C.reset}   `);
      if (!modoAuto) {
        const retry = await aguardar(rl, 'Tentar novamente? (s = sim / ENTER = pular): ');
        if (retry.toLowerCase() === 's') { i--; continue; }
      }
    }

    if (modoAuto) {
      // Pausa entre passos para o usuário preparar o próximo
      await new Promise(r => setTimeout(r, 1500));
    } else {
      if (i < tarefa.passos.length - 1) {
        await aguardar(rl, 'Pressione ENTER para o próximo passo...');
      }
    }
  }

  console.log('');
  console.log(`${C.bgGreen}${C.bright}${C.white}  ✔ Tarefa concluída: ${tarefa.titulo}  ${C.reset}`);
  console.log('');
  if (!modoAuto) await aguardar(rl, 'Pressione ENTER para voltar ao menu...');
  else await new Promise(r => setTimeout(r, 2000));
}

// ─── INÍCIO ───────────────────────────────────────────────────────────────────
(async () => {
  const rl = criarRL();
  rl.on('close', () => process.exit(0));

  // Verificar ADB
  if (!fs.existsSync(ADB_PATH)) {
    err(`ADB não encontrado em:\n${ADB_PATH}`);
    process.exit(1);
  }

  // Verificar celular conectado
  try {
    const check = spawn(ADB_PATH, ['devices']);
    let output = '';
    check.stdout.on('data', d => output += d);
    await new Promise(resolve => check.on('close', resolve));

    const devices = output.split('\n').filter(l => l.includes('\tdevice'));
    if (devices.length === 0) {
      warn('Nenhum celular autorizado encontrado!');
      warn('Conecte o celular pelo cabo USB e autorize a depuração.');
      process.exit(1);
    }
    info(`Celular conectado: ${devices[0].split('\t')[0].trim()}`);
  } catch (e) {
    err('Erro ao verificar ADB: ' + e.message);
    process.exit(1);
  }

  await menuPrincipal(rl);
})();
