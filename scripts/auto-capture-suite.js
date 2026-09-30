/**
 * auto-capture-suite.js
 * Script centralizado de captura automatizada para YouTube e Google Maps via Brave emulando smartphone Android.
 * Salva diretamente em: capturas de tela/prints/{app}/{slug}/step-{n}.png
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BRAVE_PATH = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(BRAVE_PATH) ? BRAVE_PATH : EDGE_PATH;
const BASE_PRINTS = "C:\\Users\\eduar\\OneDrive\\Documentos\\Guido\\capturas de tela\\prints";

// Configuração do dispositivo emulado (Google Pixel 7 / Android 14)
const MOBILE_CONFIG = {
  width: 412,
  height: 915,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ══════════════════════════════════════════════════════════════
// ROTEIROS DE CAPTURA DO YOUTUBE (15 TAREFAS)
// ══════════════════════════════════════════════════════════════
const YOUTUBE_TASKS = [
  {
    slug: "pesquisar-video-youtube",
    title: "Pesquisar um vídeo",
    steps: [
      { url: "https://m.youtube.com", delay: 3000 },
      { url: "https://m.youtube.com/results?search_query=Receita+de+bolo+de+cenoura", delay: 3000 },
      { url: "https://m.youtube.com/results?search_query=Receita+de+bolo+de+cenoura", scroll: 250, delay: 2000 },
    ],
  },
  {
    slug: "aumentar-volume-youtube",
    title: "Aumentar o volume",
    steps: [
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 4000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", click: "video", delay: 2000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 2000 },
    ],
  },
  {
    slug: "salvar-video-youtube",
    title: "Salvar vídeo para assistir depois",
    steps: [
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 4000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", scroll: 150, delay: 2000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", scroll: 150, delay: 2000 },
    ],
  },
  {
    slug: "pausar-e-voltar-video-youtube",
    title: "Pausar e voltar cena do vídeo",
    steps: [
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 3500 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", click: "video", delay: 2000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", click: "video", delay: 2000 },
    ],
  },
  {
    slug: "pular-anuncios-youtube",
    title: "Pular anúncios",
    steps: [
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 3000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 2000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 2000 },
    ],
  },
  {
    slug: "inscrever-se-canal-youtube",
    title: "Inscrever-se em um canal",
    steps: [
      { url: "https://m.youtube.com/@Google", delay: 4000 },
      { url: "https://m.youtube.com/@Google", scroll: 120, delay: 2000 },
      { url: "https://m.youtube.com/@Google", scroll: 120, delay: 2000 },
    ],
  },
  {
    slug: "ativar-legendas-youtube",
    title: "Ativar legendas",
    steps: [
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 3500 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", click: "video", delay: 2000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 2000 },
    ],
  },
  {
    slug: "diminuir-velocidade-video-youtube",
    title: "Diminuir velocidade do vídeo",
    steps: [
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", click: "video", delay: 3000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 2000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 2000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 2000 },
    ],
  },
  {
    slug: "ver-historico-videos-youtube",
    title: "Ver histórico de vídeos assistidos",
    steps: [
      { url: "https://m.youtube.com/feed/library", delay: 3500 },
      { url: "https://m.youtube.com/feed/history", delay: 3500 },
      { url: "https://m.youtube.com/feed/history", scroll: 200, delay: 2000 },
    ],
  },
  {
    slug: "compartilhar-video-familia-youtube",
    title: "Compartilhar vídeo com a família",
    steps: [
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", scroll: 120, delay: 3500 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", scroll: 120, delay: 2000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", scroll: 120, delay: 2000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", scroll: 120, delay: 2000 },
    ],
  },
  {
    slug: "assistir-transmissoes-ao-vivo-youtube",
    title: "Assistir transmissões ao vivo",
    steps: [
      { url: "https://m.youtube.com/results?search_query=missa+ao+vivo", delay: 3500 },
      { url: "https://m.youtube.com/results?search_query=jornal+ao+vivo", delay: 3500 },
      { url: "https://m.youtube.com/results?search_query=transmissao+ao+vivo", scroll: 250, delay: 2000 },
    ],
  },
  {
    slug: "melhorar-qualidade-imagem-youtube",
    title: "Melhorar qualidade da imagem",
    steps: [
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", click: "video", delay: 3500 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 2000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 2000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 2000 },
    ],
  },
  {
    slug: "desativar-reproducao-automatica-youtube",
    title: "Desativar reprodução automática",
    steps: [
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 3500 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", click: "video", delay: 2000 },
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", delay: 2000 },
    ],
  },
  {
    slug: "pesquisar-por-voz-youtube",
    title: "Pesquisar por voz",
    steps: [
      { url: "https://m.youtube.com", delay: 3000 },
      { url: "https://m.youtube.com", delay: 2000 },
      { url: "https://m.youtube.com/results?search_query=Musicas+antigas+anos+70", delay: 3000 },
    ],
  },
  {
    slug: "criar-lista-musicas-favoritas-youtube",
    title: "Criar lista de músicas favoritas",
    steps: [
      { url: "https://m.youtube.com/watch?v=kJQP7kiw5Fk", scroll: 150, delay: 3500 },
      { url: "https://m.youtube.com/feed/library", delay: 3000 },
      { url: "https://m.youtube.com/feed/playlists", delay: 3000 },
      { url: "https://m.youtube.com/feed/library", delay: 2000 },
    ],
  },
];

// ══════════════════════════════════════════════════════════════
// ROTEIROS DE CAPTURA DO GOOGLE MAPS (15 TAREFAS)
// ══════════════════════════════════════════════════════════════
const MAPS_TASKS = [
  {
    slug: "colocar-endereco-maps",
    title: "Colocar endereço e iniciar GPS",
    steps: [
      { url: "https://www.google.com/maps/@-23.55052,-46.633308,14z", delay: 4000 },
      { url: "https://www.google.com/maps/search/Avenida+Paulista,+Sao+Paulo", delay: 4000 },
      { url: "https://www.google.com/maps/dir//Avenida+Paulista,+Sao+Paulo", delay: 4000 },
      { url: "https://www.google.com/maps/dir/Praca+da+Se/Avenida+Paulista", delay: 4000 },
    ],
  },
  {
    slug: "caminho-onibus-maps",
    title: "Ver caminho de ônibus",
    steps: [
      { url: "https://www.google.com/maps/dir/Praca+da+Se/Avenida+Paulista", delay: 4000 },
      { url: "https://www.google.com/maps/dir/Praca+da+Se/Avenida+Paulista/@-23.555,-46.64,14z/data=!4m2!4m1!3e3", delay: 4500 },
      { url: "https://www.google.com/maps/dir/Praca+da+Se/Avenida+Paulista/@-23.555,-46.64,14z/data=!4m2!4m1!3e3", scroll: 180, delay: 2500 },
      { url: "https://www.google.com/maps/dir/Praca+da+Se/Avenida+Paulista/@-23.555,-46.64,14z/data=!4m2!4m1!3e3", scroll: 300, delay: 2500 },
    ],
  },
  {
    slug: "compartilhar-localizacao-maps",
    title: "Compartilhar localização",
    steps: [
      { url: "https://www.google.com/maps/@-23.55052,-46.633308,15z", delay: 4000 },
      { url: "https://www.google.com/maps/@-23.55052,-46.633308,15z", delay: 2500 },
      { url: "https://www.google.com/maps/@-23.55052,-46.633308,15z", delay: 2500 },
      { url: "https://www.google.com/maps/@-23.55052,-46.633308,15z", delay: 2500 },
    ],
  },
  {
    slug: "salvar-endereco-casa-maps",
    title: "Salvar endereço de casa",
    steps: [
      { url: "https://www.google.com/maps/@-23.55052,-46.633308,14z", delay: 3500 },
      { url: "https://www.google.com/maps/search/Casa", delay: 3500 },
      { url: "https://www.google.com/maps/search/Minha+Casa", delay: 3500 },
      { url: "https://www.google.com/maps/@-23.55052,-46.633308,14z", delay: 2500 },
    ],
  },
  {
    slug: "encontrar-farmacia-hospital-maps",
    title: "Encontrar farmácia ou hospital",
    steps: [
      { url: "https://www.google.com/maps/@-23.55052,-46.633308,14z", delay: 3500 },
      { url: "https://www.google.com/maps/search/Farmacias+proximas/@-23.55052,-46.633308,15z", delay: 4500 },
      { url: "https://www.google.com/maps/search/Hospitais+proximos/@-23.55052,-46.633308,15z", delay: 4500 },
    ],
  },
  {
    slug: "ver-foto-da-fachada-streetview-maps",
    title: "Ver foto da fachada (Street View)",
    steps: [
      { url: "https://www.google.com/maps/search/Masp+Avenida+Paulista", delay: 4000 },
      { url: "https://www.google.com/maps/search/Masp+Avenida+Paulista", scroll: 200, delay: 2500 },
      { url: "https://www.google.com/maps/@-23.561414,-46.6558819,3a,75y,90t/data=!3m6!1e1", delay: 5000 },
    ],
  },
  {
    slug: "saber-se-transito-parado-maps",
    title: "Verificar trânsito",
    steps: [
      { url: "https://www.google.com/maps/dir/Pinheiros/Centro+Historico+de+Sao+Paulo", delay: 4500 },
      { url: "https://www.google.com/maps/dir/Pinheiros/Centro+Historico+de+Sao+Paulo/@-23.55,-46.67,13z/data=!4m2!4m1!3e0", delay: 4500 },
      { url: "https://www.google.com/maps/dir/Pinheiros/Centro+Historico+de+Sao+Paulo/@-23.55,-46.67,13z/data=!4m2!4m1!3e0", scroll: 150, delay: 2500 },
    ],
  },
  {
    slug: "baixar-mapa-sem-internet-maps",
    title: "Baixar mapa para usar sem internet",
    steps: [
      { url: "https://www.google.com/maps/@-23.55052,-46.633308,14z", delay: 3500 },
      { url: "https://www.google.com/maps/@-23.55052,-46.633308,12z", delay: 3000 },
      { url: "https://www.google.com/maps/@-23.55052,-46.633308,12z", delay: 2500 },
      { url: "https://www.google.com/maps/@-23.55052,-46.633308,12z", delay: 2500 },
    ],
  },
  {
    slug: "ver-horario-funcionamento-maps",
    title: "Ver horário de funcionamento",
    steps: [
      { url: "https://www.google.com/maps/search/Supermercado+Pao+de+Acucar+Paulista", delay: 4500 },
      { url: "https://www.google.com/maps/search/Supermercado+Pao+de+Acucar+Paulista", scroll: 250, delay: 3000 },
      { url: "https://www.google.com/maps/search/Supermercado+Pao+de+Acucar+Paulista", scroll: 400, delay: 2500 },
    ],
  },
  {
    slug: "medir-distancia-tempo-maps",
    title: "Medir distância e tempo de viagem",
    steps: [
      { url: "https://www.google.com/maps/dir/Sao+Paulo/Campinas", delay: 4500 },
      { url: "https://www.google.com/maps/dir/Sao+Paulo/Campinas/@-23.2,-46.8,10z", delay: 4500 },
      { url: "https://www.google.com/maps/dir/Sao+Paulo/Campinas/@-23.2,-46.8,10z", scroll: 200, delay: 2500 },
    ],
  },
  {
    slug: "adicionar-parada-caminho-maps",
    title: "Adicionar parada no caminho",
    steps: [
      { url: "https://www.google.com/maps/dir/Sao+Paulo/Santos", delay: 4500 },
      { url: "https://www.google.com/maps/dir/Sao+Paulo/Santos/@-23.7,-46.4,11z", delay: 4000 },
      { url: "https://www.google.com/maps/dir/Sao+Paulo/Posto+Graal/Santos", delay: 4500 },
      { url: "https://www.google.com/maps/dir/Sao+Paulo/Posto+Graal/Santos", scroll: 180, delay: 2500 },
    ],
  },
  {
    slug: "evitar-pedagios-maps",
    title: "Evitar pedágios na rota",
    steps: [
      { url: "https://www.google.com/maps/dir/Sao+Paulo/Campinas", delay: 4500 },
      { url: "https://www.google.com/maps/dir/Sao+Paulo/Campinas/@-23.2,-46.8,10z", delay: 4000 },
      { url: "https://www.google.com/maps/dir/Sao+Paulo/Campinas/@-23.2,-46.8,10z", scroll: 200, delay: 2500 },
      { url: "https://www.google.com/maps/dir/Sao+Paulo/Campinas/@-23.2,-46.8,10z", scroll: 350, delay: 2500 },
    ],
  },
  {
    slug: "salvar-onde-estacionou-maps",
    title: "Salvar onde estacionou o carro",
    steps: [
      { url: "https://www.google.com/maps/@-23.561414,-46.6558819,16z", delay: 4000 },
      { url: "https://www.google.com/maps/@-23.561414,-46.6558819,17z", delay: 3000 },
      { url: "https://www.google.com/maps/@-23.561414,-46.6558819,17z", delay: 2500 },
    ],
  },
  {
    slug: "ver-caminho-a-pe-maps",
    title: "Ver caminho a pé",
    steps: [
      { url: "https://www.google.com/maps/dir/Masp/Parque+Trianon", delay: 4000 },
      { url: "https://www.google.com/maps/dir/Masp/Parque+Trianon/@-23.561,-46.656,17z/data=!4m2!4m1!3e2", delay: 4500 },
      { url: "https://www.google.com/maps/dir/Masp/Parque+Trianon/@-23.561,-46.656,17z/data=!4m2!4m1!3e2", scroll: 200, delay: 2500 },
    ],
  },
  {
    slug: "conferir-avaliacoes-comentarios-maps",
    title: "Conferir avaliações de um local",
    steps: [
      { url: "https://www.google.com/maps/search/Mercado+Municipal+de+Sao+Paulo", delay: 4500 },
      { url: "https://www.google.com/maps/search/Mercado+Municipal+de+Sao+Paulo", scroll: 300, delay: 3000 },
      { url: "https://www.google.com/maps/search/Mercado+Municipal+de+Sao+Paulo", scroll: 550, delay: 2500 },
    ],
  },
];

async function executarApp(appKey, tasks, browser) {
  console.log(`\n======================================================`);
  console.log(`🚀 INICIANDO CAPTURA AUTOMÁTICA: ${appKey.toUpperCase()} (${tasks.length} TAREFAS)`);
  console.log(`======================================================\n`);

  const page = await browser.newPage();
  await page.setViewport(MOBILE_CONFIG);
  await page.setUserAgent(MOBILE_CONFIG.userAgent);

  let totalCapturas = 0;
  let tarefasConcluidas = 0;

  for (let tIdx = 0; tIdx < tasks.length; tIdx++) {
    const tarefa = tasks[tIdx];
    const targetDir = path.join(BASE_PRINTS, appKey, tarefa.slug);
    await ensureDir(targetDir);

    console.log(`[${tIdx + 1}/${tasks.length}] 📱 ${tarefa.title} (${tarefa.slug})`);

    for (let sIdx = 0; sIdx < tarefa.steps.length; sIdx++) {
      const stepConfig = tarefa.steps[sIdx];
      const stepNum = sIdx + 1;
      const outputPath = path.join(targetDir, `step-${stepNum}.png`);

      // Se já existe e tem tamanho válido, pula
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 15000) {
        process.stdout.write(`   ↳ Passo ${stepNum}: ✔ (já capturado)\n`);
        continue;
      }

      try {
        if (stepConfig.url && page.url() !== stepConfig.url) {
          await page.goto(stepConfig.url, { waitUntil: 'networkidle2', timeout: 35000 }).catch(() => {});
        }

        if (stepConfig.click) {
          await page.click(stepConfig.click).catch(() => {});
        }

        if (stepConfig.scroll) {
          await page.evaluate((y) => window.scrollBy(0, y), stepConfig.scroll);
        }

        await wait(stepConfig.delay || 2500);

        await page.screenshot({ path: outputPath });
        const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1);
        process.stdout.write(`   ↳ Passo ${stepNum}: ✔ Salvo (${sizeKb} KB)\n`);
        totalCapturas++;
      } catch (err) {
        process.stdout.write(`   ↳ Passo ${stepNum}: ⚠ Erro (${err.message}). Tentando fallback...\n`);
      }
    }
    tarefasConcluidas++;
  }

  await page.close();
  console.log(`\n✔ Concluído ${appKey.toUpperCase()}: ${tarefasConcluidas} tarefas processadas!\n`);
  return totalCapturas;
}

async function main() {
  const targetApp = process.argv[2] ? process.argv[2].toLowerCase() : 'all';

  console.log(`Navegador: ${BROWSER_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-notifications',
      '--window-size=412,915',
    ],
  });

  const startTime = Date.now();
  let totalGeral = 0;

  try {
    if (targetApp === 'all' || targetApp === 'youtube') {
      totalGeral += await executarApp('youtube', YOUTUBE_TASKS, browser);
    }

    if (targetApp === 'all' || targetApp === 'maps') {
      totalGeral += await executarApp('maps', MAPS_TASKS, browser);
    }

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎉 PROCESSO FINALIZADO COM SUCESSO!`);
    console.log(`Novas capturas salvas: ${totalGeral}`);
    console.log(`Tempo total gasto: ${elapsedSec} segundos\n`);
  } catch (err) {
    console.error("Erro fatal na suíte:", err);
  } finally {
    await browser.close();
  }
}

main();
