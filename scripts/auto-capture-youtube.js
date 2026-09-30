const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BRAVE_PATH = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browserExecutable = fs.existsSync(BRAVE_PATH) ? BRAVE_PATH : EDGE_PATH;

const BASE_DIR = "C:\\Users\\eduar\\OneDrive\\Documentos\\Guido\\capturas de tela\\prints\\youtube";
const GUIDE_DIR = path.join(BASE_DIR, "pesquisar-video-youtube");

async function main() {
  if (!fs.existsSync(GUIDE_DIR)) {
    fs.mkdirSync(GUIDE_DIR, { recursive: true });
  }

  console.log("Iniciando navegador com emulação de celular...");
  const browser = await puppeteer.launch({
    executablePath: browserExecutable,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-notifications',
      '--window-size=412,915',
    ],
  });

  try {
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

    // PASSO 1: Tela inicial com a lupa em destaque
    console.log("Capturando Passo 1: Tela inicial...");
    await page.goto("https://m.youtube.com", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(GUIDE_DIR, "step-1.png") });
    console.log("✔ Passo 1 salvo!");

    // PASSO 2: Tela de pesquisa aberta
    console.log("Capturando Passo 2: Barra de pesquisa digitando...");
    await page.goto("https://m.youtube.com/results?search_query=Receita+de+bolo+de+cenoura", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    await new Promise((r) => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(GUIDE_DIR, "step-2.png") });
    console.log("✔ Passo 2 salvo!");

    // PASSO 3: Resultados e toque para assistir
    console.log("Capturando Passo 3: Escolhendo vídeo nos resultados...");
    await page.evaluate(() => window.scrollBy(0, 200));
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(GUIDE_DIR, "step-3.png") });
    console.log("✔ Passo 3 salvo!");

    console.log("🎉 Guia 'pesquisar-video-youtube' 100% capturado automaticamente!");
  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    await browser.close();
  }
}

main();
