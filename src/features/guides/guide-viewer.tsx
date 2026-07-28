"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Application, Guide, GuideStep, Task } from "@/types/content";
import { clearProgress, loadProgress, saveProgress } from "@/features/progress/progress-storage";
import { nextStep, previousStep, restartGuide } from "@/features/progress/guide-navigation";
import { ScreenPlaceholder } from "./screen-placeholder";

interface GuideViewerProps {
  application: Application;
  guide: Guide;
  steps: GuideStep[];
  task: Task;
}

export function GuideViewer({ application, guide, steps, task }: GuideViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [resumeStep, setResumeStep] = useState<number | null>(null);
  const [speechMessage, setSpeechMessage] = useState("");
  const [completed, setCompleted] = useState(false);
  const step = steps[currentStep];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const progress = loadProgress(window.localStorage, guide.id);
      if (
        progress &&
        progress.guideVersion === guide.guideVersion &&
        progress.currentStep > 0 &&
        progress.currentStep < steps.length &&
        progress.status === "in_progress"
      ) {
        setResumeStep(progress.currentStep);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [guide.guideVersion, guide.id, steps.length]);

  useEffect(() => {
    if (!ready || resumeStep !== null) return;
    saveProgress(window.localStorage, {
      guideId: guide.id,
      currentStep,
      guideVersion: guide.guideVersion,
      lastAccessedAt: new Date().toISOString(),
      status: completed ? "completed" : "in_progress",
      operatingSystem: guide.operatingSystem,
    });
  }, [completed, currentStep, guide, ready, resumeStep]);

  if (!ready || !step) {
    return <main className="mx-auto max-w-4xl px-5 py-14"><p role="status">Carregando o guia…</p></main>;
  }

  if (resumeStep !== null) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <div className="rounded-3xl border-2 border-[var(--primary)] bg-white p-7 text-center">
          <h1 className="text-3xl font-bold">Continuar de onde parou?</h1>
          <p className="mt-4 text-xl">Você parou no passo {resumeStep + 1} de {steps.length}. Deseja continuar?</p>
          <div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row">
            <button className="min-h-14 bg-[var(--primary)] px-6 py-3 font-bold text-white" onClick={() => { setCurrentStep(resumeStep); setResumeStep(null); }}>
              Continuar
            </button>
            <button className="min-h-14 border-2 border-[var(--primary)] px-6 py-3 font-bold" onClick={() => { clearProgress(window.localStorage, guide.id); setCurrentStep(0); setResumeStep(null); }}>
              Começar novamente
            </button>
          </div>
        </div>
      </main>
    );
  }

  const speak = () => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setSpeechMessage("A leitura em voz alta não está disponível neste navegador.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${step.title}. ${step.instruction}${step.warning ? ` Atenção: ${step.warning}` : ""}`);
    utterance.lang = "pt-BR";
    window.speechSynthesis.speak(utterance);
    setSpeechMessage("Instrução sendo lida em voz alta.");
  };

  const finishOrAdvance = () => {
    if (currentStep === steps.length - 1) {
      setCompleted(true);
      return;
    }
    setCurrentStep((value) => nextStep(value, steps.length));
    setSpeechMessage("");
  };

  const restart = () => {
    clearProgress(window.localStorage, guide.id);
    setCurrentStep(restartGuide());
    setCompleted(false);
    setSpeechMessage("");
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/tarefas/pagar-boleto" className="min-h-12 px-2 py-2 font-bold underline">← Sair do guia</Link>
        <button type="button" onClick={restart} className="min-h-12 border-2 border-[var(--primary)] px-4 py-2 font-bold">Começar novamente</button>
      </div>

      <div className="mt-5 rounded-2xl border-2 border-[#a66a00] bg-[#fff3cf] p-4" role="note">
        <strong>Demonstração não oficial:</strong> conteúdo fictício, não validado e sem conexão com bancos.
      </div>

      <header className="mt-7">
        <p className="font-semibold text-[var(--primary)]">{application.name} · {guide.operatingSystem === "android" ? "Android" : "iPhone"}</p>
        <h1 className="text-4xl font-bold">{task.title}</h1>
        <p className="mt-3 text-xl font-bold" aria-live="polite">Passo {currentStep + 1} de {steps.length}</p>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-[#d5ddd7]" role="progressbar" aria-label="Progresso do guia" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={currentStep + 1}>
          <div className="h-full bg-[var(--primary)]" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
        </div>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
        <ScreenPlaceholder step={step} />
        <section aria-labelledby="step-title" className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <h2 id="step-title" className="text-3xl font-bold">{step.title}</h2>
          <p className="mt-4 text-2xl leading-relaxed">{step.instruction}</p>
          {step.warning && (
            <div role="alert" className="mt-6 rounded-2xl border-4 border-[var(--danger)] bg-[#fff0f0] p-5 text-xl font-bold text-[#721b1b]">
              <p>Atenção</p>
              <p className="mt-2">{step.warning}</p>
            </div>
          )}
          {completed && step.confirmationMessage && (
            <p role="status" className="mt-6 rounded-xl border-2 border-[var(--primary)] bg-[#e8f5ed] p-4 font-bold">{step.confirmationMessage}</p>
          )}

          <button type="button" onClick={speak} className="mt-7 min-h-14 w-full border-2 border-[var(--primary)] px-5 py-3 text-xl font-bold">
            Ouvir instrução
          </button>
          <p className="mt-2 text-base" aria-live="polite">{speechMessage}</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={() => { setCurrentStep((value) => previousStep(value)); setSpeechMessage(""); }}
              className="min-h-14 border-2 border-[var(--primary)] px-5 py-3 text-xl font-bold disabled:cursor-not-allowed disabled:opacity-45"
            >
              Voltar
            </button>
            <button type="button" onClick={finishOrAdvance} className="min-h-14 bg-[var(--primary)] px-5 py-3 text-xl font-bold text-white">
              {currentStep === steps.length - 1 ? "Concluir demonstração" : "Próximo"}
            </button>
          </div>

          <details className="mt-7 rounded-2xl border-2 border-[var(--border)] p-4">
            <summary className="min-h-12 cursor-pointer py-2 text-xl font-bold">Preciso de ajuda</summary>
            <p className="mt-3">Pare e peça ajuda a uma pessoa de confiança. Não compartilhe senha, código de segurança ou dados do boleto.</p>
          </details>
        </section>
      </div>
    </main>
  );
}
