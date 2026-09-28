"use client";

import React from "react";
import type { GuideStep } from "@/types/content";

interface UniversalPhoneSimulatorProps {
  step: GuideStep;
  appSlug?: string;
  appName?: string;
  taskSlug?: string;
  taskTitle?: string;
}

// Retorna cores e estilos temáticos de acordo com o aplicativo
function getAppTheme(slug = "") {
  const s = slug.toLowerCase();
  if (s.includes("nubank")) {
    return {
      name: "Nubank",
      headerBg: "bg-[#820ad1]",
      headerText: "text-white",
      accentBg: "bg-[#820ad1]",
      brandColor: "#820ad1",
      badgeColor: "#a336f3",
      avatarBg: "bg-[#9b39e6]",
    };
  }
  if (s.includes("banco-do-brasil") || s === "bb") {
    return {
      name: "Banco do Brasil",
      headerBg: "bg-[#003882]",
      headerText: "text-[#fece00]",
      accentBg: "bg-[#fece00]",
      brandColor: "#003882",
      badgeColor: "#fece00",
      avatarBg: "bg-[#00275c]",
    };
  }
  if (s.includes("caixa")) {
    return {
      name: "Caixa",
      headerBg: "bg-[#005ca9]",
      headerText: "text-white",
      accentBg: "bg-[#f26522]",
      brandColor: "#005ca9",
      badgeColor: "#f26522",
      avatarBg: "bg-[#004885]",
    };
  }
  if (s.includes("whatsapp") || s === "zap") {
    return {
      name: "WhatsApp",
      headerBg: "bg-[#075e54]",
      headerText: "text-white",
      accentBg: "bg-[#25d366]",
      brandColor: "#25d366",
      badgeColor: "#128c7e",
      avatarBg: "bg-[#128c7e]",
    };
  }
  if (s.includes("uber")) {
    return {
      name: "Uber",
      headerBg: "bg-black",
      headerText: "text-white",
      accentBg: "bg-black",
      brandColor: "#000000",
      badgeColor: "#276ef1",
      avatarBg: "bg-gray-800",
    };
  }
  if (s.includes("gov-br") || s.includes("governo")) {
    return {
      name: "Gov.br",
      headerBg: "bg-[#002776]",
      headerText: "text-white",
      accentBg: "bg-[#1351b4]",
      brandColor: "#002776",
      badgeColor: "#0c326f",
      avatarBg: "bg-[#001b52]",
    };
  }
  if (s.includes("picpay")) {
    return {
      name: "PicPay",
      headerBg: "bg-[#11c76f]",
      headerText: "text-white",
      accentBg: "bg-[#11c76f]",
      brandColor: "#11c76f",
      badgeColor: "#0ea85e",
      avatarBg: "bg-[#0d9955]",
    };
  }
  if (s.includes("inter")) {
    return {
      name: "Banco Inter",
      headerBg: "bg-[#ff7a00]",
      headerText: "text-white",
      accentBg: "bg-[#ff7a00]",
      brandColor: "#ff7a00",
      badgeColor: "#e66e00",
      avatarBg: "bg-[#cc6200]",
    };
  }
  // Padrão amigável do Guido
  return {
    name: "Banco / Aplicativo",
    headerBg: "bg-[#1559c7]",
    headerText: "text-white",
    accentBg: "bg-[#1559c7]",
    brandColor: "#1559c7",
    badgeColor: "#0e4399",
    avatarBg: "bg-[#0f449e]",
  };
}

