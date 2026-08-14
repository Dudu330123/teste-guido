"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { GuideStep, OperatingSystem } from "@/types/content";
import type { SharedGuideImageDraft } from "./shared-guide-image";
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

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2).replace(".", ",")} MB`;
}

export function GuideAdmin({ guides, bankApplications }: GuideAdminProps) {
  const [guideSlug, setGuideSlug] = useState("");
  const [applicationSlug, setApplicationSlug] = useState("");
  const [operatingSystem, setOperatingSystem] = useState<OperatingSystem>("android");
  const [drafts, setDrafts] = useState<Record<string, SharedGuideImageDraft>>({});
  const [message, setMessage] = useState("Selecione um guia para carregar as imagens públicas.");
  const [busyStepId, setBusyStepId] = useState<string | null>(null);
  const [confirmedSafe, setConfirmedSafe] = useState(false);

  const selectedGuide = guides.find((guide) => guide.slug === guideSlug);
  const needsApplication = selectedGuide?.category === "bank";
  const selectionComplete = Boolean(selectedGuide && (!needsApplication || applicationSlug));
  const steps = useMemo(
    () => selectedGuide?.stepsByOperatingSystem[operatingSystem] ?? [],
    [operatingSystem, selectedGuide],
  );

  useEffect(() => {
    if (!selectionComplete || steps.length === 0) return;
    const controller = new AbortController();
    const search = new URLSearchParams({ guideSlug, operatingSystem });
    if (needsApplication) search.set("applicationSlug", applicationSlug);
    fetch(`/api/admin/guide-images?${search}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { data?: SharedGuideImageDraft[]; error?: { message?: string } };
        if (!response.ok) throw new Error(payload.error?.message ?? "Não foi possível carregar os prints.");
        const shared = payload.data ?? [];
        setDrafts(Object.fromEntries(shared.map((draft) => [draft.stepId, draft])));
        setMessage(shared.length ? "Imagens públicas carregadas." : "Nenhuma imagem pública para esta seleção.");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setDrafts({});
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar os prints.");
      });
    return () => controller.abort();
  }, [applicationSlug, guideSlug, needsApplication, operatingSystem, selectionComplete, steps.length]);

  const upload = async (step: GuideStep, file: File | undefined) => {
    if (!file) return;
    if (!confirmedSafe) {
      setMessage("Confirme primeiro que o print não contém dados pessoais ou bancários.");
      return;
    }
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
      const form = new FormData();
      form.set("file", file);
      form.set("guideSlug", guideSlug);
      form.set("applicationSlug", needsApplication ? applicationSlug : "");
      form.set("operatingSystem", operatingSystem);
      form.set("stepId", step.id);
      form.set("stepOrder", String(step.order));
      form.set("width", String(dimensions.width));
      form.set("height", String(dimensions.height));
      form.set("confirmedSafe", "true");
      const response = await fetch("/api/admin/guide-images", { method: "POST", body: form });
      const payload = await response.json() as { data?: SharedGuideImageDraft; error?: { message?: string } };
      if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "Não foi possível salvar o print.");
      const savedDraft = payload.data;
      setDrafts((current) => ({ ...current, [step.id]: savedDraft }));
      setMessage(`Print do passo ${step.order} publicado para todos os usuários.`);
    } catch {
      setMessage(`Não foi possível enviar o print do passo ${step.order}. Confira seu acesso e tente novamente.`);
    } finally {
      setBusyStepId(null);
    }
  };

  const remove = async (step: GuideStep) => {
    setBusyStepId(step.id);
    try {
      const response = await fetch("/api/admin/guide-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideSlug,
          applicationSlug: needsApplication ? applicationSlug : null,
          operatingSystem,
          stepId: step.id,
          stepOrder: step.order,
        }),
      });
      if (!response.ok) throw new Error("Falha ao remover");
      setDrafts((current) => {
        const next = { ...current };
        delete next[step.id];
        return next;
      });
      setMessage(`Print público do passo ${step.order} removido.`);
    } catch {
      setMessage("Não foi possível remover o print público.");
    } finally {
      setBusyStepId(null);
    }
  };

  return (
    <div className="mt-8">
      <div className="notice-warning rounded-2xl border-2 p-5" role="note">
        <p className="font-bold">Publicação imediata</p>
        <p className="mt-1">Somente administradores podem enviar. Em guias já navegáveis, o print aparece para todos assim que o upload termina. Nos demais, ele fica preparado até a liberação do guia.</p>
        <p className="mt-2 font-semibold">Os roteiros estão preparados para revisão. O upload de uma imagem não transforma o conteúdo em guia oficial ou validado.</p>
      </div>

      <section className="glass-panel mt-6 p-5" aria-labelledby="upload-help-title">
        <h2 id="upload-help-title" className="text-xl font-bold">Como preparar e enviar o print</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6">
          <li>Escolha o guia, o aplicativo e o tipo de celular.</li>
          <li>Capture a tela inteira, na posição vertical e sem cortar ou esticar a imagem.</li>
          <li>Remova ou oculte nomes, CPF, saldo, valores, códigos, boletos e qualquer dado real.</li>
          <li>Use <strong>PNG, JPEG ou WebP</strong>, com até <strong>10 MB</strong> e no máximo <strong>8192 × 8192 pixels</strong>.</li>
          <li>Marque a confirmação de segurança e use o botão <strong>Fazer upload do print</strong> no passo correspondente.</li>
          <li>Confira a prévia. O Guido preserva a proporção original e adapta a imagem à tela do usuário.</li>
        </ol>
        <p className="notice-info mt-4 rounded-xl p-4 font-semibold">Recomendado: print vertical na resolução original do celular, com no mínimo 720 pixels de largura. Não adicione moldura, marca d’água ou efeito visual.</p>
      </section>

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
                setDrafts({});
                setConfirmedSafe(false);
                setMessage("Selecione as opções para carregar as imagens públicas.");
              }}
              className="glass-control mt-2 min-h-14 w-full rounded-xl px-4"
            >
              <option value="">Selecione um guia</option>
              {guides.map((guide) => {
                const hasSteps = Object.values(guide.stepsByOperatingSystem).some((guideSteps) => guideSteps.length > 0);
                return <option key={guide.slug} value={guide.slug}>{guide.title}{hasSteps ? " — roteiro em revisão" : " — passos em preparação"}</option>;
              })}
            </select>
          </label>

          {needsApplication && (
            <label className="font-bold">
              2. Aplicativo do banco
              <select
                value={applicationSlug}
                onChange={(event) => {
                  setApplicationSlug(event.target.value);
                  setDrafts({});
                  setConfirmedSafe(false);
                  setMessage("Carregando imagens públicas…");
                }}
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
              <input
                type="radio"
                name="admin-os"
                value={value}
                checked={operatingSystem === value}
                onChange={() => {
                  setOperatingSystem(value);
                  setDrafts({});
                  setConfirmedSafe(false);
                  setMessage("Carregando imagens públicas…");
                }}
                className="size-5"
              />
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
          <p className="mt-2">Este item ainda não possui roteiro editorial. Não envie prints até que os passos sejam definidos.</p>
        </div>
      )}

      {selectionComplete && steps.length > 0 && (
        <label className="notice-warning mt-6 flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border-2 p-4 font-semibold">
          <input type="checkbox" checked={confirmedSafe} onChange={(event) => setConfirmedSafe(event.target.checked)} className="mt-1 size-5 shrink-0" />
          Confirmo que os prints não contêm nome, CPF, saldo, valor, beneficiário, senha, boleto ou qualquer dado pessoal real.
        </label>
      )}

      {selectionComplete && steps.length > 0 && <div className="mt-6 space-y-6">
        {steps.map((step) => {
          const preview = drafts[step.id];
          const inputId = `print-${guideSlug}-${applicationSlug || "sem-aplicativo"}-${operatingSystem}-${step.id}`;
          return (
            <article key={step.id} className="glass-panel grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(16rem,0.8fr)_1.2fr]">
              <div>
                <p className="font-bold text-[var(--primary)]">Passo {step.order} de {steps.length}</p>
                <h2 className="mt-1 text-2xl font-bold">{step.title}</h2>
                <p className="mt-3">{step.instruction}</p>
                <p className="mt-3 text-sm text-[var(--muted)]"><strong>Texto alternativo:</strong> {step.imageAlt}</p>
                <label
                  htmlFor={inputId}
                  aria-disabled={busyStepId === step.id || !confirmedSafe}
                  className="primary-action mt-5 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-5 py-2 font-bold aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
                >
                  {preview ? "Substituir print" : "Fazer upload do print"}
                </label>
                <input
                  id={inputId}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  disabled={busyStepId === step.id || !confirmedSafe}
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
                    <Image src={preview.previewUrl} alt={`Prévia administrativa: ${step.imageAlt}`} fill unoptimized sizes="(max-width: 1024px) 100vw, 45vw" className="object-contain" />
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
