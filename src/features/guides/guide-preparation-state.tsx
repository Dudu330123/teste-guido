import Link from "next/link";
import type { Ref } from "react";
import type { Application, Task } from "@/types/content";

export interface GuidePreparationPanelProps {
  application: Application;
  task: Task;
  onPrevious: () => void;
  onFinish: () => void;
  nextStepNumber: number;
  panelRef?: Ref<HTMLElement>;
}

/** Estado honesto para guias que terminam antes da próxima evidência validada. */
export function GuidePreparationPhoneScreen() {
  return (
    <div role="img" aria-label="Próxima etapa em preparação" className="mock-phone guide-preparation-phone">
      <div className="guide-preparation-screen">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.5 8h7M8.5 12h7M8.5 16h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <p>Próxima etapa<br />em preparação</p>
        <span>Estamos preparando as próximas imagens deste guia.</span>
      </div>
    </div>
  );
}

export function GuidePreparationPanel({ application, task, onPrevious, onFinish, nextStepNumber, panelRef }: GuidePreparationPanelProps) {
  return (
    <section ref={panelRef} tabIndex={-1} aria-labelledby="preparation-panel-title" className="guide-reader-card guide-reader-instruction">
      <div className="guide-step-heading">
        <span className="guide-step-number" aria-hidden="true">{nextStepNumber}</span>
        <div>
          <p>{task.title}</p>
          <h2 id="preparation-panel-title">Próxima etapa em preparação</h2>
        </div>
      </div>
      <p className="guide-step-instruction">As próximas etapas deste guia ainda estão sendo preparadas.</p>
      <div className="notice-info mt-6 rounded-2xl p-5 text-lg font-semibold">
        Ainda não existe uma imagem validada do {application.name} para continuar. O Guido não inventa etapas, porque isso poderia induzir você ao erro.
      </div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <button type="button" onClick={onPrevious} className="secondary-action min-h-14 px-5 py-3 text-xl font-bold">← Passo anterior</button>
        <Link href="/explorar" onClick={onFinish} className="primary-action min-h-14 px-5 py-3 text-center text-xl font-bold">Voltar aos guias</Link>
      </div>
    </section>
  );
}