// Botão com destaque visual pulsante ("Toque aqui")
export function HighlightTarget({
  children,
  label = "Toque aqui",
  className = "",
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border-[3.5px] border-[#f59e0b] bg-amber-50/90 p-2.5 shadow-[0_0_0_6px_rgba(245,158,11,0.28)] transition-all animate-pulse ${className}`}
    >
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#f59e0b] px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-md">
        👉 {label}
      </span>
      {children}
    </div>
  );
}

export function UniversalPhoneSimulator({
  step,
  appSlug = "banco-demonstracao",
  appName,
  taskSlug = "fazer-pix",
  taskTitle = "Tarefa",
}: UniversalPhoneSimulatorProps) {
  const theme = getAppTheme(appSlug);
  const displayName = appName || theme.name;
  const isWhatsApp = appSlug.includes("whatsapp");
  const isUber = appSlug.includes("uber");
  const isGov = appSlug.includes("gov-br");
  const isPix = taskSlug.includes("pix");
  const isBoleto = taskSlug.includes("boleto") || taskSlug.includes("codigo-barras");
  const isAudio = taskSlug.includes("audio");

  // Identifica o papel deste passo pelo número e título/instrução
  const stepNumber = step.order;
  const titleLower = (step.title || "").toLowerCase();
  const instructionLower = (step.instruction || "").toLowerCase();

  const isFirstStep = stepNumber === 1 || titleLower.includes("abrir") || titleLower.includes("abra");
  const isConfirmationStep =
    titleLower.includes("pare") ||
    titleLower.includes("confira") ||
    instructionLower.includes("antes de confirmar") ||
    instructionLower.includes("antes da senha") ||
    Boolean(step.warning);

  return (
    <div
      role="img"
      aria-label={step.imageAlt || `Passo ilustrado: ${step.title}`}
      className="mock-phone mx-auto aspect-[9/18.5] w-full max-w-[21.5rem] rounded-[2.5rem] border-[9px] border-slate-800 bg-slate-900 p-2 shadow-2xl transition-all"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[1.85rem] bg-[#f8fbff] text-slate-800 select-none">
        {/* Barra superior de status do celular */}
        <div className="flex h-7 items-center justify-between bg-slate-900 px-5 text-[11px] font-bold text-slate-200">
          <span>09:41</span>
          {/* Câmera / Dynamic Island */}
          <div className="h-3.5 w-20 rounded-full bg-black/80" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="h-2.5 w-4 rounded-sm border border-slate-300 p-0.5">
              <div className="h-full w-full rounded-2xs bg-green-400" />
            </div>
          </div>
        </div>

        {/* 1. Tela Inicial do Celular (Passo 1: Abrir o Aplicativo) */}
        {isFirstStep && (
          <div className="flex flex-1 flex-col bg-gradient-to-b from-sky-400 via-indigo-200 to-indigo-400 p-4">
            <div className="my-auto">
              <p className="mb-4 text-center text-xs font-bold text-slate-800 drop-shadow-sm">
                Tela inicial do seu celular
              </p>
              <div className="grid grid-cols-4 gap-3">
                {/* Outros apps fictícios */}
                <div className="flex flex-col items-center gap-1">
                  <div className="size-12 rounded-2xl bg-white/70 shadow-sm" />
                  <span className="text-[10px] font-bold text-slate-900">Fotos</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="size-12 rounded-2xl bg-white/70 shadow-sm" />
                  <span className="text-[10px] font-bold text-slate-900">Ajustes</span>
                </div>

                {/* O aplicativo alvo destacado */}
                <div className="col-span-2 flex flex-col items-center">
                  <HighlightTarget label="Toque para abrir" className="w-full">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`size-14 rounded-2xl ${theme.headerBg} flex items-center justify-center text-white font-black text-xl shadow-md`}
                      >
                        {isWhatsApp ? "💬" : isUber ? "🚗" : isGov ? "🏛️" : "🏦"}
                      </div>
                      <span className="text-xs font-black text-slate-950 text-center truncate max-w-full">
                        {displayName}
                      </span>
                    </div>
                  </HighlightTarget>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="size-12 rounded-2xl bg-white/70 shadow-sm" />
                  <span className="text-[10px] font-bold text-slate-900">Relógio</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="size-12 rounded-2xl bg-white/70 shadow-sm" />
                  <span className="text-[10px] font-bold text-slate-900">Notas</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-white/90 p-2.5 text-center text-xs font-bold text-slate-700 shadow-sm">
              👆 Procure pelo ícone de {displayName} e toque nele.
            </div>
          </div>
        )}

        {/* 2. Telas Internas do Aplicativo Alvo */}
        {!isFirstStep && !isConfirmationStep && (
          <div className="flex flex-1 flex-col">
            {/* Cabeçalho do Aplicativo */}
            <div className={`${theme.headerBg} ${theme.headerText} p-3.5 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`size-8 rounded-full ${theme.avatarBg} flex items-center justify-center text-xs font-bold`}>
                    👤
                  </div>
                  <div>
                    <p className="text-xs font-black leading-tight">{displayName}</p>
                    <p className="text-[10px] opacity-80">Olá, Usuário</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>👁️</span>
                  <span>❓</span>
                </div>
              </div>
            </div>

            {/* Conteúdo Dinâmico por Tipo de Tarefa */}
            <div className="flex flex-1 flex-col p-3.5 space-y-3 overflow-y-auto">
              {/* CENÁRIO WHATSAPP */}
              {isWhatsApp && (
                <div className="flex flex-1 flex-col justify-between">
                  <div className="rounded-xl bg-white p-2.5 shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-500">Conversa com</p>
                    <p className="text-sm font-black text-slate-900">Filho / Neto / Amigo</p>
                  </div>

                  {isAudio ? (
                    <div className="my-auto flex flex-col items-center justify-center text-center p-3">
                      <div className="mb-3 size-20 rounded-full bg-emerald-100 flex items-center justify-center text-3xl animate-bounce">
                        🎙️
                      </div>
                      <p className="text-xs font-bold text-emerald-800">
                        {stepNumber === 2
                          ? "Encontre o botão de microfone"
                          : "Segure o botão enquanto fala sua mensagem"}
                      </p>
                    </div>
                  ) : (
                    <div className="my-auto space-y-2">
                      <div className="rounded-lg bg-emerald-50 p-2 text-xs font-semibold text-emerald-900">
                        Oi! Tudo bem? Me avisa quando puder falar.
                      </div>
                    </div>
                  )}

                  {/* Barra inferior de mensagem do WhatsApp */}
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <div className="flex-1 rounded-full bg-white px-3 py-2 text-xs text-slate-400 border border-slate-200">
                      Mensagem
                    </div>
                    <HighlightTarget label="Segure o microfone" className="p-1">
                      <div className="size-11 rounded-full bg-[#25d366] flex items-center justify-center text-white text-lg shadow-md">
                        🎤
                      </div>
                    </HighlightTarget>
                  </div>
                </div>
              )}

              {/* CENÁRIO PIX EM BANCOS */}
              {!isWhatsApp && isPix && (
                <div className="space-y-3">
                  {/* Saldo fictício */}
                  <div className="rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500">Saldo disponível</p>
                    <p className="text-base font-black text-slate-900">R$ 1.250,00</p>
                  </div>

                  {/* Passo 2: Encontrar Área Pix */}
                  {stepNumber === 2 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-700">Ações frequentes</p>
                      <div className="grid grid-cols-2 gap-2">
                        <HighlightTarget label="Toque na Área Pix">
                          <div className="flex flex-col items-center gap-1 py-1">
                            <span className="text-2xl">💠</span>
                            <span className="text-xs font-black text-slate-950">Área Pix</span>
                          </div>
                        </HighlightTarget>
                        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white p-2 text-slate-600 border border-slate-100">
                          <span className="text-xl">📄</span>
                          <span className="text-xs font-bold">Pagar Boleto</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Passo 3: Escolher Transferir */}
                  {stepNumber === 3 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-700">Opções do Pix</p>
                      <HighlightTarget label="Toque em Transferir">
                        <div className="flex items-center justify-between p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">💸</span>
                            <span className="text-xs font-black text-slate-900">Fazer Pix / Transferir</span>
                          </div>
                          <span className="text-xs font-bold text-slate-500">→</span>
                        </div>
                      </HighlightTarget>
                      <div className="flex items-center justify-between rounded-xl bg-white p-2 text-slate-600 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📷</span>
                          <span className="text-xs font-bold">Pagar com QR Code</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white p-2 text-slate-600 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📋</span>
                          <span className="text-xs font-bold">Pix Copia e Cola</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Passo 4: Chave Pix ou Valor */}
                  {stepNumber === 4 && (
                    <div className="space-y-3">
                      <HighlightTarget label="Digite a Chave ou Valor">
                        <div className="space-y-2 p-1">
                          <label className="text-xs font-black text-slate-900">
                            Qual a chave Pix da pessoa?
                          </label>
                          <div className="rounded-xl border-2 border-amber-400 bg-white p-2.5 text-xs font-bold text-slate-800">
                            (CPF, Telefone ou E-mail)
                          </div>
                        </div>
                      </HighlightTarget>

                      <div className="rounded-xl bg-white p-2 border border-slate-100 text-center">
                        <p className="text-[11px] font-bold text-slate-500">Valor a enviar</p>
                        <p className="text-xl font-black text-slate-900">R$ 50,00</p>
                      </div>
                    </div>
                  )}

                  {/* Passo 5+: Outras etapas de Pix */}
                  {stepNumber >= 5 && (
                    <div className="space-y-2">
                      <div className="rounded-xl bg-white p-3 border border-slate-100">
                        <p className="text-xs font-bold text-slate-500">Recebedor</p>
                        <p className="text-sm font-black text-slate-900">João da Silva</p>
                        <p className="text-[11px] text-slate-500">CPF: ***.123.456-**</p>
                        <p className="text-[11px] text-slate-500">Instituição: Banco Exemplo</p>
                      </div>
                      <HighlightTarget label="Confira os dados">
                        <div className="text-center py-1">
                          <p className="text-xs font-black text-slate-900">Tudo correto?</p>
                          <p className="text-[11px] font-bold text-amber-900">Avance para a conferência final.</p>
                        </div>
                      </HighlightTarget>
                    </div>
                  )}
                </div>
              )}

              {/* CENÁRIO BOLETO / CONTAS */}
              {!isWhatsApp && isBoleto && (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500">Área de Pagamentos</p>
                    <p className="text-sm font-black text-slate-900">Boletos e Contas de Consumo</p>
                  </div>

                  {stepNumber === 2 && (
                    <HighlightTarget label="Toque em Pagar Boleto">
                      <div className="flex items-center gap-3 p-2">
                        <span className="text-2xl">📄</span>
                        <div>
                          <p className="text-xs font-black text-slate-900">Código de Barras / Boleto</p>
                          <p className="text-[10px] text-slate-600">Água, luz, telefone ou compras</p>
                        </div>
                      </div>
                    </HighlightTarget>
                  )}

                  {stepNumber >= 3 && (
                    <div className="space-y-3">
                      <div className="relative rounded-2xl border-2 border-dashed border-sky-400 bg-sky-50/60 p-4 text-center">
                        <div className="mx-auto mb-2 h-16 w-32 border-2 border-sky-600 flex items-center justify-center">
                          <div className="h-0.5 w-full bg-red-500 animate-pulse" />
                        </div>
                        <p className="text-[11px] font-bold text-sky-950">
                          Aponte a câmera para o código do boleto
                        </p>
                      </div>

                      <HighlightTarget label="Ou digite o código">
                        <div className="text-center p-1">
                          <span className="text-xs font-black text-slate-900">
                            ⌨️ Digitar números do código de barras
                          </span>
                        </div>
                      </HighlightTarget>
                    </div>
                  )}
                </div>
              )}

              {/* CENÁRIO GENÉRICO / OUTRAS TAREFAS */}
              {!isWhatsApp && !isPix && !isBoleto && (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-500">Opção do menu</p>
                    <p className="text-sm font-black text-slate-900">{taskTitle}</p>
                  </div>
                  <HighlightTarget label="Toque nesta opção">
                    <div className="p-3 text-center">
                      <p className="text-xs font-black text-slate-900">{step.title}</p>
                      <p className="mt-1 text-[11px] text-slate-700 font-medium">
                        Localize esta seção na tela do aplicativo.
                      </p>
                    </div>
                  </HighlightTarget>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Tela de Segurança / Conferência Final */}
        {isConfirmationStep && (
          <div className="flex flex-1 flex-col justify-center p-4 bg-gradient-to-b from-amber-50 to-orange-50 text-center">
            <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-amber-500 text-3xl font-black text-white shadow-lg animate-pulse">
              🛡️
            </div>
            <h4 className="text-base font-black text-amber-950 leading-tight">
              PARE ANTES DA SENHA!
            </h4>
            <div className="my-3 rounded-2xl bg-white/95 p-3.5 text-left border-2 border-amber-300 shadow-sm space-y-1.5">
              <p className="text-xs font-black text-slate-900">Lembrete de Proteção:</p>
              <p className="text-xs font-bold text-slate-700">
                1. Confira sempre o NOME de quem vai receber.
              </p>
              <p className="text-xs font-bold text-slate-700">
                2. O banco NUNCA manda motoboy buscar cartão.
              </p>
              <p className="text-xs font-bold text-slate-700">
                3. O Guido nunca pede nem armazena sua senha.
              </p>
            </div>
            <p className="text-[11px] font-bold text-amber-900">
              Digite a senha somente se você tiver certeza de todos os dados!
            </p>
          </div>
        )}

        {/* Rodapé explicativo do celular */}
        <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-center">
          <p className="text-[10px] font-black tracking-wide text-slate-600">
            SIMULADOR EDUCATIVO GUIDO · NÃO É TELA REAL
          </p>
        </div>
      </div>
    </div>
  );
}
