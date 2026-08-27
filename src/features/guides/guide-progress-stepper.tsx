import type { GuideStep } from "@/types/content";

interface GuideProgressStepperProps {
  steps: GuideStep[];
  currentStep: number;
  partial?: boolean;
}

export function GuideProgressStepper({ steps, currentStep, partial = false }: GuideProgressStepperProps) {
  const safeCurrentStep = Math.min(Math.max(currentStep, 0), Math.max(steps.length - 1, 0));
  return (
    <nav aria-label="Etapas do guia" className="guide-progress">
      <div className="guide-progress-heading">
        <p>Trilha do guia</p>
        <p>{partial ? "Guia em preparação" : `${safeCurrentStep} concluído${safeCurrentStep === 1 ? "" : "s"}`}</p>
      </div>
      <ol
        className="guide-progress-track"
        aria-label="Progresso"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={safeCurrentStep + 1}
      >
        {steps.map((step, index) => {
          const state = index < safeCurrentStep ? "complete" : index === safeCurrentStep ? "current" : "upcoming";
          const stateLabel = state === "complete" ? "Concluído" : state === "current" ? "Atual" : "Próximo";
          return (
            <li
              key={step.id}
              aria-current={state === "current" ? "step" : undefined}
              title={`${step.title}: ${stateLabel}`}
              className={`guide-progress-segment guide-progress-segment--${state}`}
            >
              <span className="sr-only">{step.title}: {stateLabel}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
