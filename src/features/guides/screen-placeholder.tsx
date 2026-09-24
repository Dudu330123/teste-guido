import Image from "next/image";
import type { GuideStep } from "@/types/content";
import { TouchTargetOverlay } from "./touch-target-overlay";

const demoBankIconPath = "/guide-placeholders/banco-demonstracao-icon.png";

export function ScreenPlaceholder({ step }: { step: GuideStep }) {
  if (step.imagePath.startsWith("https://") || step.imagePath.startsWith("/api/storage")) {
    return (
      <figure className="guide-evidence">
        <div className="guide-evidence-frame">
          <div className="guide-evidence-viewport">
            <Image
              src={step.imagePath}
              alt={step.imageAlt}
              fill
              sizes="(max-width: 1024px) 92vw, 31rem"
              className="object-contain"
              priority
            />
            {step.evidenceStatus === "VERIFIED" && step.touchTarget && <TouchTargetOverlay touchTarget={step.touchTarget} />}
          </div>
        </div>
        <figcaption className="guide-evidence-caption">
          Imagem demonstrativa publicada pela administração. Confirme se a tela do aplicativo continua igual.
        </figcaption>
      </figure>
    );
  }

  return (
    <div role="img" aria-label={step.imageAlt} className="mock-phone mx-auto aspect-[9/18] w-full max-w-[22rem] rounded-[2.75rem] border-[11px] p-2 shadow-2xl">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#f7fbff]" aria-hidden="true">
        <div className="absolute left-1/2 top-3 z-10 h-2 w-20 -translate-x-1/2 rounded-full bg-[#273449]" />
        <div className="flex items-center gap-3 border-b-2 border-[#d9e7ff] bg-white px-5 pb-3 pt-8">
          <Image src={demoBankIconPath} alt="" width={44} height={44} className="size-11 rounded-xl" />
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[var(--primary)]">Banco de demonstração</p>
            <p className="text-xs font-bold text-[var(--muted)]">Tela fictícia · sem dados reais</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <MockScreen step={step} />
        </div>
        <p className="guide-phone-caption break-words bg-[#e8f0ff] px-4 py-3 text-center text-xs font-bold leading-tight text-[var(--primary-dark)]">
          Ilustração educativa — não é tela de banco
        </p>
      </div>
    </div>
  );
}

function TouchTarget({ children }: { children: React.ReactNode }) {
  return (
    <div className="guide-touch-target relative flex min-h-16 items-center justify-center rounded-2xl border-4 border-[var(--primary)] bg-white px-3 text-center font-black text-[var(--primary-dark)] shadow-[0_0_0_8px_rgba(22,89,216,0.12)]">
      <span className="absolute -top-8 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-black uppercase text-white">Toque aqui ↓</span>
      {children}
    </div>
  );
}

function MockScreen({ step }: { step: GuideStep }) {
  if (step.order === 1) {
    return (
      <div className="mt-12 grid grid-cols-2 gap-5">
        <div className="h-24 rounded-3xl bg-[#dce7f7]" />
        <TouchTarget>
          <span className="flex min-w-0 max-w-full flex-col items-center gap-2 break-words">
            <Image src={demoBankIconPath} alt="" width={72} height={72} className="size-16 rounded-2xl" />
            Banco de demonstração
          </span>
        </TouchTarget>
        <div className="h-24 rounded-3xl bg-[#dce7f7]" />
        <div className="h-24 rounded-3xl bg-[#dce7f7]" />
      </div>
    );
  }

  if (step.order === 2) {
    return (
      <div className="space-y-5">
        <div className="h-20 rounded-2xl bg-[#dce7f7]" />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex min-h-16 items-center justify-center rounded-2xl bg-white font-bold">Pix</div>
          <TouchTarget>Pagamentos</TouchTarget>
          <div className="flex min-h-16 items-center justify-center rounded-2xl bg-white font-bold">Cartões</div>
          <div className="flex min-h-16 items-center justify-center rounded-2xl bg-white font-bold">Ajuda</div>
        </div>
      </div>
    );
  }

  if (step.order === 3) {
    return (
      <div className="mt-8 space-y-5">
        <div className="min-h-16 rounded-2xl bg-white p-4 text-center font-bold">Conta de consumo</div>
        <TouchTarget>Pagamento de boleto</TouchTarget>
        <div className="min-h-16 rounded-2xl bg-white p-4 text-center font-bold">Outros pagamentos</div>
      </div>
    );
  }

  if (step.order === 4) {
    return (
      <div className="mt-8 space-y-6">
        <div className="h-32 rounded-3xl border-4 border-dashed border-[#9db9ff] bg-white" />
        <TouchTarget>Usar câmera ou digitar</TouchTarget>
        <p className="rounded-xl bg-[#fff8df] p-3 text-center text-sm font-bold">Não informe nenhum código neste guia.</p>
      </div>
    );
  }

  if (step.order === 5) {
    return (
      <div className="mt-5 space-y-4">
        <TouchTarget>Conferir os dados</TouchTarget>
        {["Quem receberá", "Valor", "Vencimento"].map((label) => (
          <div key={label} className="rounded-2xl bg-white p-4">
            <p className="text-xs font-bold text-[var(--muted)]">{label}</p>
            <p className="font-black">Confira com calma</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="my-auto rounded-3xl border-4 border-[var(--danger)] bg-[#fff0f0] p-6 text-center text-[#721b1b]">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[var(--danger)] text-4xl font-black text-white">!</div>
      <p className="mt-5 text-2xl font-black">Pare antes de confirmar</p>
      <p className="mt-3 font-bold">O Guido não realiza pagamentos.</p>
    </div>
  );
}
