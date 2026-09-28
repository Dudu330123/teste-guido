import Image from "next/image";
import type { Application, Task, GuideStep } from "@/types/content";
import { TouchTargetOverlay } from "./touch-target-overlay";
import { UniversalPhoneSimulator } from "@/features/simulator/universal-phone-simulator";

const demoBankIconPath = "/guide-placeholders/banco-demonstracao-icon.png";

interface ScreenPlaceholderProps {
  step: GuideStep;
  application?: Application & { isDemo?: boolean };
  task?: Task;
}

export function ScreenPlaceholder({ step, application, task }: ScreenPlaceholderProps) {
  const isBankDemo = !application || application.slug === "banco-demonstracao" || application.isDemo;
  const appSlug = application?.slug || "banco-demonstracao";
  const taskSlug = task?.slug || "fazer-pix";

  // Se houver imagem real (do Supabase ou local):
  if (step.imagePath && (step.imagePath.startsWith("https://") || step.imagePath.startsWith("/api/storage") || step.imagePath.startsWith("/images/"))) {
    return (
      <div className="mx-auto w-full max-w-[21.5rem] sm:max-w-[22.5rem]">
        {/* Chassi externo do Celular */}
        <div
          className="guide-evidence-viewport guide-evidence-viewport--natural relative rounded-[3rem] border-[10px] sm:border-[12px] border-slate-800 bg-slate-950 p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.12)] transition-all select-none"
        >
          {/* Botões físicos laterais de hardware */}
          <div aria-hidden="true" className="absolute -left-[14px] top-24 h-11 w-[4px] rounded-l-sm bg-slate-700 pointer-events-none" />
          <div aria-hidden="true" className="absolute -left-[14px] top-38 h-11 w-[4px] rounded-l-sm bg-slate-700 pointer-events-none" />
          <div aria-hidden="true" className="absolute -right-[14px] top-28 h-16 w-[4px] rounded-r-sm bg-slate-700 pointer-events-none" />

          {/* Alto-falante de ouvido no topo da borda */}
          <div aria-hidden="true" className="absolute left-1/2 top-2 z-30 h-1 w-14 -translate-x-1/2 rounded-full bg-slate-700/80 pointer-events-none" />

          {/* Tela interna com proporção de smartphone moderna */}
          <div className="relative aspect-[9/19.5] w-full overflow-hidden rounded-[2.2rem] bg-black">
            {/* Dynamic Island / Câmera frontal centralizada */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-2.5 z-30 flex h-4 w-20 -translate-x-1/2 items-center justify-end rounded-full bg-black/95 px-2 shadow-sm pointer-events-none"
            >
              <div className="size-2 rounded-full bg-slate-900 ring-1 ring-slate-800" />
            </div>

            {/* Captura de tela real preenchendo a tela */}
            <Image
              src={step.imagePath}
              alt={step.imageAlt || step.title}
              fill
              sizes="(max-width: 1024px) 92vw, 31rem"
              className="object-contain object-top"
              priority
            />

            {/* Linha amarela dinâmica ("Toque aqui 👉") sobre a tela */}
            {step.touchTarget && <TouchTargetOverlay touchTarget={step.touchTarget} />}

            {/* Barra de navegação por gestos na base da tela */}
            <div
              aria-hidden="true"
              className="absolute bottom-1.5 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-white/45 pointer-events-none backdrop-blur-xs"
            />
          </div>
        </div>

        {/* Legenda e atalho para ver em tela cheia */}
        <p className="mt-3 text-center text-xs font-bold text-slate-500">
          📱 Demonstração no celular · A aparência pode variar conforme seu aparelho
        </p>
        <div className="mt-1 text-center">
          <a
            href={step.imagePath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2"
          >
            <span>Ampliar captura em tamanho real</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    );
  }

  // Se não houver imagem e não for banco de demonstração, usa o simulador temático do app (ex: WhatsApp, Gov.br)
  if (!isBankDemo) {
    return (
      <UniversalPhoneSimulator
        step={step}
        appSlug={appSlug}
        appName={application?.name}
        taskSlug={taskSlug}
        taskTitle={task?.title}
      />
    );
  }

  // Fallback padrão do Banco de Demonstração
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
