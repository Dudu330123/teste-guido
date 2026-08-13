"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { GuideStep, OperatingSystem } from "@/types/content";
import {
  buildGuideImageDraftId,
  listGuideImageDrafts,
  removeGuideImageDraft,
  saveGuideImageDraft,
  type GuideImageDraft,
} from "./guide-image-storage";
import {
  readImageDimensions,
  validateGuideImageDimensions,
  validateGuideImageFile,
} from "./guide-image-validation";

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
}

interface DraftPreview extends GuideImageDraft {
  url: string;
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2).replace(".", ",")} MB`;
}

export function GuideAdmin({ guides, bankApplications }: GuideAdminProps) {
  const [guideSlug, setGuideSlug] = useState("");
  const [applicationSlug, setApplicationSlug] = useState("");
  const [operatingSystem, setOperatingSystem] = useState<OperatingSystem>("android");
  const [drafts, setDrafts] = useState<Record<string, DraftPreview>>({});
  const [message, setMessage] = useState("Carregando rascunhos locais…");
  const [busyStepId, setBusyStepId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const urls: string[] = [];
    listGuideImageDrafts()
      .then((storedDrafts) => {
        if (!active) return;
        const mapped = Object.fromEntries(storedDrafts.map((draft) => {
          const url = URL.createObjectURL(draft.file);
          urls.push(url);
          return [draft.draftId, { ...draft, url }];
        }));
        setDrafts(mapped);
        setMessage(storedDrafts.length ? "Rascunhos locais recuperados." : "Nenhum print foi enviado neste navegador.");
      })
      .catch(() => active && setMessage("Este navegador não permitiu abrir o armazenamento local."));
    return () => {
      active = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const selectedGuide = guides.find((guide) => guide.slug === guideSlug);
  const needsApplication = selectedGuide?.category === "bank";
  const selectionComplete = Boolean(selectedGuide && (!needsApplication || applicationSlug));
  const steps = useMemo(
    () => selectedGuide?.stepsByOperatingSystem[operatingSystem] ?? [],
    [operatingSystem, selectedGuide],
  );

  const getDraftId = (step: GuideStep) => buildGuideImageDraftId({
    guideSlug,
    applicationSlug: needsApplication ? applicationSlug : null,
    operatingSystem,
    stepId: step.id,
  });

  const upload = async (step: GuideStep, file: File | undefined) => {
    if (!file) return;
    const draftId = getDraftId(step);
    const fileError = validateGuideImageFile(file);
    if (fileError) {
      setMessage(`Passo ${step.order}: ${fileError}`);
      return;
    }
    setBusyStepId(step.id);
    try {
      const dimensions = await readImageDimensions(file);
      const dimensionError = validateGuideImageDimensions(dimensions);
      if (dimensionError) {
        setMessage(`Passo ${step.order}: ${dimensionError}`);
        return;
      }
      const draft: GuideImageDraft = {
        draftId,
        guideSlug,
        applicationSlug: needsApplication ? applicationSlug : null,
        operatingSystem,
        stepId: step.id,
        file,
        filename: file.name,
        mimeType: file.type,
        byteSize: file.size,
        updatedAt: new Date().toISOString(),
        ...dimensions,
      };
      await saveGuideImageDraft(draft);
      setDrafts((current) => {
        const previous = current[draftId];
        if (previous) URL.revokeObjectURL(previous.url);
        return { ...current, [draftId]: { ...draft, url: URL.createObjectURL(file) } };
      });
      setMessage(`Print do passo ${step.order} salvo somente neste navegador.`);
    } catch {
      setMessage(`Não foi possível ler ou salvar o print do passo ${step.order}.`);
    } finally {
      setBusyStepId(null);
    }
  };

  const remove = async (step: GuideStep) => {
    const draftId = getDraftId(step);
    setBusyStepId(step.id);
    try {
      await removeGuideImageDraft(draftId);
      setDrafts((current) => {
        const next = { ...current };
        if (next[draftId]) URL.revokeObjectURL(next[draftId].url);
        delete next[draftId];
        return next;
      });
      setMessage(`Print do passo ${step.order} removido deste navegador.`);
    } catch {
      setMessage("Não foi possível remover o print local.");
    } finally {
      setBusyStepId(null);
    }
  };

  return (
    <div className="mt-8">
      <div className="notice-warning rounded-2xl border-2 p-5" role="note">
        <p className="font-bold">Protótipo administrativo sem login</p>
        <p className="mt-1">Os prints ficam apenas neste navegador. Eles ainda não aparecem no guia público nem são enviados ao Supabase.</p>
      </div>

      <section className="glass-panel mt-6 p-5" aria-labelledby="admin-selection-title">
        <h2 id="admin-selection-title" className="text-xl font-bold">Escolha o conteúdo do print</h2>
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
              {guides.map((guide) => {
                const hasSteps = Object.values(guide.stepsByOperatingSystem).some((guideSteps) => guideSteps.length > 0);
                return <option key={guide.slug} value={guide.slug}>{guide.title}{hasSteps ? "" : " — passos em preparação"}</option>;
              })}
            </select>
          </label>

          {needsApplication && (
            <label className="font-bold">
              2. Aplicativo do banco
              <select value={applicationSlug} onChange={(event) => setApplicationSlug(event.target.value)} className="glass-control mt-2 min-h-14 w-full rounded-xl px-4">
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

      {!selectionComplete && (
        <p className="mt-6 text-center text-lg font-semibold text-[var(--muted)]">
          {selectedGuide ? "Selecione o aplicativo para liberar os passos e o upload." : "Selecione um guia para começar."}
        </p>
      )}

      {selectionComplete && steps.length === 0 && (
        <div className="notice-warning mt-6 rounded-2xl border-2 p-5" role="note">
          <h2 className="text-xl font-bold">Passos ainda não cadastrados</h2>
          <p className="mt-2">Este guia já está no catálogo, mas ainda precisa ter seu roteiro revisado e dividido em passos antes de receber prints.</p>
        </div>
      )}

      {selectionComplete && steps.length > 0 && <div className="mt-6 space-y-6">
        {steps.map((step) => {
          const draftId = getDraftId(step);
          const preview = drafts[draftId];
          const inputId = `print-${draftId}`;
          return (
            <article key={step.id} className="glass-panel grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(16rem,0.8fr)_1.2fr]">
              <div>
                <p className="font-bold text-[var(--primary)]">Passo {step.order} de {steps.length}</p>
                <h2 className="mt-1 text-2xl font-bold">{step.title}</h2>
                <p className="mt-3">{step.instruction}</p>
                <p className="mt-3 text-sm text-[var(--muted)]"><strong>Texto alternativo:</strong> {step.imageAlt}</p>
                <label htmlFor={inputId} className="primary-action mt-5 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-5 py-2 font-bold">
                  {preview ? "Substituir print" : "Escolher print"}
                </label>
                <input
                  id={inputId}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  disabled={busyStepId === step.id}
                  onChange={(event) => void upload(step, event.target.files?.[0])}
                />
                {preview && (
                  <button type="button" onClick={() => void remove(step)} disabled={busyStepId === step.id} className="secondary-action ml-0 mt-3 min-h-12 rounded-xl px-5 py-2 font-bold sm:ml-3">
                    Remover print
                  </button>
                )}
              </div>

              <div className="flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--surface-solid)] p-3">
                {preview ? (
                  <div className="relative h-[32rem] w-full">
                    <Image src={preview.url} alt={`Prévia administrativa: ${step.imageAlt}`} fill unoptimized sizes="(max-width: 1024px) 100vw, 45vw" className="object-contain" />
                    <span className="absolute bottom-2 left-2 rounded-lg bg-black/80 px-3 py-1 text-sm font-bold text-white">
                      {preview.width} × {preview.height} · {formatFileSize(preview.byteSize)}
                    </span>
                  </div>
                ) : (
                  <p className="max-w-xs text-center font-semibold text-[var(--muted)]">Nenhum print selecionado para este passo.</p>
                )}
              </div>
            </article>
          );
        })}
      </div>}
    </div>
  );
}
