import type { GuideStep } from "@/types/content";

export function ScreenPlaceholder({ step }: { step: GuideStep }) {
  return (
    <div role="img" aria-label={step.imageAlt} className="mx-auto flex aspect-[9/16] w-full max-w-80 flex-col rounded-[2.5rem] border-[10px] border-[#26322b] bg-[#eef3ef] p-5 shadow-lg">
      <div className="mx-auto mb-6 h-2 w-20 rounded-full bg-[#26322b]" aria-hidden="true" />
      <p className="text-center text-sm font-bold uppercase tracking-wide text-[var(--muted)]">Tela fictícia</p>
      <div className="mt-5 space-y-3" aria-hidden="true">
        <div className="h-9 rounded-lg bg-white" />
        <div className="h-9 rounded-lg bg-white" />
        <div className="flex min-h-20 items-center justify-center rounded-xl border-4 border-[var(--accent)] bg-white px-3 text-center font-bold text-[var(--primary-dark)]">
          Toque aqui: {step.title}
        </div>
        <div className="h-9 rounded-lg bg-white" />
      </div>
      <p className="mt-auto text-center text-sm text-[var(--muted)]">Ilustração educativa — não é tela de banco</p>
    </div>
  );
}
