"use client";

import React from "react";
import Image from "next/image";
import { useAccessibility } from "@/features/accessibility/accessibility-context";
import { useDevice } from "./device-context";

export function DeviceSelectorScreen() {
  const { selectDevice } = useDevice();
  const { cycleFontSize, toggleContrast } = useAccessibility();

  return (
    <div
      role="region"
      aria-label="Seleção de dispositivo inicial"
      className="guido-home guido-home--landing fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center overflow-y-auto bg-[#eaf3fc] bg-[url('/images/home/cenario-home.webp')] bg-cover bg-center p-4 sm:p-8 text-slate-900 select-none dark:bg-[#01040c] dark:bg-[url('/images/home/cenario-home-dark.webp')]"
    >
      {/* Botões rápidos de acessibilidade no topo direito */}
      <aside aria-label="Opções de acessibilidade" className="absolute top-4 right-4 z-30 flex items-center gap-2 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={cycleFontSize}
          className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/90 px-3.5 py-2 text-sm font-black text-blue-900 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow active:scale-95 dark:border-blue-800 dark:bg-slate-900/90 dark:text-blue-100"
          aria-label="Aumentar tamanho do texto"
          title="Aumentar tamanho do texto"
        >
          <span className="text-base font-black">A+</span>
          <span className="sr-only">Tamanho da fonte</span>
        </button>
        <button
          type="button"
          onClick={toggleContrast}
          className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/90 px-3.5 py-2 text-sm font-black text-blue-900 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow active:scale-95 dark:border-blue-800 dark:bg-slate-900/90 dark:text-blue-100"
          aria-label="Alternar alto contraste"
          title="Alternar alto contraste"
        >
          <span className="text-sm font-black">◐ Contraste</span>
        </button>
      </aside>

      <div className="my-auto w-full max-w-4xl py-6 text-center">
        {/* Logo Guido em destaque (alternando entre tema claro e escuro) */}
        <div className="mx-auto mb-6 flex items-center justify-center sm:mb-8">
          <Image
            src="/images/home/logo-guido-azul-marinho.png"
            alt="Guido"
            width={240}
            height={88}
            priority
            className="h-16 w-auto object-contain drop-shadow-sm sm:h-20 dark:hidden"
          />
          <Image
            src="/images/home/logo-guido-branca-dark.png"
            alt="Guido"
            width={240}
            height={88}
            priority
            className="hidden h-16 w-auto object-contain drop-shadow-sm sm:h-20 dark:block"
          />
        </div>

        {/* Título e Pergunta Principal em tamanho grande */}
        <header className="mb-8 space-y-2 sm:mb-10 sm:space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-blue-950 drop-shadow-sm sm:text-5xl dark:text-blue-100">
            Qual é o seu dispositivo?
          </h1>
          <p className="text-lg font-bold text-slate-700 sm:text-2xl dark:text-slate-200">
            Escolha onde você quer ajuda hoje:
          </p>
        </header>

        {/* Grade de Escolha com 2 Botões Gigantes e Altamente Acessíveis */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          {/* Opção 1: Celular */}
          <button
            type="button"
            onClick={() => selectDevice("celular")}
            className="group relative flex min-h-[320px] flex-col items-center justify-between rounded-[2.5rem] border-4 border-blue-500 bg-white/95 p-6 shadow-2xl backdrop-blur-md transition-all duration-200 hover:-translate-y-2 hover:border-blue-600 hover:shadow-[0_25px_50px_-12px_rgba(8,118,249,0.35)] active:translate-y-0 active:scale-95 cursor-pointer sm:min-h-[380px] sm:border-[5px] sm:p-10 dark:bg-slate-900/95 dark:border-blue-400"
            aria-label="Dispositivo Celular: Smartphone, WhatsApp, Pix e Bancos. Toque para entrar"
          >
            <div className="flex size-24 items-center justify-center rounded-3xl bg-blue-100/80 text-6xl shadow-inner transition-transform duration-200 group-hover:scale-110 sm:size-32 sm:text-7xl dark:bg-blue-950/80">
              📱
            </div>

            <div className="my-3 flex flex-col items-center">
              <strong className="text-3xl font-black text-blue-950 sm:text-4xl dark:text-white">
                Celular
              </strong>
              <span className="mt-2 text-center text-base font-bold text-slate-600 leading-relaxed sm:text-xl dark:text-slate-300">
                Smartphone, WhatsApp, Pix e Bancos
              </span>
            </div>

            <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-base font-black text-white shadow-md transition-all group-hover:bg-blue-700 sm:py-4 sm:text-xl">
              <span>Toque para entrar</span>
              <span className="text-xl transition-transform group-hover:translate-x-1 sm:text-2xl">→</span>
            </div>
          </button>

          {/* Opção 2: Televisão */}
          <button
            type="button"
            onClick={() => selectDevice("televisao")}
            className="group relative flex min-h-[320px] flex-col items-center justify-between rounded-[2.5rem] border-4 border-indigo-500 bg-white/95 p-6 shadow-2xl backdrop-blur-md transition-all duration-200 hover:-translate-y-2 hover:border-indigo-600 hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.35)] active:translate-y-0 active:scale-95 cursor-pointer sm:min-h-[380px] sm:border-[5px] sm:p-10 dark:bg-slate-900/95 dark:border-indigo-400"
            aria-label="Dispositivo Televisão: Smart TV, Netflix, YouTube e Controle Remoto. Toque para entrar"
          >
            <div className="flex size-24 items-center justify-center rounded-3xl bg-indigo-100/80 text-6xl shadow-inner transition-transform duration-200 group-hover:scale-110 sm:size-32 sm:text-7xl dark:bg-indigo-950/80">
              📺
            </div>

            <div className="my-3 flex flex-col items-center">
              <strong className="text-3xl font-black text-indigo-950 sm:text-4xl dark:text-white">
                Televisão
              </strong>
              <span className="mt-2 text-center text-base font-bold text-slate-600 leading-relaxed sm:text-xl dark:text-slate-300">
                Smart TV, Netflix, YouTube e Controle
              </span>
            </div>

            <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-base font-black text-white shadow-md transition-all group-hover:bg-indigo-700 sm:py-4 sm:text-xl">
              <span>Toque para entrar</span>
              <span className="text-xl transition-transform group-hover:translate-x-1 sm:text-2xl">→</span>
            </div>
          </button>
        </div>

        {/* Rodapé Tranquilizador com Badge Sutil */}
        <div className="mt-8 sm:mt-10">
          <p className="inline-block rounded-full bg-white/80 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-sm sm:text-base dark:bg-slate-900/80 dark:text-slate-300">
            💡 Você poderá trocar de dispositivo a qualquer momento no topo da página.
          </p>
        </div>
      </div>
    </div>
  );
}
