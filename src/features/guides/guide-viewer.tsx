"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Application, Guide, GuideStep, Task } from "@/types/content";
import { clearProgress, loadProgress, saveProgress } from "@/features/progress/progress-storage";
import { nextStep, previousStep, restartGuide } from "@/features/progress/guide-navigation";
import { loadRemoteProgress, saveRemoteProgress } from "@/features/progress/remote-progress";
import { HomeToolbar } from "@/features/theme/home-toolbar";
import { ScreenPlaceholder } from "./screen-placeholder";
import { GuidePreparationPanel, GuidePreparationPhoneScreen } from "./guide-preparation-state";
import { GuideProgressStepper } from "./guide-progress-stepper";

interface GuideViewerProps {
  application: Application;
  guide: Guide;
  steps: GuideStep[];
  task: Task;
  returnTo?: string;
}

function GuidePageShell({ children }: { children: ReactNode }) {
  return (
    <main className="guido-home internal-page guide-page min-h-screen">
      <HomeToolbar />
      <div className="internal-page-content internal-page-content--wide guide-page-content guide-reader">
        {children}
      </div>
    </main>
  );
}

export function GuideViewer({ application, guide, steps, task, returnTo }: GuideViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [remotePending, setRemotePending] = useState(true);
  const [resumeStep, setResumeStep] = useState<number | null>(null);
  const [speechMessage, setSpeechMessage] = useState("");
  const [completed, setCompleted] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const stepTitleRef = useRef<HTMLHeadingElement>(null);
  const previousRenderedStep = useRef(0);
  const step = steps[currentStep];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const localProgress = loadProgress(window.localStorage, guide.id);
      const localCandidate = localProgress
        && localProgress.currentStep > 0
        && localProgress.currentStep < steps.length
        && localProgress.status === "in_progress"
        ? localProgress
        : null;
      if (localCandidate) setResumeStep(localCandidate.currentStep);
      // O roteiro aparece assim que o armazenamento local está disponível. A
      // sincronização remota continua em segundo plano para não atrasar o guia.
      setReady(true);
      void loadRemoteProgress(guide.id).then((remoteProgress) => {
        if (!localCandidate) {
          const remoteCandidate = remoteProgress
            && remoteProgress.currentStep > 0
            && remoteProgress.currentStep < steps.length
            && remoteProgress.status === "in_progress"
            ? remoteProgress
            : null;
          if (remoteCandidate) setResumeStep(remoteCandidate.currentStep);
        }
        setRemotePending(false);
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [guide.guideVersion, guide.id, steps.length]);

  useEffect(() => {
    if (!ready || remotePending || resumeStep !== null) return;
    saveProgress(window.localStorage, {
      guideId: guide.id,
      currentStep,
      guideVersion: guide.guideVersion,
      lastAccessedAt: new Date().toISOString(),
      status: completed ? "completed" : "in_progress",
      operatingSystem: guide.operatingSystem,
    });
    void saveRemoteProgress(guide.id, currentStep, completed ? "completed" : "in_progress");
  }, [completed, currentStep, guide, ready, remotePending, resumeStep]);

  useEffect(() => {
    if (!ready || resumeStep !== null || previousRenderedStep.current === currentStep) return;
    previousRenderedStep.current = currentStep;
    const frame = window.requestAnimationFrame(() => {
      stepTitleRef.current?.focus({ preventScroll: true });
      const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      stepTitleRef.current?.scrollIntoView?.({ behavior, block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentStep, ready, resumeStep]);

  if (!ready || (!step && !preparing)) {
    return (
      <GuidePageShell>
        <p role="status" className="glass-panel guide-loading-state">Carregando o guia…</p>
      </GuidePageShell>
    );
  }

  const activeStep = step!;

  if (resumeStep !== null) {
    return (
      <GuidePageShell>
        <div className="glass-panel guide-resume-card text-center">
          <h1 className="text-3xl font-bold">Continuar de onde parou?</h1>
          <p className="mt-4 text-xl">Você parou no passo {resumeStep + 1} de {steps.length}. Deseja continuar?</p>
          <p className="mt-3 font-semibold text-[var(--muted)]">Seu progresso está salvo. Escolha com calma.</p>
          <div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row">
            <button className="primary-action min-h-14 px-6 py-3 font-bold" onClick={() => { setCurrentStep(resumeStep); setResumeStep(null); }}>
              Continuar
            </button>
            <button className="secondary-action min-h-14 px-6 py-3 font-bold" onClick={() => { clearProgress(window.localStorage, guide.id); setCurrentStep(0); setResumeStep(null); }}>
              Começar novamente
            </button>
          </div>
        </div>
      </GuidePageShell>
    );
  }

  const speak = () => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setSpeechMessage("A leitura em voz alta não está disponível neste navegador.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${activeStep.title}. ${activeStep.instruction}${activeStep.warning ? ` Importante: ${activeStep.warning}` : ""}`);
    utterance.lang = "pt-BR";
    window.speechSynthesis.speak(utterance);
    setSpeechMessage("Instrução sendo lida em voz alta.");
  };

  const finishOrAdvance = () => {
    if (currentStep === steps.length - 1) {
      if (guide.guideStatus === "partial" || guide.guideStatus === "preparing") {
        setPreparing(true);
        setSpeechMessage("");
        return;
      }
      setCompleted(true);
      return;
    }
    setCurrentStep((value) => nextStep(value, steps.length));
    setSpeechMessage("");
  };

  const restart = () => {
    clearProgress(window.localStorage, guide.id);
    void saveRemoteProgress(guide.id, 0, "in_progress");
    setCurrentStep(restartGuide());
    setCompleted(false);
    setPreparing(false);
    setSpeechMessage("");
  };

  const remainingSteps = steps.length - currentStep - 1;
  const hasUnpublishedNextStep = guide.guideStatus === "partial" || guide.guideStatus === "preparing";
  const progressMessage = preparing
    ? "As próximas etapas ainda estão em preparação."
    : completed
    ? "Demonstração concluída com segurança."
    : currentStep === steps.length - 1
      ? hasUnpublishedNextStep
        ? "Este é o último passo disponível. O Guido não mostrará etapas sem validação."
        : "Este é o último passo. Nenhum pagamento será confirmado pelo Guido."
      : `${remainingSteps === 1 ? "Falta 1 passo" : `Faltam ${remainingSteps} passos`}. Continue no seu ritmo.`;

  return (
    <GuidePageShell>
      <div className="guide-viewer-toolbar">
        <Link href={returnTo ?? "/tarefas/pagar-boleto"} className="quiet-action min-h-12 px-2 py-2 text-base font-bold underline">← Sair do guia</Link>
        <button type="button" onClick={restart} className="quiet-action min-h-12 px-2 py-2 text-base font-bold">Começar novamente</button>
      </div>

      <header className="guide-reader-header">
        <div className="guide-reader-summary">
          <div>
            <p className="text-base font-semibold text-[var(--primary)]">{application.name} · {guide.operatingSystem === "ios" ? "iPhone" : "Outro"}</p>
            <h1 className="text-2xl font-bold sm:text-3xl">{task.title}</h1>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="text-lg font-bold" aria-live="polite">Passo {currentStep + 1} de {steps.length}</p>
            <p className="text-sm font-semibold text-[var(--muted)]" aria-live="polite">{progressMessage}</p>
          </div>
        </div>
        {!preparing && <GuideProgressStepper steps={steps} currentStep={currentStep} />}
      </header>

      <div className="guide-reader-layout">
        <div className="guide-reader-visual">
          {preparing ? <GuidePreparationPhoneScreen /> : <ScreenPlaceholder step={activeStep} />}
        </div>
        {preparing ? (
          <GuidePreparationPanel
            application={application}
            task={task}
            onPrevious={() => { setPreparing(false); setSpeechMessage(""); }}
            onFinish={() => { setPreparing(false); setCompleted(false); }}
            nextStepNumber={currentStep + 2}
          />
        ) : <section aria-labelledby="step-title" className="guide-reader-card guide-reader-instruction">
          <div className="guide-step-heading">
            <span className="guide-step-number" aria-hidden="true">{currentStep + 1}</span>
            <div>
              <p>O que fazer agora</p>
              <h2 ref={stepTitleRef} id="step-title" tabIndex={-1}>{activeStep.title}</h2>
            </div>
          </div>
          <p className="guide-step-instruction">{activeStep.instruction}</p>
          {activeStep.warning && (
            <div role="alert" className="notice-danger mt-6 rounded-2xl border-4 p-5 text-xl font-bold">
              <p>Antes de continuar</p>
              <p className="mt-2">{activeStep.warning}</p>
            </div>
          )}
          {completed && activeStep.confirmationMessage && (
            <p role="status" className="notice-success mt-6 rounded-xl p-4 font-bold">{activeStep.confirmationMessage}</p>
          )}

          <button type="button" onClick={speak} className="secondary-action mt-7 min-h-14 w-full px-5 py-3 text-xl font-bold">
            Ouvir instrução
          </button>
          <p className="mt-2 text-base" aria-live="polite">{speechMessage}</p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={() => { setCurrentStep((value) => previousStep(value)); setSpeechMessage(""); }}
              className="secondary-action min-h-14 px-5 py-3 text-xl font-bold disabled:cursor-not-allowed disabled:opacity-45"
            >
              Voltar
            </button>
            <button type="button" onClick={finishOrAdvance} className="primary-action min-h-14 px-5 py-3 text-xl font-bold">
              {currentStep === steps.length - 1 ? hasUnpublishedNextStep ? "Ver próxima etapa" : "Concluir demonstração" : "Próximo"}
            </button>
          </div>

          <details className="soft-panel mt-7 rounded-2xl p-4">
            <summary className="min-h-12 cursor-pointer py-2 text-xl font-bold">Preciso de ajuda</summary>
            <div className="mt-3 space-y-3">
              <p>Você não precisa ter pressa.</p>
              <ol className="list-decimal space-y-2 pl-6">
                <li>Use “Ouvir instrução” para escutar este passo novamente.</li>
                <li>Use “Voltar” para rever o passo anterior.</li>
                <li>Se ainda tiver dúvida, pare e peça ajuda a uma pessoa de confiança.</li>
              </ol>
              <p className="font-bold">Não compartilhe senha, código de segurança ou dados do boleto.</p>
            </div>
          </details>
        </section>}
      </div>
    </GuidePageShell>
  );
}
