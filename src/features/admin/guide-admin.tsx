"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getLocalGuideImages } from "@/data/local-guide-images";
import type { GuideStep, OperatingSystem } from "@/types/content";

export interface AdminGuideOption {
  slug: string;
  title: string;
  category: "bank" | "other";
  stepsByOperatingSystem: Record<OperatingSystem, GuideStep[]>;
}

export interface AdminApplicationOption {
  slug: string;
  name: string;
}

interface GuideAdminProps {
  guides: AdminGuideOption[];
  bankApplications: AdminApplicationOption[];
  canDelete?: boolean;
}

export function GuideAdmin({ guides, bankApplications }: GuideAdminProps) {
  const [guideSlug, setGuideSlug] = useState("");
  const [applicationSlug, setApplicationSlug] = useState("");
  const [operatingSystem, setOperatingSystem] = useState<OperatingSystem>("android");

  const selectedGuide = guides.find((guide) => guide.slug === guideSlug);
  const needsApplication = selectedGuide?.category === "bank";
  const selectionComplete = Boolean(selectedGuide && (!needsApplication || applicationSlug));
  const steps = useMemo(
    () => selectedGuide?.stepsByOperatingSystem[operatingSystem] ?? [],
    [operatingSystem, selectedGuide],
  );

  const localImages = useMemo(() => selectionComplete ? getLocalGuideImages(guideSlug) : {}, [guideSlug, selectionComplete]);
  const message = !selectionComplete
    ? "Selecione um guia para conferir os prints versionados."
    : Object.keys(localImages).length
      ? "Prints locais carregados. Eles só mudam junto com o código do site."
      : "Nenhum print local foi importado para este guia.";

  return (
    <div className="mt-8">
      <div className="notice-info rounded-2xl border-2 p-5" role="note">
        <p className="font-bold">Imagens versionadas no site</p>
        <p className="mt-1">Os prints ficam dentro de <code>public/images/guide-screens</code>. Não existe upload público nem publicação automática.</p>
        <p className="mt-2 font-semibold">Para adicionar ou trocar uma imagem, coloque o arquivo sem dados reais na pasta de origem e rode <code>npm run importar-imagens</code>. A revisão humana continua obrigatória antes do deploy.</p>
      </div>

      <section className="glass-panel mt-6 p-5" aria-labelledby="upload-help-title">
        <h2 id="upload-help-title" className="text-xl font-bold">Como preparar um print</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6">
          <li>Capture a tela inteira, na posição vertical e sem cortar ou esticar.</li>
          <li>Remova nomes, CPF, saldo, valores, códigos, boletos e qualquer dado real.</li>
          <li>Use PNG, JPEG ou WebP, com até 10 MB e no máximo 8192 × 8192 pixels.</li>
          <li>Valide o arquivo com <code>npm run validate-images</code> antes de publicar.</li>
          <li>Revise a prévia e só então inclua a imagem no commit/deploy.</li>
        </ol>
        <p className="notice-warning mt-4 rounded-xl p-4 font-semibold">A troca do arquivo não libera um roteiro: o guia só pode aparecer quando estiver na lista explícita de conteúdo revisado.</p>
      </section>

      <section className="glass-panel mt-6 p-5" aria-labelledby="admin-selection-title">
        <h2 id="admin-selection-title" className="text-xl font-bold">Escolha o conteúdo</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="font-bold">
            1. Guia
            <select
              value={guideSlug}
              onChange={(event) => {
                setGuideSlug(event.target.value);
                setApplicationSlug("");
              }}
              className="glass-control mt-2 min-h-14 w-full rounded-xl px-4"
            >
              <option value="">Selecione um guia</option>
              {guides.map((guide) => (
                <option key={guide.slug} value={guide.slug}>{guide.title}</option>
              ))}
            </select>
          </label>

          {needsApplication && (
            <label className="font-bold">
              2. Aplicativo do banco
              <select
                value={applicationSlug}
                onChange={(event) => setApplicationSlug(event.target.value)}
                className="glass-control mt-2 min-h-14 w-full rounded-xl px-4"
              >
                <option value="">Selecione o aplicativo</option>
                {bankApplications.map((application) => <option key={application.slug} value={application.slug}>{application.name}</option>)}
              </select>
            </label>
          )}
        </div>
      </section>

      {selectionComplete && <fieldset className="glass-panel mt-6 p-5">
        <legend className="px-2 text-xl font-bold">{needsApplication ? "3" : "2"}. Celular usado no guia</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["android", "ios"] as const).map((value) => (
            <label key={value} className="glass-control flex min-h-14 cursor-pointer items-center gap-3 rounded-xl px-4 font-bold">
              <input type="radio" name="admin-os" value={value} checked={operatingSystem === value} onChange={() => setOperatingSystem(value)} className="size-5" />
              {value === "ios" ? "iPhone" : "Outro celular"}
            </label>
          ))}
        </div>
      </fieldset>}

      <p className="notice-info mt-5 rounded-xl p-4 font-semibold" role="status" aria-live="polite">{message}</p>

      {!selectionComplete && <p className="mt-6 text-center text-lg font-semibold text-[var(--muted)]">
        {selectedGuide ? "Selecione o aplicativo para liberar os passos." : "Selecione um guia para começar."}
      </p>}

      {selectionComplete && steps.length === 0 && <div className="notice-warning mt-6 rounded-2xl border-2 p-5" role="note">
        <h2 className="text-xl font-bold">Passos ainda não cadastrados</h2>
        <p className="mt-2">Este item ainda não possui roteiro editorial. Não adicione prints até os passos serem definidos.</p>
      </div>}

      {selectionComplete && steps.length > 0 && <div className="mt-6 space-y-6">
        {steps.map((step) => {
          const imagePath = localImages[step.order];
          return (
            <article key={step.id} className="glass-panel grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(16rem,0.8fr)_1.2fr]">
              <div>
                <p className="font-bold text-[var(--primary)]">Passo {step.order} de {steps.length}</p>
                <h2 className="mt-1 text-2xl font-bold">{step.title}</h2>
                <p className="mt-3">{step.instruction}</p>
              </div>
              <div className="flex min-h-64 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--line)] bg-black/5 p-4">
                {imagePath ? <Image src={imagePath} alt={`Print do passo ${step.order}: ${step.title}`} width={1080} height={1920} className="max-h-[34rem] w-auto rounded-xl object-contain" /> : <p className="font-semibold text-[var(--muted)]">Nenhum print local importado para este passo.</p>}
              </div>
            </article>
          );
        })}
      </div>}
    </div>
  );
}
