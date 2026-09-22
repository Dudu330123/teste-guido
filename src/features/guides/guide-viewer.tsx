"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
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

function taskSetupHref(task: Task, application: Application, returnTo?: string) {
  const params = new URLSearchParams();
  if (application.slug !== "banco-demonstracao") params.set("app", application.slug);
  if (returnTo) params.set("returnTo", returnTo);
  const query = params.toString();
  return `/tarefas/${encodeURIComponent(task.slug)}${query ? `?${query}` : ""}`;
}

function GuideToolbar({
  application,
  guide,
  task,
  returnTo,
  onRestart,
}: GuideViewerProps & { onRestart: () => void }) {
  const exitHref = returnTo ?? `/tarefas/${encodeURIComponent(task.slug)}`;
  const switchHref = taskSetupHref(task, application, returnTo);
  return (
    <HomeToolbar
      variant="guide"
      guideLeft={(
        <div className="guide-toolbar-context">
          <div className="guide-toolbar-primary-row">
            <Link href={exitHref} className="guide-toolbar-exit">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Sair do guia
            </Link>
            <Link href="/" className="guide-toolbar-brand" aria-label="Guido, página inicial">
              <span className="guide-toolbar-mascot" aria-hidden="true">
                <Image src="/images/home/mascote-guido-dark.png" alt="" width={1199} height={1312} priority />
              </span>
              <strong>GUIDO</strong>
            </Link>
          </div>
          <span className="guide-toolbar-breadcrumb" aria-label="Contexto do guia">
            <span>{application.name}</span>
            <span aria-hidden="true">·</span>
            <span>{task.title}</span>
            <span aria-hidden="true">·</span>
            <span>{guide.operatingSystem === "ios" ? "iPhone" : "Android"}</span>
          </span>
        </div>
      )}
      guideActions={(
        <>
          <Link href={switchHref} className="guide-toolbar-action">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
              <path d="M10 5h4M11 18.5h2" />
            </svg>
            Trocar celular
          </Link>
          <button type="button" onClick={onRestart} className="guide-toolbar-action">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 11a8 8 0 1 0 1 4" />
              <path d="M20 4v7h-7" />
            </svg>
            Começar novamente
          </button>
        </>
      )}
    />
  );
}

function GuidePageShell({ children, toolbar }: { children: ReactNode; toolbar: ReactNode }) {
  return (
    <main className="guido-home internal-page guide-page min-h-screen">
      {toolbar}
      <div className="internal-page-content internal-page-content--wide guide-page-content guide-reader">
        {children}
      </div>
    </main>
  );
}

