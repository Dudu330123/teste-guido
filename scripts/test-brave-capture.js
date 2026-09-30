const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BRAVE_PATH = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browserExecutable = fs.existsSync(BRAVE_PATH) ? BRAVE_PATH : EDGE_PATH;

const OUTPUT_DIR = "C:\\Users\\eduar\\OneDrive\\Documentos\\Guido\\capturas de tela\\prints\\youtube";
const OUTPUT_FILE = path.join(OUTPUT_DIR, "teste-automacao.png");

async function main() {
  console.log(`Iniciando navegador com: ${browserExecutable}`);
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

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

    console.log("Acessando m.youtube.com...");
    await page.goto("https://m.youtube.com", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    console.log("Aguardando carregamento da interface...");
    await new Promise((r) => setTimeout(r, 4000));

    console.log(`Salvando captura em: ${OUTPUT_FILE}`);
    await page.screenshot({ path: OUTPUT_FILE });

    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`✔ Sucesso! Imagem gerada com ${(stats.size / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error("Erro na automação:", err.message);
  } finally {
    await browser.close();
  }
}

main();
