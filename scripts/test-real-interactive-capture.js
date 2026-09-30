const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BRAVE_PATH = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(BRAVE_PATH) ? BRAVE_PATH : EDGE_PATH;
const TARGET_DIR = "C:\\Users\\eduar\\OneDrive\\Documentos\\Guido\\capturas de tela\\prints\\youtube\\assistir-transmissoes-ao-vivo-youtube";

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=412,915',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 412,
    height: 915,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.setUserAgent(
    'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36'
  );

  console.log("1. Acessando busca real do YouTube...");
  await page.goto("https://m.youtube.com", { waitUntil: 'networkidle2', timeout: 35000 });
  await wait(2500);

  // Injetar destaque amarelo na lupa / busca
  await page.evaluate(() => {
    // Procurar botão de pesquisa ou barra
    const searchBtn = document.querySelector('button[aria-label*="Pesquisar"], .header-search-icon, button.c4v-icon-button') || document.querySelector('button');
    if (searchBtn) {
      searchBtn.style.outline = '4px solid #facc15';
      searchBtn.style.boxShadow = '0 0 15px #facc15';
      searchBtn.style.borderRadius = '9999px';
      
      const badge = document.createElement('div');
      badge.innerText = '👆 Toque na lupa';
      badge.style.position = 'absolute';
      badge.style.top = '50px';
      badge.style.right = '20px';
      badge.style.background = '#facc15';
      badge.style.color = '#000';
      badge.style.fontWeight = 'bold';
      badge.style.fontSize = '12px';
      badge.style.padding = '4px 10px';
      badge.style.borderRadius = '20px';
      badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
      badge.style.zIndex = '9999';
      document.body.appendChild(badge);
    }
  });
  await page.screenshot({ path: path.join(TARGET_DIR, "step-1.png") });
  console.log("✔ Passo 1 real salvo!");

  console.log("2. Pesquisando 'Missa ao vivo' real...");
  await page.goto("https://m.youtube.com/results?search_query=Missa+ao+vivo", { waitUntil: 'networkidle2', timeout: 35000 });
  await wait(3000);

  // Destacar o primeiro card que tem selo AO VIVO
  await page.evaluate(() => {
    // Achar o primeiro item de vídeo
    const firstVideo = document.querySelector('ytm-video-with-context-renderer, ytm-compact-video-renderer, .media-item-thumbnail-container') || document.querySelector('a[href*="/watch"]');
    if (firstVideo) {
      firstVideo.style.outline = '4px solid #facc15';
      firstVideo.style.boxShadow = '0 0 18px #facc15';
      firstVideo.style.borderRadius = '12px';

      const badge = document.createElement('div');
      badge.innerText = '🔴 Procure a etiqueta vermelha AO VIVO';
      badge.style.position = 'absolute';
      badge.style.top = '120px';
      badge.style.left = '20px';
      badge.style.background = '#facc15';
      badge.style.color = '#000';
      badge.style.fontWeight = 'bold';
      badge.style.fontSize = '12px';
      badge.style.padding = '5px 12px';
      badge.style.borderRadius = '20px';
      badge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.6)';
      badge.style.zIndex = '9999';
      document.body.appendChild(badge);
    }
  });
  await page.screenshot({ path: path.join(TARGET_DIR, "step-2.png") });
  console.log("✔ Passo 2 real salvo!");

  console.log("3. Abrindo o vídeo real...");
  // Clicar no primeiro vídeo ou navegar direto
  const videoUrl = await page.evaluate(() => {
    const link = document.querySelector('a[href*="/watch"]');
    return link ? link.href : null;
  });

  if (videoUrl) {
    await page.goto(videoUrl, { waitUntil: 'networkidle2', timeout: 35000 });
  } else {
    await page.goto("https://m.youtube.com/watch?v=live", { waitUntil: 'networkidle2', timeout: 35000 });
  }
  await wait(4000);

  await page.evaluate(() => {
    const player = document.querySelector('.player-container, video, #player') || document.body;
    const badge = document.createElement('div');
    badge.innerText = '✔ Transmissão ao vivo aberta em tempo real';
    badge.style.position = 'fixed';
    badge.style.bottom = '80px';
    badge.style.left = '50%';
    badge.style.transform = 'translateX(-50%)';
    badge.style.background = '#facc15';
    badge.style.color = '#000';
    badge.style.fontWeight = 'bold';
    badge.style.fontSize = '12px';
    badge.style.padding = '6px 14px';
    badge.style.borderRadius = '20px';
    badge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.6)';
    badge.style.zIndex = '9999';
    badge.style.whiteSpace = 'nowrap';
    document.body.appendChild(badge);
  });
  await page.screenshot({ path: path.join(TARGET_DIR, "step-3.png") });
  console.log("✔ Passo 3 real salvo!");

  await browser.close();
}

main();