function GuideHelpModal({ onClose }: { onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const backgroundElements = Array.from(document.body.children).filter((element) => element !== modal) as HTMLElement[];
    const previousStates = backgroundElements.map((element) => ({ element, ariaHidden: element.getAttribute("aria-hidden"), inert: element.inert }));
    backgroundElements.forEach((element) => { element.inert = true; element.setAttribute("aria-hidden", "true"); });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousStates.forEach(({ element, ariaHidden, inert }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden"); else element.setAttribute("aria-hidden", ariaHidden);
      });
    };
  }, [onClose]);

  return createPortal(
    <div ref={modalRef} className="home-bank-modal-backdrop guide-help-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="guide-help-modal-title" className="home-bank-modal guide-help-modal">
        <header>
          <div>
            <h2 id="guide-help-modal-title">Preciso de ajuda</h2>
            <p>Orientações rápidas para seguir esta etapa com segurança.</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar ajuda" className="home-modal-close">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <div className="guide-help-modal-intro">
          <h3>Como seguir este passo</h3>
          <p>Você não precisa ter pressa.</p>
          <p>Faça uma coisa de cada vez e avance somente quando estiver seguro.</p>
        </div>
        <div className="guide-help-modal-list">
          <div className="guide-help-modal-option">
            <span className="guide-help-modal-number" data-number="1" aria-hidden="true" />
            <div><strong>Leia com calma</strong><p>Confira o título e a explicação antes de tocar em qualquer opção.</p></div>
          </div>
          <div className="guide-help-modal-option">
            <span className="guide-help-modal-number" data-number="2" aria-hidden="true" />
            <div><strong>Ouça novamente</strong><p>Use “Ouvir instrução” para escutar este passo quantas vezes precisar.</p></div>
          </div>
          <div className="guide-help-modal-option">
            <span className="guide-help-modal-number" data-number="3" aria-hidden="true" />
            <div><strong>Volte quando quiser</strong><p>Use “Voltar” para rever o passo anterior sem perder o controle.</p></div>
          </div>
          <div className="guide-help-modal-option">
            <span className="guide-help-modal-number" data-number="4" aria-hidden="true" />
            <div><strong>Peça ajuda se precisar</strong><p>Se ainda tiver dúvida, pare e procure uma pessoa de confiança.</p></div>
          </div>
        </div>
        <div className="guide-help-modal-safety notice-info">
          <strong>Se algo estiver diferente, pare.</strong>
          <p>Não compartilhe senha, código de segurança ou dados do boleto. O Guido não confirma pagamentos por você.</p>
        </div>
      </section>
    </div>, document.body,
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
  const [helpOpen, setHelpOpen] = useState(false);
  const stepTitleRef = useRef<HTMLHeadingElement>(null);
  const previousRenderedStep = useRef(0);
  const step = steps[currentStep];
  const restart = () => {
    clearProgress(window.localStorage, guide.id);
    void saveRemoteProgress(guide.id, 0, "in_progress");
    setCurrentStep(restartGuide());
    setCompleted(false);
    setPreparing(false);
    setSpeechMessage("");
  };
  const guideToolbar = (
    <GuideToolbar
      application={application}
      guide={guide}
      steps={steps}
      task={task}
      returnTo={returnTo}
      onRestart={restart}
    />
  );

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
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentStep, ready, resumeStep]);

  if (!ready || (!step && !preparing)) {
    return (
      <GuidePageShell toolbar={guideToolbar}>
        <p role="status" className="glass-panel guide-loading-state">Carregando o guia…</p>
      </GuidePageShell>
    );
  }

  const activeStep = step!;

  if (resumeStep !== null) {
    return (
      <GuidePageShell toolbar={guideToolbar}>
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
    <GuidePageShell toolbar={guideToolbar}>
      <div className="guide-reader-layout">
        <div className="guide-reader-visual guide-reader-visual--desktop">
          {preparing ? <GuidePreparationPhoneScreen /> : <ScreenPlaceholder step={activeStep} />}
        </div>
        <div className="guide-reader-content">
          <GuideProgressStepper
            steps={steps}
            currentStep={currentStep}
            partial={guide.guideStatus === "partial" || guide.guideStatus === "preparing"}
            statusMessage={progressMessage}
          />
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
          {activeStep.warning && !completed && (
            <div role="alert" className="notice-danger mt-5 rounded-xl border-2 p-4 text-lg font-bold">
              <p>Antes de continuar</p>
              <p className="mt-2">{activeStep.warning}</p>
            </div>
          )}
          {completed && activeStep.confirmationMessage && (
            <p role="status" className="notice-success mt-6 rounded-xl p-4 font-bold">{activeStep.confirmationMessage}</p>
          )}

          {/* No celular, o print pertence ao passo em leitura. A cópia visual
              evita alterar o fluxo desktop e ambos continuam usando o mesmo dado. */}
          <div className="guide-reader-visual guide-reader-visual--mobile">
            <ScreenPlaceholder step={activeStep} />
          </div>

          <button type="button" onClick={speak} className="secondary-action mt-7 min-h-14 w-full px-5 py-3 text-xl font-bold">
            <svg className="guide-audio-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4V5Z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
            <span>Ouvir instrução</span>
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
              <span>{currentStep === steps.length - 1 ? hasUnpublishedNextStep ? "Ver próxima etapa" : "Concluir demonstração" : "Próximo"}</span>
              <span className="guide-next-arrow" aria-hidden="true">→</span>
            </button>
          </div>

          <button type="button" className="guide-help-trigger mt-7" aria-haspopup="dialog" onClick={() => setHelpOpen(true)}>
            <span className="guide-help-trigger-label">
              <span className="guide-help-trigger-icon" aria-hidden="true">?</span>
              <span><strong>Preciso de ajuda</strong><small>Orientações rápidas</small></span>
            </span>
            <span className="guide-help-trigger-arrow" aria-hidden="true">→</span>
          </button>
          </section>}
        </div>
      </div>
      {helpOpen && <GuideHelpModal onClose={() => setHelpOpen(false)} />}
    </GuidePageShell>
  );
}
