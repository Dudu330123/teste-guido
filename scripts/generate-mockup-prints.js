/**
 * generate-mockup-prints.js
 * Gerador completo de telas mockup em alta fidelidade com destaque amarelo (#FACC15).
 * Gera todas as 15 tarefas do YouTube e 15 tarefas do Google Maps.
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BRAVE_PATH = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(BRAVE_PATH) ? BRAVE_PATH : EDGE_PATH;
const BASE_PRINTS = "C:\\Users\\eduar\\OneDrive\\Documentos\\Guido\\capturas de tela\\prints";

const DEVICE = {
  width: 412,
  height: 915,
  deviceScaleFactor: 2,
};

function getBaseTemplate(bodyContent, isDark = true) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=412, height=915, initial-scale=1.0">
  <title>Screen Mockup</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
    body {
      width: 412px;
      height: 915px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: ${isDark ? '#0f0f0f' : '#f8f9fa'};
      color: ${isDark ? '#ffffff' : '#1f2937'};
      position: relative;
    }
    .highlight-ring {
      border: 3.5px solid #facc15 !important;
      box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.4), 0 0 16px rgba(250, 204, 21, 0.7) !important;
      border-radius: 12px;
      position: relative;
    }
    .highlight-pointer {
      position: absolute;
      background: #facc15;
      color: #000;
      font-weight: 800;
      font-size: 11px;
      padding: 5px 10px;
      border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      gap: 5px;
      z-index: 60;
      white-space: nowrap;
    }
  </style>
</head>
<body class="flex flex-col">
  <!-- BARRA DE STATUS ANDROID -->
  <div class="h-8 px-5 flex items-center justify-between text-xs select-none ${isDark ? 'text-zinc-400 bg-[#0f0f0f]' : 'text-zinc-600 bg-white/95'} shrink-0 z-50">
    <span class="font-medium tracking-tight">09:41</span>
    <div class="flex items-center space-x-2">
      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 3L2 21h20L12 3z"/></svg>
      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4z"/></svg>
      <div class="w-5 h-2.5 border border-current rounded-sm p-0.5 flex items-center">
        <div class="h-full w-full bg-current rounded-2xs"></div>
      </div>
    </div>
  </div>

  <!-- CONTEÚDO PRINCIPAL DO APP -->
  <div class="flex-1 flex flex-col relative overflow-hidden">
    ${bodyContent}
  </div>
</body>
</html>`;
}

function ytHeader(highlightSearch = false, highlightMic = false) {
  return `
  <div class="h-12 px-4 flex items-center justify-between bg-[#0f0f0f] border-b border-zinc-900 shrink-0">
    <div class="flex items-center gap-1.5">
      <div class="w-7 h-5 bg-red-600 rounded-md flex items-center justify-center">
        <div class="w-0 h-0 border-y-[4px] border-y-transparent border-l-[7px] border-l-white ml-0.5"></div>
      </div>
      <span class="font-bold tracking-tighter text-lg">YouTube</span>
    </div>
    <div class="flex items-center gap-4">
      <div class="p-1 rounded-full ${highlightSearch ? 'highlight-ring' : ''}">
        <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      </div>
      <div class="p-1 rounded-full ${highlightMic ? 'highlight-ring' : ''}">
        <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
      </div>
      <div class="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-semibold">E</div>
    </div>
  </div>`;
}

function ytBottomNav(activeTab = 'home') {
  return `
  <div class="h-14 border-t border-zinc-800 bg-[#0f0f0f] flex items-center justify-around shrink-0 z-40">
    <div class="flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-white' : 'text-zinc-400'}">
      <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      <span class="text-[10px]">Início</span>
    </div>
    <div class="flex flex-col items-center gap-1 text-zinc-400">
      <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25z"/></svg>
      <span class="text-[10px]">Shorts</span>
    </div>
    <div class="flex flex-col items-center gap-1 text-zinc-400">
      <div class="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-lg leading-none">+</div>
    </div>
    <div class="flex flex-col items-center gap-1 ${activeTab === 'you' ? 'text-white' : 'text-zinc-400'}">
      <div class="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white ${activeTab === 'you' ? 'highlight-ring' : ''}">G</div>
      <span class="text-[10px]">Você</span>
    </div>
  </div>`;
}

function ytVideoPlayer(opts = {}) {
  const {
    showControls = false,
    isPaused = false,
    progressPercent = 35,
    highlightCC = false,
    highlightGear = false,
    highlightFullscreen = false,
    highlightPause = false,
    highlightProgress = false,
    hasSubtitles = false,
    subtitleText = "",
    isAd = false,
    adCountdown = 5,
    highlightSkipAd = false,
    speedBadge = null,
    qualityBadge = null,
  } = opts;

  return `
  <div class="w-full h-56 bg-zinc-950 relative flex flex-col justify-between overflow-hidden border-b border-zinc-800 shrink-0">
    <!-- Thumbnail de fundo do vídeo -->
    <div class="absolute inset-0 bg-gradient-to-tr from-amber-950 via-zinc-900 to-black opacity-80 flex items-center justify-center">
      <span class="text-6xl select-none opacity-40">🎬</span>
    </div>

    <!-- Barra superior do player -->
    <div class="relative z-20 p-2.5 flex items-center justify-between text-white">
      <span class="text-xs font-medium text-zinc-300">▼</span>
      <div class="flex items-center gap-3">
        ${speedBadge ? `<span class="bg-black/70 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-400">${speedBadge}</span>` : ''}
        ${qualityBadge ? `<span class="bg-black/70 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-400">${qualityBadge}</span>` : ''}
        <!-- CC -->
        <div class="p-1 rounded ${highlightCC ? 'highlight-ring bg-black/50' : ''}">
          <span class="text-xs font-bold border border-white px-1 rounded">CC</span>
        </div>
        <!-- Gear -->
        <div class="p-1 rounded ${highlightGear ? 'highlight-ring bg-black/50' : ''}">
          <span class="text-sm">⚙️</span>
        </div>
      </div>
    </div>

    <!-- Centro do player (Pause / Play ou Anúncio) -->
    <div class="relative z-20 flex-1 flex items-center justify-center">
      ${isAd ? `
        <div class="w-full px-4 flex justify-between items-end">
          <span class="bg-yellow-500 text-black text-xs font-black px-2 py-0.5 rounded">Anúncio • 1 de 2</span>
          ${highlightSkipAd ? `
            <div class="highlight-ring">
              <button class="bg-black/90 text-white border border-white/40 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-xl">
                Pular anúncio ⏭
              </button>
            </div>
          ` : `
            <span class="bg-black/80 text-zinc-300 text-xs px-2.5 py-1 rounded">Pular em ${adCountdown}s</span>
          `}
        </div>
      ` : showControls ? `
        <div class="flex items-center gap-8">
          <span class="text-2xl text-white/80">⏮</span>
          <div class="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center text-white ${highlightPause ? 'highlight-ring' : ''}">
            ${isPaused ? '<span class="text-2xl ml-1">▶</span>' : '<span class="text-2xl font-black">||</span>'}
          </div>
          <span class="text-2xl text-white/80">⏭</span>
        </div>
      ` : ''}
    </div>

    <!-- Legendas no player -->
    ${hasSubtitles ? `
      <div class="relative z-20 text-center pb-2 px-4">
        <span class="bg-black/80 text-white font-medium text-xs px-2.5 py-1 rounded leading-relaxed border border-zinc-700 shadow-md">
          "${subtitleText || 'Olá amigos! Sejam muito bem-vindos ao canal de hoje...'}"
        </span>
      </div>
    ` : ''}

    <!-- Barra de progresso e controles inferiores -->
    <div class="relative z-20 p-2 flex items-center gap-2 text-white">
      <div class="flex-1 flex items-center relative ${highlightProgress ? 'highlight-ring p-1 rounded-full' : ''}">
        <div class="w-full h-1 bg-zinc-700 rounded-full relative">
          <div class="h-full bg-red-600 rounded-full" style="width: ${progressPercent}%;"></div>
          <div class="w-3 h-3 bg-red-600 rounded-full absolute -top-1 shadow" style="left: calc(${progressPercent}% - 6px);"></div>
        </div>
      </div>
      <span class="text-[10px] text-zinc-300 font-mono">03:45 / 10:20</span>
      <div class="p-1 rounded ${highlightFullscreen ? 'highlight-ring' : ''}">
        <span class="text-sm">🔲</span>
      </div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// MAPA SVG AUXILIAR PARA O GOOGLE MAPS
// ══════════════════════════════════════════════════════════════
function mapsCanvas(opts = {}) {
  const {
    showBlueDot = true,
    showRoute = false,
    routeColor = '#2563eb', // blue
    routeType = 'solid',    // 'solid' | 'dashed'
    showPin = false,
    pinLabel = "Destino",
    showTraffic = false,
    showParkingPin = false,
    showStreetView = false,
  } = opts;

  return `
  <div class="relative flex-1 bg-[#e8ece9] overflow-hidden flex flex-col justify-center items-center">
    <!-- Grade cartográfica realista -->
    <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <!-- Áreas verdes (Parques) -->
      <path d="M 40,80 Q 90,60 140,90 T 160,200 Q 110,230 50,190 Z" fill="#cbe6c4"/>
      <path d="M 260,350 Q 320,330 380,360 T 390,520 Q 310,550 250,500 Z" fill="#cbe6c4"/>
      
      <!-- Rio / Água -->
      <path d="M -10,320 C 120,300 220,400 420,380" fill="none" stroke="#a5bfd8" stroke-width="24"/>
      
      <!-- Linhas de Ruas -->
      <line x1="0" y1="140" x2="412" y2="140" stroke="#ffffff" stroke-width="10"/>
      <line x1="0" y1="280" x2="412" y2="280" stroke="#ffffff" stroke-width="12"/>
      <line x1="0" y1="460" x2="412" y2="460" stroke="#ffffff" stroke-width="14"/>
      <line x1="120" y1="0" x2="120" y2="700" stroke="#ffffff" stroke-width="10"/>
      <line x1="280" y1="0" x2="280" y2="700" stroke="#ffffff" stroke-width="12"/>
      <line x1="0" y1="600" x2="412" y2="600" stroke="#ffffff" stroke-width="8"/>

      <!-- Nomes de Ruas -->
      <text x="135" y="135" font-size="9" fill="#718096" font-family="sans-serif" font-weight="bold">Rua da Consolação</text>
      <text x="135" y="275" font-size="10" fill="#4a5568" font-family="sans-serif" font-weight="bold">Av. Paulista</text>
      <text x="135" y="455" font-size="9" fill="#718096" font-family="sans-serif" font-weight="bold">Av. 23 de Maio</text>

      ${showRoute ? `
        <!-- Trajeto traçado -->
        ${showTraffic ? `
          <!-- Rota com trânsito -->
          <path d="M 90,520 L 160,460 L 280,280" fill="none" stroke="#2563eb" stroke-width="8" stroke-linecap="round"/>
          <path d="M 280,280 L 320,200" fill="none" stroke="#ea580c" stroke-width="8" stroke-linecap="round"/>
          <path d="M 320,200 L 350,140" fill="none" stroke="#dc2626" stroke-width="8" stroke-linecap="round"/>
        ` : `
          <!-- Rota normal ou pedestre -->
          <path d="M 90,520 L 180,420 L 280,280 L 340,140" fill="none" stroke="${routeColor}" stroke-width="${routeType === 'dashed' ? '6' : '8'}" ${routeType === 'dashed' ? 'stroke-dasharray="8,8"' : ''} stroke-linecap="round"/>
        `}
      ` : ''}
    </svg>

    <!-- Ponto azul de localização do usuário -->
    ${showBlueDot ? `
      <div class="absolute left-20 bottom-36 flex items-center justify-center">
        <div class="w-8 h-8 rounded-full bg-blue-500/20 animate-ping absolute"></div>
        <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg relative z-10"></div>
      </div>
    ` : ''}

    <!-- Pino de Destino -->
    ${showPin ? `
      <div class="absolute right-16 top-32 flex flex-col items-center">
        <div class="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow mb-1">${pinLabel}</div>
        <div class="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">📍</div>
      </div>
    ` : ''}

    <!-- Pino de Estacionamento 'P' -->
    ${showParkingPin ? `
      <div class="absolute left-32 top-60 flex flex-col items-center">
        <div class="bg-amber-400 text-black font-extrabold text-xs px-2 py-1 rounded shadow-lg flex items-center gap-1 border border-black/20">
          <span>🅿️</span> Você estacionou aqui
        </div>
      </div>
    ` : ''}

    <!-- Street View 360 Fullscreen -->
    ${showStreetView ? `
      <div class="absolute inset-0 bg-zinc-800 flex flex-col justify-between p-4 bg-cover bg-center" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80');">
        <div class="flex items-center justify-between text-white">
          <div class="bg-black/60 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
            <span>🔄 Street View 360°</span>
          </div>
          <span class="text-xs bg-black/60 px-2 py-1 rounded">Avenida Paulista, 1000</span>
        </div>
        <div class="flex flex-col items-center text-white text-center">
          <div class="w-14 h-14 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-2xl animate-pulse">
            👆
          </div>
          <p class="text-xs mt-2 font-medium bg-black/60 px-3 py-1 rounded">Gire a tela para olhar os prédios e calçadas</p>
        </div>
        <div class="text-[10px] text-zinc-300">© 2026 Google</div>
      </div>
    ` : ''}
  </div>`;
}

function mapsTopSearch(opts = {}) {
  const { query = "", highlightInput = false, highlightProfile = false, highlightBack = false } = opts;
  return `
  <div class="absolute top-2 left-3 right-3 z-30 flex items-center">
    <div class="flex-1 h-12 bg-white rounded-full shadow-md border border-zinc-200 px-3.5 flex items-center justify-between ${highlightInput ? 'highlight-ring' : ''}">
      <div class="flex items-center gap-3">
        ${highlightBack ? `
          <span class="text-zinc-600 font-bold text-lg">←</span>
        ` : `
          <span class="text-zinc-600 text-lg">☰</span>
        `}
        <span class="text-sm font-medium ${query ? 'text-zinc-900' : 'text-zinc-400'}">
          ${query || 'Pesquise aqui...'}
        </span>
      </div>
      <div class="flex items-center gap-2 text-zinc-600">
        <span class="text-base">🎙️</span>
        <div class="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ${highlightProfile ? 'highlight-ring' : ''}">
          E
        </div>
      </div>
    </div>
  </div>`;
}

function mapsBottomBar(activeTab = 'explore') {
  return `
  <div class="h-14 bg-white border-t border-zinc-200 flex items-center justify-around shrink-0 z-30 text-zinc-600">
    <div class="flex flex-col items-center gap-0.5 ${activeTab === 'explore' ? 'text-blue-600 font-semibold' : ''}">
      <span class="text-lg">🗺️</span>
      <span class="text-[10px]">Explorar</span>
    </div>
    <div class="flex flex-col items-center gap-0.5">
      <span class="text-lg">🚗</span>
      <span class="text-[10px]">Ir</span>
    </div>
    <div class="flex flex-col items-center gap-0.5 ${activeTab === 'saved' ? 'text-blue-600 font-semibold highlight-ring p-1 rounded-lg' : ''}">
      <span class="text-lg">🔖</span>
      <span class="text-[10px]">Salvos</span>
    </div>
    <div class="flex flex-col items-center gap-0.5">
      <span class="text-lg">💬</span>
      <span class="text-[10px]">Contribuir</span>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// DICIONÁRIO COMPLETO COM TODOS OS 30 GUIAS
// ══════════════════════════════════════════════════════════════
const ALL_MOCKS = {
  youtube: {
    "pesquisar-video-youtube": [
      // 1: Home + Lupa
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch()}${ytVideoPlayer()}<div class="p-4 flex-1 flex flex-col justify-center items-center text-center"><div class="highlight-pointer top-2 right-10">👆 Toque na lupa</div><p class="text-sm font-bold">O que você quer assistir hoje?</p></div>${ytBottomNav('home')}</div>`,
      // 2: Digitou
      `<div class="h-14 px-3 flex items-center gap-2 bg-[#212121] shrink-0"><span class="text-white">←</span><div class="flex-1 bg-[#121212] rounded-full px-4 py-2 flex items-center justify-between highlight-ring"><span class="text-sm font-medium text-white">Receita de bolo de cenoura|</span><span class="text-xs text-zinc-400">✕</span></div></div><div class="flex-1 bg-[#0f0f0f] p-4 text-xs space-y-3"><div class="highlight-pointer top-20">👆 Digite no teclado</div><div class="p-2 border-b border-zinc-800 text-white font-medium">receita de bolo de cenoura fofinho</div><div class="p-2 border-b border-zinc-800 text-zinc-400">receita de bolo de cenoura com chocolate</div></div>`,
      // 3: Resultados
      `<div class="p-3 bg-[#0f0f0f] flex-1 overflow-y-auto"><div class="highlight-ring p-2 bg-zinc-900 rounded-xl mb-3"><div class="highlight-pointer -top-3 right-4">👆 Toque no vídeo</div><div class="h-40 bg-amber-900/60 rounded-lg flex items-center justify-center text-3xl">🥕 🍰</div><p class="text-sm font-bold text-white mt-2">Bolo de Cenoura Fofinho Fácil</p></div></div>${ytBottomNav('home')}`
    ],

    "aumentar-volume-youtube": [
      // 1: Volume lateral
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="absolute right-4 top-24 h-44 w-11 bg-zinc-900/90 border border-zinc-700 rounded-2xl flex flex-col items-center justify-end p-2 highlight-ring shadow-2xl"><div class="highlight-pointer -left-44 top-10">👆 Aperte o botão de volume</div><div class="w-full bg-blue-500 rounded-xl h-28 mb-2"></div><span class="text-xs">🔊</span></div><div class="p-4 flex-1 text-center"><p class="text-sm font-medium text-zinc-300">Aperte o botão na lateral do aparelho para aumentar</p></div>${ytBottomNav('home')}</div>`,
      // 2: Controles brancos
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ showControls: true })}<div class="p-4 flex-1 text-center"><div class="highlight-pointer top-28 left-20">👆 Toque no meio do vídeo</div><p class="text-sm font-medium text-zinc-300">Os botões brancos aparecem na tela</p></div>${ytBottomNav('home')}</div>`,
      // 3: Quadrado tela cheia
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ showControls: true, highlightFullscreen: true })}<div class="p-4 flex-1 text-center"><div class="highlight-pointer top-44 right-10">👆 Toque para tela cheia</div><p class="text-sm font-medium text-zinc-300">Toque no quadrado para deitar a tela</p></div>${ytBottomNav('home')}</div>`
    ],

    "salvar-video-youtube": [
      // 1: Vídeo tocando
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="p-3 border-b border-zinc-800"><h2 class="text-sm font-bold">Como Cuidar de Orquídeas em Casa</h2></div>${ytBottomNav('home')}</div>`,
      // 2: Botão Salvar
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="p-3"><h2 class="text-sm font-bold mb-3">Como Cuidar de Orquídeas</h2><div class="flex gap-2 overflow-x-auto"><span class="bg-zinc-800 px-3 py-1.5 rounded-full text-xs">👍 Gostei</span><span class="bg-zinc-800 px-3 py-1.5 rounded-full text-xs">↗ Compartilhar</span><div class="highlight-ring"><span class="bg-zinc-800 px-3 py-1.5 rounded-full text-xs font-bold text-yellow-400">➕ Salvar</span></div></div><div class="highlight-pointer top-80 right-8">👆 Toque em Salvar</div></div>${ytBottomNav('home')}</div>`,
      // 3: Salvo em Assistir mais tarde
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="p-3"><h2 class="text-sm font-bold mb-3">Como Cuidar de Orquídeas</h2></div><div class="mt-auto bg-zinc-900 border-t border-zinc-800 p-4 rounded-t-2xl highlight-ring"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="text-green-400 font-bold">✔</span><span class="text-sm font-bold text-white">Salvo em "Assistir mais tarde"</span></div><span class="text-xs text-blue-400 font-bold">Alterar</span></div></div>${ytBottomNav('home')}</div>`
    ],

    "pausar-e-voltar-video-youtube": [
      // 1: Toque
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ showControls: true })}<div class="p-4 flex-1 text-center"><p class="text-sm text-zinc-400">Dê um toque no centro do vídeo</p></div>${ytBottomNav('home')}</div>`,
      // 2: Botão de pausa destacado
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ showControls: true, highlightPause: true })}<div class="p-4 flex-1 text-center"><div class="highlight-pointer top-32 left-28">👆 Toque nas duas barras para pausar</div></div>${ytBottomNav('home')}</div>`,
      // 3: Bolinha vermelha voltando
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ showControls: true, isPaused: true, highlightProgress: true, progressPercent: 18 })}<div class="p-4 flex-1 text-center"><div class="highlight-pointer top-52 left-20">👆 Arraste para trás para voltar a cena</div></div>${ytBottomNav('home')}</div>`
    ],

    "pular-anuncios-youtube": [
      // 1: Contagem
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ isAd: true, adCountdown: 5 })}<div class="p-4 flex-1 text-center"><p class="text-sm text-zinc-400">Aguarde a contagem de 5 segundos...</p></div>${ytBottomNav('home')}</div>`,
      // 2: Botão Pular Anúncio destacado
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ isAd: true, highlightSkipAd: true })}<div class="p-4 flex-1 text-center"><div class="highlight-pointer top-44 right-8">👆 Toque em Pular anúncio</div></div>${ytBottomNav('home')}</div>`,
      // 3: Vídeo principal iniciando
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="p-4 flex-1 text-center"><span class="text-green-400 font-bold text-base">✔ Propaganda finalizada!</span><p class="text-xs text-zinc-400 mt-1">Seu vídeo começou a tocar sem interrupções.</p></div>${ytBottomNav('home')}</div>`
    ],

    "inscrever-se-canal-youtube": [
      // 1: Foto e nome
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="p-3 border-b border-zinc-800"><h2 class="text-sm font-bold">Dicas de Saúde para a Terceira Idade</h2><div class="mt-3 flex items-center justify-between"><div class="flex items-center gap-2 highlight-ring p-1 rounded-lg"><div class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">MS</div><div><p class="text-xs font-bold text-white">Médico da Família</p><p class="text-[10px] text-zinc-400">1,2 mi inscritos</p></div></div><button class="bg-white text-black font-bold text-xs px-3.5 py-1.5 rounded-full">Inscrever-se</button></div></div>${ytBottomNav('home')}</div>`,
      // 2: Botão Inscrever-se destacado
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="p-3 border-b border-zinc-800"><h2 class="text-sm font-bold">Dicas de Saúde</h2><div class="mt-3 flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">MS</div><p class="text-xs font-bold text-white">Médico da Família</p></div><div class="highlight-ring"><button class="bg-white text-black font-bold text-xs px-4 py-1.5 rounded-full">Inscrever-se</button></div></div><div class="highlight-pointer top-72 right-6">👆 Toque em Inscrever-se</div></div>${ytBottomNav('home')}</div>`,
      // 3: Sininho ativado
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="p-3 border-b border-zinc-800"><h2 class="text-sm font-bold">Dicas de Saúde</h2><div class="mt-3 flex items-center justify-between"><p class="text-xs font-bold text-white">Médico da Família</p><div class="flex items-center gap-2"><button class="bg-zinc-800 text-zinc-300 font-medium text-xs px-3 py-1.5 rounded-full">Inscrito ✔</button><div class="highlight-ring p-1 rounded-full"><span class="text-sm">🔔</span></div></div></div><div class="highlight-pointer top-72 right-4">👆 Toque no sino para receber novos vídeos</div></div>${ytBottomNav('home')}</div>`
    ],

    "ativar-legendas-youtube": [
      // 1: Controles
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ showControls: true })}<div class="p-4 flex-1 text-center"><p class="text-sm text-zinc-400">Dê um toque na tela</p></div>${ytBottomNav('home')}</div>`,
      // 2: Ícone CC destacado
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ showControls: true, highlightCC: true })}<div class="p-4 flex-1 text-center"><div class="highlight-pointer top-10 right-14">👆 Toque no quadradinho CC</div></div>${ytBottomNav('home')}</div>`,
      // 3: Legendas na tela
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ hasSubtitles: true, subtitleText: "Adicione duas xícaras de farinha e mexa bem..." })}<div class="p-4 flex-1 text-center"><span class="text-green-400 font-bold text-sm">✔ Legendas ativadas em português</span></div>${ytBottomNav('home')}</div>`
    ],

    "diminuir-velocidade-video-youtube": [
      // 1: Engrenagem
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ showControls: true, highlightGear: true })}<div class="p-4 flex-1 text-center"><div class="highlight-pointer top-10 right-6">👆 Toque na engrenagem</div></div>${ytBottomNav('home')}</div>`,
      // 2: Menu Velocidade
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="mt-auto bg-zinc-900 border-t border-zinc-800 p-3 rounded-t-2xl space-y-2"><p class="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Configurações</p><div class="p-2.5 rounded-lg bg-zinc-800 flex items-center justify-between highlight-ring"><span class="text-xs font-bold text-white">Velocidade da reprodução</span><span class="text-xs text-yellow-400 font-bold">Normal ›</span></div><div class="highlight-pointer bottom-20 left-10">👆 Toque em Velocidade</div></div>${ytBottomNav('home')}</div>`,
      // 3: 0.75x selecionado
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="mt-auto bg-zinc-900 border-t border-zinc-800 p-3 rounded-t-2xl space-y-1.5"><p class="text-xs font-bold text-zinc-400 mb-2">Velocidade da reprodução</p><div class="p-2 rounded text-xs text-zinc-400">0.5x (muito lenta)</div><div class="p-2 rounded text-xs text-black font-bold bg-yellow-400 highlight-ring flex justify-between"><span>0.75x (um pouco mais lenta)</span><span>✔</span></div><div class="p-2 rounded text-xs text-zinc-300">Normal (padrão)</div><div class="highlight-pointer bottom-24 right-8">👆 Escolha 0.75x</div></div>${ytBottomNav('home')}</div>`,
      // 4: Tocando em 0.75x
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ speedBadge: "0.75x" })}<div class="p-4 flex-1 text-center"><span class="text-green-400 font-bold text-sm">✔ Vídeo reproduzindo em ritmo mais calmo!</span></div>${ytBottomNav('home')}</div>`
    ],

    "ver-historico-videos-youtube": [
      // 1: Aba Você
      `<div class="relative flex-1 flex flex-col">${ytHeader()}<div class="flex-1 p-4 flex flex-col justify-center items-center text-center"><p class="text-sm text-zinc-400">Toque na aba "Você" no rodapé</p><div class="highlight-pointer bottom-16 right-6">👆 Toque na aba Você</div></div>${ytBottomNav('you')}</div>`,
      // 2: Carrossel de Histórico
      `<div class="relative flex-1 flex flex-col bg-[#0f0f0f] p-4"><div class="flex items-center justify-between mb-2 highlight-ring p-1.5 rounded-xl"><div class="highlight-pointer -top-3 left-4">👆 Seção Histórico</div><span class="text-base font-bold text-white">Histórico</span><span class="text-xs text-blue-400 font-bold">Ver tudo</span></div><div class="flex gap-2.5 overflow-x-auto"><div class="w-32 bg-zinc-800 rounded-lg p-1 shrink-0"><div class="h-20 bg-amber-900/60 rounded flex items-center justify-center text-xl">🥕</div><p class="text-[11px] font-bold text-white mt-1 truncate">Bolo de Cenoura</p></div><div class="w-32 bg-zinc-800 rounded-lg p-1 shrink-0"><div class="h-20 bg-blue-900/60 rounded flex items-center justify-center text-xl">⛪</div><p class="text-[11px] font-bold text-white mt-1 truncate">Santa Missa</p></div></div></div>${ytBottomNav('you')}`,
      // 3: Reabrindo o vídeo
      `<div class="relative flex-1 flex flex-col bg-[#0f0f0f] p-4"><div class="flex gap-2.5"><div class="w-36 bg-zinc-800 rounded-lg p-1.5 highlight-ring"><div class="highlight-pointer -top-3 right-2">👆 Toque no vídeo para rever</div><div class="h-20 bg-amber-900/60 rounded flex items-center justify-center text-2xl">🥕</div><p class="text-xs font-bold text-white mt-1">Bolo de Cenoura</p><span class="text-[10px] text-zinc-400">Continuar de 03:45</span></div></div></div>${ytBottomNav('you')}`
    ],

    "compartilhar-video-familia-youtube": [
      // 1: Barra de botões
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="p-3 border-b border-zinc-800"><h2 class="text-sm font-bold">Receita de Pão Caseiro Fofinho</h2></div>${ytBottomNav('home')}</div>`,
      // 2: Botão Compartilhar
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="p-3"><h2 class="text-sm font-bold mb-3">Receita de Pão Caseiro</h2><div class="flex gap-2"><span class="bg-zinc-800 px-3 py-1.5 rounded-full text-xs">👍 Gostei</span><div class="highlight-ring"><span class="bg-zinc-800 px-3.5 py-1.5 rounded-full text-xs font-bold text-yellow-400">↗ Compartilhar</span></div><span class="bg-zinc-800 px-3 py-1.5 rounded-full text-xs">➕ Salvar</span></div><div class="highlight-pointer top-80 left-28">👆 Toque em Compartilhar</div></div>${ytBottomNav('home')}</div>`,
      // 3: Escolher WhatsApp
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="mt-auto bg-zinc-900 border-t border-zinc-800 p-4 rounded-t-2xl"><p class="text-xs font-bold text-zinc-400 mb-3">Compartilhar com...</p><div class="flex items-center gap-4"><div class="flex flex-col items-center gap-1 highlight-ring p-2 rounded-xl"><div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-2xl text-white">💬</div><span class="text-xs font-bold text-white">WhatsApp</span></div><div class="highlight-pointer bottom-28 left-6">👆 Escolha o WhatsApp</div></div></div>${ytBottomNav('home')}</div>`,
      // 4: WhatsApp pronto
      `<div class="relative flex-1 flex flex-col bg-[#0b141a] p-3 text-white"><div class="h-10 border-b border-zinc-800 flex items-center gap-2 mb-4"><span class="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-xs">F</span><span class="text-xs font-bold">Família Reunida</span></div><div class="mt-auto bg-[#1f2c34] p-3 rounded-xl border border-zinc-700 max-w-xs ml-auto highlight-ring"><div class="highlight-pointer -top-3 left-4">👆 Toque na seta verde para enviar</div><div class="h-24 bg-zinc-900 rounded mb-2 flex items-center justify-center text-3xl">🍞</div><p class="text-xs font-bold text-white">Receita de Pão Caseiro Fofinho</p><span class="text-[10px] text-blue-400">https://youtu.be/...</span></div></div>`
    ],

    "assistir-transmissoes-ao-vivo-youtube": [
      // 1: Busca
      `<div class="h-14 px-3 flex items-center gap-2 bg-[#212121] shrink-0"><span class="text-white">←</span><div class="flex-1 bg-[#121212] rounded-full px-4 py-2 flex items-center justify-between highlight-ring"><span class="text-sm font-medium text-white">Missa ao vivo|</span><span class="text-xs text-zinc-400">✕</span></div></div><div class="flex-1 p-4 bg-[#0f0f0f] flex flex-col justify-center items-center text-center"><div class="highlight-pointer top-20">👆 Digite Missa ao vivo</div><p class="text-sm font-bold text-white">Pesquise transmissões em tempo real</p></div>${ytBottomNav('home')}`,
      // 2: Tag vermelha
      `<div class="h-14 px-3 flex items-center gap-3 bg-[#0f0f0f] border-b border-zinc-900 shrink-0"><span class="text-white">←</span><span class="text-sm font-medium text-white">Resultados</span></div><div class="flex-1 p-3"><div class="highlight-ring p-2 bg-zinc-900 rounded-xl"><div class="highlight-pointer -top-3 right-4">🔴 Procure a tag AO VIVO</div><div class="h-40 bg-blue-950 rounded flex items-center justify-center text-4xl">⛪</div><div class="mt-2 flex items-center gap-2"><span class="bg-red-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded">AO VIVO</span><span class="text-xs font-bold text-white">Santa Missa de Aparecida</span></div></div></div>${ytBottomNav('home')}`,
      // 3: Vídeo aberto ao vivo
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="p-3 border-b border-zinc-800 flex items-center justify-between"><div><span class="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5">AO VIVO</span><span class="text-xs font-bold text-white">Santa Missa ao Vivo</span></div><span class="text-xs text-red-500 font-bold">14 mil assistindo</span></div><div class="p-3 flex-1 bg-zinc-950"><p class="text-xs text-zinc-400">Bate-papo ao vivo ativo...</p></div>${ytBottomNav('home')}`
    ],

    "melhorar-qualidade-imagem-youtube": [
      // 1: Engrenagem
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ showControls: true, highlightGear: true })}<div class="p-4 flex-1 text-center"><div class="highlight-pointer top-10 right-6">👆 Toque na engrenagem</div></div>${ytBottomNav('home')}</div>`,
      // 2: Opção Qualidade
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="mt-auto bg-zinc-900 border-t border-zinc-800 p-3 rounded-t-2xl space-y-2"><p class="text-xs font-bold text-zinc-400 mb-2">Configurações do vídeo</p><div class="p-2.5 rounded-lg bg-zinc-800 flex items-center justify-between highlight-ring"><span class="text-xs font-bold text-white">Qualidade</span><span class="text-xs text-yellow-400 font-bold">Automática (480p) ›</span></div><div class="highlight-pointer bottom-20 left-10">👆 Toque em Qualidade</div></div>${ytBottomNav('home')}</div>`,
      // 3: Mais alta HD
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="mt-auto bg-zinc-900 border-t border-zinc-800 p-3 rounded-t-2xl space-y-1.5"><p class="text-xs font-bold text-zinc-400 mb-2">Qualidade do vídeo</p><div class="p-2 rounded text-xs text-zinc-400">Economia de dados</div><div class="p-2 rounded text-xs text-black font-bold bg-yellow-400 highlight-ring flex justify-between"><span>Qualidade de imagem mais alta (HD)</span><span>✔</span></div><div class="highlight-pointer bottom-24 right-6">👆 Escolha Imagem mais alta</div></div>${ytBottomNav('home')}</div>`,
      // 4: Imagem HD nítida
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ qualityBadge: "1080p HD" })}<div class="p-4 flex-1 text-center"><span class="text-green-400 font-bold text-sm">✔ Imagem nítida em Alta Definição!</span></div>${ytBottomNav('home')}</div>`
    ],

    "desativar-reproducao-automatica-youtube": [
      // 1: Vídeo
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="p-4 flex-1 text-center"><p class="text-sm text-zinc-400">Abra qualquer vídeo no YouTube</p></div>${ytBottomNav('home')}</div>`,
      // 2: Chavinha no topo
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ showControls: true })}<div class="p-4 flex-1 text-center"><div class="highlight-pointer top-10 right-28">👆 Olhe a chavinha de reprodução</div></div>${ytBottomNav('home')}</div>`,
      // 3: Desligada
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer({ showControls: true })}<div class="p-4 flex-1 text-center"><div class="highlight-pointer top-10 right-28">✔ Reprodução automática desligada!</div><p class="text-xs text-zinc-400 mt-6">Os vídeos não tocarão mais sozinhos sem você pedir.</p></div>${ytBottomNav('home')}</div>`
    ],

    "pesquisar-por-voz-youtube": [
      // 1: Ícone de microfone
      `<div class="relative flex-1 flex flex-col">${ytHeader(false, true)}<div class="p-4 flex-1 flex flex-col justify-center items-center text-center"><div class="highlight-pointer top-2 right-16">👆 Toque no microfone</div><p class="text-sm font-bold text-white">Pesquisar falando</p></div>${ytBottomNav('home')}</div>`,
      // 2: Janela de permissão
      `<div class="relative flex-1 flex flex-col bg-[#0f0f0f]"><div class="m-auto bg-zinc-900 border border-zinc-700 p-5 rounded-2xl max-w-xs text-center"><span class="text-3xl">🎙️</span><h3 class="text-sm font-bold text-white mt-2">Permitir gravar áudio?</h3><p class="text-xs text-zinc-400 mt-1 mb-4">O YouTube precisa de acesso ao microfone para ouvir você.</p><div class="highlight-ring mb-2"><button class="w-full bg-blue-600 text-white font-bold text-xs py-2 rounded-lg">Durante o uso do app</button></div><div class="highlight-pointer bottom-24 right-4">👆 Toque em Permitir</div></div></div>`,
      // 3: Tela de escuta
      `<div class="relative flex-1 flex flex-col bg-zinc-950 p-6 flex flex-col items-center justify-center text-center"><div class="w-24 h-24 rounded-full bg-red-600/30 flex items-center justify-center animate-pulse mb-4 highlight-ring"><div class="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl text-white">🎙️</div></div><h3 class="text-lg font-bold text-white">Ouvindo você...</h3><p class="text-sm text-yellow-400 font-bold mt-2">"Músicas antigas dos anos 70"</p><span class="text-xs text-zinc-400 mt-1">Fale com calma e clareza</span></div>`
    ],

    "criar-lista-musicas-favoritas-youtube": [
      // 1: Salvar na música
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="p-3"><h2 class="text-sm font-bold mb-3">Roberto Carlos — As Melhores</h2><div class="flex gap-2"><div class="highlight-ring"><span class="bg-zinc-800 px-3.5 py-1.5 rounded-full text-xs font-bold text-yellow-400">➕ Salvar</span></div></div><div class="highlight-pointer top-80 left-6">👆 Toque em Salvar</div></div>${ytBottomNav('home')}</div>`,
      // 2: Nova playlist
      `<div class="relative flex-1 flex flex-col">${ytVideoPlayer()}<div class="mt-auto bg-zinc-900 border-t border-zinc-800 p-4 rounded-t-2xl"><div class="p-2.5 rounded-lg bg-zinc-800 flex items-center gap-2 highlight-ring text-white font-bold text-xs"><span class="text-base font-bold text-blue-400">+</span> Nova playlist</div><div class="highlight-pointer bottom-20 left-10">👆 Toque em Nova playlist</div></div>${ytBottomNav('home')}</div>`,
      // 3: Digitar título
      `<div class="relative flex-1 flex flex-col bg-black/80 flex items-center justify-center p-4"><div class="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-2xl"><h3 class="text-sm font-bold text-white mb-2">Nova playlist</h3><input type="text" value="Minhas Músicas Favoritas" class="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-xs text-white mb-4 highlight-ring" /><div class="flex justify-end gap-2"><button class="text-xs text-zinc-400 px-3 py-1.5">Cancelar</button><button class="bg-blue-600 text-white font-bold text-xs px-4 py-1.5 rounded highlight-ring">Criar</button></div></div><div class="highlight-pointer top-72 right-8">👆 Toque em Criar</div></div>`,
      // 4: Playlist na aba Você
      `<div class="relative flex-1 flex flex-col bg-[#0f0f0f] p-4"><h3 class="text-sm font-bold text-white mb-3">Suas Playlists</h3><div class="highlight-ring p-3 bg-zinc-900 rounded-xl flex items-center gap-3"><div class="w-14 h-14 bg-red-900/60 rounded-lg flex items-center justify-center text-xl">🎵</div><div><p class="text-xs font-bold text-white">Minhas Músicas Favoritas</p><p class="text-[10px] text-zinc-400">1 vídeo • Criada agora</p></div></div><div class="highlight-pointer top-36 right-6">✔ Playlist criada com sucesso!</div></div>${ytBottomNav('you')}`
    ],
  },

  // ════════════════════════════════════════════════════════════
  // GOOGLE MAPS (15 TAREFAS)
  // ════════════════════════════════════════════════════════════
  maps: {
    "colocar-endereco-maps": [
      // 1: Barra de busca
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch({ highlightInput: true })}${mapsCanvas()}<div class="highlight-pointer top-16 left-12">👆 Toque em Pesquise aqui</div>${mapsBottomBar('explore')}</div>`,
      // 2: Digitado
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch({ query: "Av. Paulista, 1000", highlightInput: true })}${mapsCanvas({ showPin: true, pinLabel: "Av. Paulista, 1000" })}<div class="highlight-pointer top-16 left-12">👆 Selecione o endereço</div>${mapsBottomBar('explore')}</div>`,
      // 3: Botão Rotas
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch({ query: "Av. Paulista, 1000" })}${mapsCanvas({ showPin: true })}<div class="mt-auto bg-white p-4 border-t border-zinc-200 z-20 shadow-lg"><h3 class="text-sm font-bold text-zinc-900">Avenida Paulista, 1000</h3><p class="text-xs text-zinc-500 mb-3">Bela Vista, São Paulo - SP</p><div class="highlight-ring inline-block"><button class="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2"><span>↗</span> Rotas</button></div><div class="highlight-pointer bottom-20 left-28">👆 Toque no botão Rotas</div></div>${mapsBottomBar('explore')}</div>`,
      // 4: Botão Iniciar
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true, routeColor: '#2563eb' })}<div class="mt-auto bg-white p-4 border-t border-zinc-200 z-20 shadow-xl flex items-center justify-between"><div><span class="text-xl font-black text-green-700">22 min</span><span class="text-xs text-zinc-500 block">7,4 km • Via Av. 23 de Maio</span></div><div class="highlight-ring"><button class="bg-blue-600 text-white font-black text-xs px-6 py-3 rounded-full flex items-center gap-2 shadow-lg"><span>▶</span> Iniciar</button></div><div class="highlight-pointer bottom-24 right-10">👆 Toque em Iniciar para ouvir o GPS</div></div></div>`
    ],

    "caminho-onibus-maps": [
      // 1: Rota
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true })}${mapsBottomBar('explore')}</div>`,
      // 2: Ícone Ônibus
      `<div class="relative flex-1 flex flex-col"><div class="h-16 bg-white border-b border-zinc-200 p-2 flex items-center justify-around z-20"><span class="text-xs text-zinc-500">🚗 Carro</span><div class="highlight-ring p-1.5 rounded-lg bg-blue-50"><span class="text-xs font-bold text-blue-700">🚌 Ônibus / Metrô</span></div><span class="text-xs text-zinc-500">🚶 A pé</span></div><div class="highlight-pointer top-20 left-36">👆 Escolha a opção Ônibus</div>${mapsCanvas({ showRoute: true, routeColor: '#3b82f6' })}</div>`,
      // 3: Linha de ônibus
      `<div class="relative flex-1 flex flex-col bg-white"><div class="p-3 bg-zinc-100 border-b border-zinc-200"><h3 class="text-xs font-bold text-zinc-600">Linhas recomendadas</h3></div><div class="p-3 space-y-2.5 flex-1"><div class="highlight-ring p-3 rounded-xl border border-zinc-200 shadow-sm bg-white"><div class="flex items-center justify-between mb-1.5"><div class="flex items-center gap-2"><span class="bg-green-700 text-white font-black text-xs px-2 py-0.5 rounded">N106-11</span><span class="text-xs font-bold">Terminal Pq. Dom Pedro</span></div><span class="text-sm font-black text-zinc-900">38 min</span></div><p class="text-xs text-zinc-500">Passa a cada 10 min no ponto da Praça</p></div><div class="highlight-pointer top-36 right-6">👆 Escolha a linha</div></div></div>`,
      // 4: Detalhes dos pontos
      `<div class="relative flex-1 flex flex-col bg-white p-4 text-xs"><h3 class="text-sm font-bold text-zinc-900 mb-3">Instruções da Viagem</h3><div class="space-y-4 border-l-2 border-green-600 ml-3 pl-4 relative"><div class="relative"><span class="w-3 h-3 rounded-full bg-green-600 absolute -left-5.5 top-0.5 border-2 border-white"></span><p class="font-bold text-zinc-900">Embarque: Parada 1 — Praça da Sé</p><span class="text-zinc-500">Pegar ônibus N106-11</span></div><div class="relative"><span class="w-2.5 h-2.5 rounded-full bg-zinc-400 absolute -left-5 top-0.5"></span><p class="text-zinc-600 font-medium">Passar por 7 paradas (18 min)</p></div><div class="relative highlight-ring p-1.5 rounded-lg"><span class="w-3 h-3 rounded-full bg-red-600 absolute -left-5.5 top-2 border-2 border-white"></span><p class="font-bold text-red-600">Desembarque: Parada MASP / Av. Paulista</p><span class="text-zinc-600 font-medium">Seu destino estará a 50 metros</span></div></div><div class="highlight-pointer bottom-36 left-12">👆 Veja onde você deve descer</div></div>`
    ],

    "compartilhar-localizacao-maps": [
      // 1: Perfil
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch({ highlightProfile: true })}${mapsCanvas()}<div class="highlight-pointer top-16 right-4">👆 Toque na sua foto de perfil</div>${mapsBottomBar('explore')}</div>`,
      // 2: Compartilhar local
      `<div class="relative flex-1 flex flex-col bg-white"><div class="p-4 border-b border-zinc-200"><p class="text-xs font-bold text-zinc-500">Conta Google</p></div><div class="p-3 space-y-2"><div class="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 highlight-ring"><span class="text-xl">📡</span><div><p class="text-xs font-bold text-blue-900">Compartilhar local</p><p class="text-[10px] text-blue-700">Mostre onde você está para familiares</p></div></div><div class="highlight-pointer top-32 left-10">👆 Toque em Compartilhar local</div></div></div>`,
      // 3: Tempo
      `<div class="relative flex-1 flex flex-col bg-white p-4"><h3 class="text-sm font-bold text-zinc-900 mb-2">Compartilhar em tempo real</h3><p class="text-xs text-zinc-500 mb-4">Por quanto tempo deseja compartilhar?</p><div class="highlight-ring p-3 rounded-xl bg-zinc-50 flex items-center justify-between mb-4"><span class="text-xs font-bold text-zinc-800">Por 1 hora</span><span class="text-xs text-blue-600 font-bold">Alterar tempo</span></div><div class="highlight-pointer top-36 right-6">👆 Escolha o tempo</div></div>`,
      // 4: WhatsApp
      `<div class="relative flex-1 flex flex-col bg-white p-4"><h3 class="text-sm font-bold text-zinc-900 mb-4">Enviar trajeto para:</h3><div class="flex items-center gap-3 highlight-ring p-3 rounded-xl bg-green-50"><div class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-xl">💬</div><div><p class="text-xs font-bold text-green-950">Enviar no WhatsApp</p><p class="text-[10px] text-green-800">Seus filhos verão o carro em tempo real</p></div></div><div class="highlight-pointer top-32 right-6">👆 Toque no WhatsApp</div></div>`
    ],

    "salvar-endereco-casa-maps": [
      // 1: Aba Salvos
      `<div class="relative flex-1 flex flex-col">${mapsCanvas()}<div class="highlight-pointer bottom-16 right-28">👆 Toque em Salvos</div>${mapsBottomBar('saved')}</div>`,
      // 2: Escolher Casa
      `<div class="relative flex-1 flex flex-col bg-white p-4 text-xs"><h3 class="text-sm font-bold text-zinc-900 mb-3">Seus Locais</h3><div class="highlight-ring p-3 rounded-xl bg-zinc-50 flex items-center gap-3"><span class="text-2xl">🏠</span><div><p class="font-bold text-zinc-900 text-xs">Definir endereço de Casa</p><p class="text-[10px] text-zinc-500">Volte para casa com 1 toque no GPS</p></div></div><div class="highlight-pointer top-28 right-6">👆 Toque em Casa</div></div>${mapsBottomBar('saved')}`,
      // 3: Digitando
      `<div class="relative flex-1 flex flex-col bg-white p-4"><h3 class="text-sm font-bold text-zinc-900 mb-2">Onde fica a sua casa?</h3><input type="text" value="Rua das Flores, 120 - Jardim América" class="w-full border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-900 font-medium highlight-ring mb-4" /><div class="highlight-pointer top-24 right-4">👆 Digite sua rua e número</div></div>`,
      // 4: Salvo com casinha
      `<div class="relative flex-1 flex flex-col">${mapsCanvas()}<div class="absolute left-24 top-48 bg-white border border-zinc-200 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 highlight-ring"><span class="text-base">🏠</span><span class="text-xs font-bold text-zinc-900">Casa</span></div><div class="highlight-pointer top-60 left-16">✔ Endereço de Casa salvo com sucesso!</div>${mapsBottomBar('explore')}</div>`
    ],

    "encontrar-farmacia-hospital-maps": [
      // 1: Carrossel
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch()}<div class="absolute top-16 left-3 right-3 z-20 flex gap-2 overflow-x-auto"><span class="bg-white border border-zinc-200 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">🍽 Restaurantes</span><span class="bg-white border border-zinc-200 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">⛽ Postos</span></div>${mapsCanvas()}${mapsBottomBar('explore')}</div>`,
      // 2: Botão Farmácias destacado
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch()}<div class="absolute top-16 left-3 right-3 z-20 flex gap-2"><div class="highlight-ring"><span class="bg-white border border-zinc-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-red-600 shadow-sm flex items-center gap-1">💊 Farmácias</span></div><span class="bg-white border border-zinc-200 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">🏥 Hospitais</span></div><div class="highlight-pointer top-28 left-6">👆 Toque no botão Farmácias</div>${mapsCanvas()}${mapsBottomBar('explore')}</div>`,
      // 3: Pinos no mapa
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch({ query: "Farmácias próximas" })}${mapsCanvas({ showPin: true, pinLabel: "Drogaria São Paulo (Aberto)" })}<div class="mt-auto bg-white p-3 border-t border-zinc-200 z-20"><div class="highlight-ring p-2 rounded-lg bg-green-50"><p class="text-xs font-bold text-green-900">Drogasil — 250m de distância</p><p class="text-[10px] text-green-700">Aberto agora • Fecha às 22:00</p></div></div></div>`
    ],

    "ver-foto-da-fachada-streetview-maps": [
      // 1: Local
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch({ query: "Consultório Médico - Av. Paulista, 1000" })}${mapsCanvas({ showPin: true })}${mapsBottomBar('explore')}</div>`,
      // 2: Miniatura Street View
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch({ query: "Av. Paulista, 1000" })}${mapsCanvas({ showPin: true })}<div class="absolute left-3 bottom-16 z-20 highlight-ring p-1 rounded-xl bg-white"><div class="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center text-xl text-white">🔄</div><div class="highlight-pointer bottom-20 left-20">👆 Toque na foto com a seta de 360°</div></div>${mapsBottomBar('explore')}</div>`,
      // 3: Visão da calçada
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showStreetView: true })}</div>`
    ],

    "saber-se-transito-parado-maps": [
      // 1: Rota
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true })}${mapsBottomBar('explore')}</div>`,
      // 2: Cores da rota
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true, showTraffic: true })}<div class="absolute top-4 left-4 right-4 z-20 bg-white/95 border border-zinc-300 p-2.5 rounded-xl shadow-lg highlight-ring"><div class="flex items-center justify-between text-xs font-bold"><span>🔵 Azul: Livre</span><span>🟠 Laranja: Lento</span><span>🔴 Vermelho: Parado</span></div><div class="highlight-pointer top-16 left-6">👆 Veja as cores do trânsito na linha</div></div>${mapsBottomBar('explore')}</div>`,
      // 3: Rota alternativa
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true, showTraffic: true })}<div class="mt-auto bg-white p-3 border-t border-zinc-200 z-20 flex items-center justify-between"><div class="highlight-ring p-2 rounded-lg bg-green-50"><p class="text-xs font-bold text-green-900">Caminho mais rápido: 24 min</p><p class="text-[10px] text-green-700">Evita engarrafamento na avenida principal</p></div><button class="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-full">Seguir rota</button></div></div>`
    ],

    "baixar-mapa-sem-internet-maps": [
      // 1: Perfil
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch({ highlightProfile: true })}${mapsCanvas()}<div class="highlight-pointer top-16 right-4">👆 Toque no seu perfil</div>${mapsBottomBar('explore')}</div>`,
      // 2: Mapas off-line
      `<div class="relative flex-1 flex flex-col bg-white p-4"><h3 class="text-xs font-bold text-zinc-500 mb-3">Configurações</h3><div class="highlight-ring p-3 rounded-xl bg-zinc-50 flex items-center gap-3"><span class="text-2xl">🗺️</span><div><p class="text-xs font-bold text-zinc-900">Mapas off-line</p><p class="text-[10px] text-zinc-500">Navegue mesmo se a internet acabar</p></div></div><div class="highlight-pointer top-28 right-6">👆 Toque em Mapas off-line</div></div>`,
      // 3: Selecione a área
      `<div class="relative flex-1 flex flex-col bg-zinc-200 relative">${mapsCanvas()}<div class="absolute inset-12 border-4 border-blue-600 rounded-xl bg-blue-500/10 flex items-center justify-center highlight-ring"><span class="text-xs font-bold text-blue-900 bg-white/90 px-3 py-1 rounded-full shadow">Área do seu mapa</span></div><div class="highlight-pointer top-16 left-16">👆 Enquadre sua cidade no retângulo</div></div>`,
      // 4: Botão Download
      `<div class="relative flex-1 flex flex-col bg-zinc-200">${mapsCanvas()}<div class="mt-auto bg-white p-4 border-t border-zinc-200 z-20 flex items-center justify-between"><div><span class="text-xs font-bold text-zinc-900">Tamanho: ~140 MB</span><span class="text-[10px] text-zinc-500 block">Válido por 1 ano</span></div><div class="highlight-ring"><button class="bg-blue-600 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow">Download</button></div><div class="highlight-pointer bottom-20 right-6">👆 Toque em Download</div></div></div>`
    ],

    "ver-horario-funcionamento-maps": [
      // 1: Local
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch({ query: "Supermercado Pão de Açúcar" })}${mapsCanvas({ showPin: true })}${mapsBottomBar('explore')}</div>`,
      // 2: Puxar painel
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showPin: true })}<div class="mt-auto bg-white p-4 rounded-t-2xl border-t border-zinc-300 z-20 shadow-2xl highlight-ring"><div class="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-3"></div><div class="highlight-pointer -top-3 left-10">👆 Arraste o painel para cima</div><h2 class="text-sm font-bold text-zinc-900">Pão de Açúcar — Paulista</h2><p class="text-xs text-zinc-500">Supermercado completo</p></div></div>`,
      // 3: Horários
      `<div class="relative flex-1 flex flex-col bg-white p-4 text-xs overflow-y-auto"><h2 class="text-sm font-bold text-zinc-900 mb-1">Pão de Açúcar</h2><div class="highlight-ring p-3 rounded-xl bg-green-50 mb-3"><div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-green-600"></span><span class="font-bold text-green-900">Aberto agora • Fecha às 22:00</span></div><div class="mt-2 space-y-1 text-[11px] text-zinc-600 border-t border-green-200 pt-2"><div class="flex justify-between"><span>Segunda a Sábado</span><span>07:00 – 22:00</span></div><div class="flex justify-between"><span>Domingo e Feriados</span><span>08:00 – 20:00</span></div></div></div><div class="highlight-pointer top-28 right-6">✔ Horário de funcionamento confirmado</div></div>`
    ],

    "medir-distancia-tempo-maps": [
      // 1: Rota
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true })}${mapsBottomBar('explore')}</div>`,
      // 2: Faixa com minutos e km
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true })}<div class="mt-auto bg-white p-4 border-t border-zinc-200 z-20 shadow-xl flex items-center justify-between highlight-ring"><div class="highlight-pointer -top-3 left-6">👆 Veja o tempo e a distância</div><div><span class="text-2xl font-black text-green-700">25 min</span><span class="text-xs font-bold text-zinc-600 ml-2">(12 km)</span><span class="text-[10px] text-zinc-500 block">Via Rodovia dos Bandeirantes</span></div><button class="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-full">Rotas</button></div></div>`,
      // 3: Hora de chegada
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true })}<div class="mt-auto bg-white p-4 border-t border-zinc-200 z-20 shadow-xl flex items-center justify-between"><div class="highlight-ring p-2 rounded-lg bg-blue-50"><div><span class="text-xs font-bold text-blue-900">Chegada prevista às:</span><span class="text-lg font-black text-blue-700 ml-2">15:45</span></div></div><div class="highlight-pointer bottom-24 left-10">✔ Você chegará às 15:45 se sair agora</div></div></div>`
    ],

    "adicionar-parada-caminho-maps": [
      // 1: Lupa no GPS
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true })}<div class="absolute top-4 right-4 z-20 highlight-ring p-2 rounded-full bg-white shadow-lg"><span class="text-base">🔍</span><div class="highlight-pointer top-12 right-2">👆 Toque na lupa da rota</div></div></div>`,
      // 2: Escolher Postos
      `<div class="relative flex-1 flex flex-col bg-white p-4 text-xs"><h3 class="text-sm font-bold text-zinc-900 mb-3">O que você precisa no caminho?</h3><div class="highlight-ring p-3 rounded-xl bg-zinc-50 flex items-center gap-3"><span class="text-2xl">⛽</span><div><p class="font-bold text-zinc-900">Postos de gasolina</p><p class="text-[10px] text-zinc-500">Encontre combustível sem sair da rota</p></div></div><div class="highlight-pointer top-28 right-6">👆 Toque em Postos</div></div>`,
      // 3: Posto selecionado (+4 min)
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true, showPin: true, pinLabel: "Posto Shell (+4 min)" })}<div class="mt-auto bg-white p-3 border-t border-zinc-200 z-20 flex items-center justify-between"><p class="text-xs font-bold text-zinc-900">Posto Shell Graal • +4 min</p><div class="highlight-ring"><button class="bg-green-600 text-white font-bold text-xs px-4 py-2 rounded-full">Adicionar parada</button></div><div class="highlight-pointer bottom-20 right-6">👆 Toque em Adicionar parada</div></div></div>`,
      // 4: Rota com 2 paradas
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true })}<div class="mt-auto bg-white p-3 border-t border-zinc-200 z-20 text-center"><span class="text-green-700 font-bold text-xs">✔ Parada incluída! O GPS levará você primeiro ao posto</span></div></div>`
    ],

    "evitar-pedagios-maps": [
      // 1: Rota
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true })}${mapsBottomBar('explore')}</div>`,
      // 2: Três pontinhos
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true })}<div class="absolute top-3 right-3 z-20 highlight-ring p-2 rounded-full bg-white shadow-md"><span class="text-base font-bold">⋮</span><div class="highlight-pointer top-12 right-2">👆 Toque nos 3 pontinhos</div></div></div>`,
      // 3: Opções de trajeto
      `<div class="relative flex-1 flex flex-col bg-white p-4 text-xs"><div class="highlight-ring p-3 rounded-xl bg-zinc-50 flex items-center justify-between"><span class="font-bold text-zinc-900">Opções de trajeto</span><span>›</span></div><div class="highlight-pointer top-20 right-6">👆 Toque em Opções de trajeto</div></div>`,
      // 4: Evitar pedágios marcado
      `<div class="relative flex-1 flex flex-col bg-white p-4 text-xs"><h3 class="text-sm font-bold text-zinc-900 mb-3">Opções de Rota</h3><div class="highlight-ring p-3 rounded-xl bg-blue-50 flex items-center justify-between mb-4"><span class="font-bold text-blue-950">Evitar pedágios</span><span class="w-5 h-5 rounded bg-blue-600 text-white font-bold flex items-center justify-center">✔</span></div><div class="highlight-pointer top-28 right-6">✔ Rota recalculada sem pedágios!</div><button class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-full">Concluir</button></div>`
    ],

    "salvar-onde-estacionou-maps": [
      // 1: Ponto azul
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showBlueDot: true })}<div class="highlight-pointer bottom-36 left-28">👆 Toque na bolinha azul</div>${mapsBottomBar('explore')}</div>`,
      // 2: Menu inferior
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showBlueDot: true })}<div class="mt-auto bg-white p-4 border-t border-zinc-200 z-20 rounded-t-2xl shadow-2xl highlight-ring"><div class="highlight-pointer -top-3 left-6">👆 Toque em Salvar estacionamento</div><div class="p-2.5 bg-blue-50 rounded-lg flex items-center gap-2.5"><span class="text-xl">🅿️</span><span class="text-xs font-bold text-blue-900">Salvar local de estacionamento</span></div></div></div>`,
      // 3: Pino amarelo 'P'
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showParkingPin: true })}<div class="highlight-pointer top-72 left-28">✔ Local da vaga salvo no mapa!</div>${mapsBottomBar('explore')}</div>`
    ],

    "ver-caminho-a-pe-maps": [
      // 1: Rotas
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true })}${mapsBottomBar('explore')}</div>`,
      // 2: Pedestre selecionado
      `<div class="relative flex-1 flex flex-col"><div class="h-16 bg-white border-b border-zinc-200 p-2 flex items-center justify-around z-20"><span class="text-xs text-zinc-500">🚗 Carro</span><span class="text-xs text-zinc-500">🚌 Ônibus</span><div class="highlight-ring p-1.5 rounded-lg bg-blue-50"><span class="text-xs font-bold text-blue-700">🚶 A pé</span></div></div><div class="highlight-pointer top-20 right-6">👆 Escolha o ícone do Pedestre</div>${mapsCanvas({ showRoute: true, routeType: 'dashed', routeColor: '#2563eb' })}</div>`,
      // 3: Linha pontilhada segura
      `<div class="relative flex-1 flex flex-col">${mapsCanvas({ showRoute: true, routeType: 'dashed', routeColor: '#2563eb' })}<div class="mt-auto bg-white p-4 border-t border-zinc-200 z-20 shadow-xl flex items-center justify-between"><div class="highlight-ring p-2 rounded-lg bg-blue-50"><p class="text-xs font-bold text-blue-900">15 min a pé (1,1 km)</p><p class="text-[10px] text-blue-700">Caminho mais plano pelas calçadas</p></div><button class="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-full">Iniciar</button></div><div class="highlight-pointer bottom-24 left-10">👆 Siga os pontinhos azuis na calçada</div></div>`
    ],

    "conferir-avaliacoes-comentarios-maps": [
      // 1: Local
      `<div class="relative flex-1 flex flex-col">${mapsTopSearch({ query: "Cartório do 14º Tabelião" })}${mapsCanvas({ showPin: true })}${mapsBottomBar('explore')}</div>`,
      // 2: Aba Avaliações
      `<div class="relative flex-1 flex flex-col bg-white p-4"><h2 class="text-sm font-bold text-zinc-900 mb-2">Cartório do 14º Tabelião</h2><div class="flex gap-4 border-b border-zinc-200 pb-2 mb-3"><span class="text-xs text-zinc-500">Visão geral</span><div class="highlight-ring px-2 py-0.5 rounded"><span class="text-xs font-bold text-blue-600">Avaliações (4.8 ★)</span></div><span class="text-xs text-zinc-500">Fotos</span></div><div class="highlight-pointer top-24 right-10">👆 Toque na aba Avaliações</div></div>`,
      // 3: Comentários de clientes
      `<div class="relative flex-1 flex flex-col bg-white p-4 text-xs overflow-y-auto space-y-3"><div class="flex items-center gap-2"><span class="text-2xl font-black text-amber-500">4.8</span><div><span class="text-amber-500">★★★★★</span><span class="text-zinc-500 block text-[10px]">Mais de 400 avaliações</span></div></div><div class="p-3 bg-zinc-50 rounded-xl border border-zinc-200"><p class="font-bold text-zinc-800">Dona Neide Silva <span class="text-amber-500">★★★★★</span></p><p class="text-zinc-600 mt-1">"Atendimento muito rápido para idosos com preferência. Funcionários educados e ambiente limpo com ar condicionado."</p></div><div class="highlight-pointer bottom-20 left-10">✔ Leia os depoimentos reais de quem já foi</div></div>`
    ],
  }
};

// ══════════════════════════════════════════════════════════════
// EXECUTOR PRINCIPAL
// ══════════════════════════════════════════════════════════════
async function main() {
  console.log(`Iniciando gerador de telas mockup com: ${BROWSER_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=412,915'],
  });

  const page = await browser.newPage();
  await page.setViewport(DEVICE);

  let totalSalvas = 0;

  for (const [appKey, tasks] of Object.entries(ALL_MOCKS)) {
    console.log(`\n======================================================`);
    console.log(`🚀 GERANDO MOCKUPS: ${appKey.toUpperCase()} (${Object.keys(tasks).length} TAREFAS)`);
    console.log(`======================================================\n`);

    const isDark = appKey === 'youtube';

    for (const [slug, steps] of Object.entries(tasks)) {
      const targetDir = path.join(BASE_PRINTS, appKey, slug);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      console.log(`📱 ${slug}`);

      for (let i = 0; i < steps.length; i++) {
        const stepNum = i + 1;
        const outputPath = path.join(targetDir, `step-${stepNum}.png`);
        const html = getBaseTemplate(steps[i], isDark);

        await page.setContent(html, { waitUntil: 'load' });
        await new Promise(r => setTimeout(r, 450));

        await page.screenshot({ path: outputPath });
        const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1);
        process.stdout.write(`   ↳ Passo ${stepNum}: ✔ Salvo (${sizeKb} KB) com destaque\n`);
        totalSalvas++;
      }
    }
  }

  await browser.close();
  console.log(`\n🎉 PROCESSO CONCLUÍDO COM SUCESSO!`);
  console.log(`Total de telas geradas e substituídas: ${totalSalvas}`);
}

main();
