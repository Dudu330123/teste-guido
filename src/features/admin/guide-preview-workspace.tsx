"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import {
  GuideCreationForm,
  type GuideCreationApplicationOption,
  type GuidePreviewAction,
} from "./guide-creation-form";
import { GuideLibrary } from "./guide-library";
import {
  GUIDE_PREVIEW_MAX_IMPORT_BYTES,
  createGuidePreviewDraft,
  createGuidePreviewExport,
  getReviewStatus,
  normalizeGuidePreviewDraft,
  normalizeGuidePreviewExport,
  type GuidePreviewDraft,
  type GuidePreviewImageStatus,
  type GuidePreviewReviewStatus,
} from "./guide-preview-draft";

const storageKey = "guido:local-guide-preview-drafts:v2";
const legacyStorageKey = "guido:local-guide-preview-drafts:v1";

const exampleDraft = createGuidePreviewDraft({
  source: "example",
  applicationId: "app-demo-bancos",
  applicationName: "Banco — demonstração",
  applicationCategory: "Bancos",
  updatedAt: "2026-08-28T12:00:00.000Z",
  guide: {
    applicationSlug: "banco-demonstracao",
    title: "Pagar um boleto",
    slug: "pagar-boleto",
    description: "Aprenda a reconhecer as etapas comuns, sem realizar um pagamento.",
    difficulty: "medium",
    safetyWarning: "Conteúdo demonstrativo, não oficial e pendente de validação humana.",
    appVersion: "genérica",
    guideVersion: "0.2-research",
    estimatedMinutes: 4,
    searchTerms: ["boleto", "código de barras"],
    steps: [
      { title: "Abra o aplicativo oficial", instruction: "Confirme o nome do seu banco e toque no aplicativo oficial para abri-lo.", imageAlt: "Tela inicial demonstrativa de celular com o aplicativo oficial do banco destacado.", warning: "", confirmationMessage: "" },
      { title: "Encontre a área de pagamento", instruction: "Depois de entrar na sua conta, procure Pagamentos, Pagar ou Pagar e transferir.", imageAlt: "Tela bancária demonstrativa com a área de pagamento destacada.", warning: "", confirmationMessage: "" },
      { title: "Escolha pagar boleto", instruction: "Toque em Boleto, Código de barras ou uma opção com nome parecido.", imageAlt: "Área demonstrativa de pagamentos com a opção de boleto ou código de barras destacada.", warning: "", confirmationMessage: "" },
      { title: "Informe o código no banco", instruction: "No aplicativo do banco, escolha ler o código com a câmera ou digitar os números do boleto.", imageAlt: "Tela demonstrativa oferecendo leitura por câmera ou digitação do código, sem dados reais.", warning: "", confirmationMessage: "" },
      { title: "Confira antes de pagar", instruction: "Compare o nome de quem receberá, o valor e o vencimento com o boleto. Se algo estiver diferente, pare.", imageAlt: "Tela demonstrativa de conferência com beneficiário, valor e vencimento fictícios.", warning: "Não continue se o aplicativo mostrar um recebedor ou valor diferente do boleto.", confirmationMessage: "" },
      { title: "Pare antes de confirmar", instruction: "O guia termina aqui, antes da senha e da confirmação. Só continue no banco se todos os dados estiverem corretos.", imageAlt: "Aviso de segurança indicando que o Guido não realiza nem confirma pagamentos.", warning: "Confira cuidadosamente o nome de quem receberá, o valor e o vencimento. O Guido nunca pede sua senha e nunca confirma pagamentos por você.", confirmationMessage: "Demonstração concluída sem realizar qualquer operação bancária." },
    ],
  },
});

function stepCountLabel(count: number) {
  return `${count} ${count === 1 ? "etapa" : "etapas"}`;
}

function statusLabel(status: GuidePreviewReviewStatus) {
  if (status === "in-review") return "Imagens em revisão";
  if (status === "ready-for-human-review") return "Pronta para revisão humana";
  return "Aguardando imagens";
}

function imageStatusLabel(status: GuidePreviewImageStatus) {
  if (status === "received") return "Imagem recebida";
  if (status === "validated") return "Imagem validada";
  return "Imagem pendente";
}

function imageStatusClass(status: GuidePreviewImageStatus) {
  if (status === "validated") return "is-validated";
  if (status === "received") return "is-received";
  return "is-pending";
}

function reviewStatusClass(status: GuidePreviewReviewStatus) {
  if (status === "ready-for-human-review") return "is-ready";
  if (status === "in-review") return "is-review";
  return "is-waiting";
}

function loadDrafts() {
  try {
    const stored = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(legacyStorageKey);
    if (stored === null) return [exampleDraft];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.map((item) => normalizeGuidePreviewDraft(item)).filter((item): item is GuidePreviewDraft => item !== null)
      : [exampleDraft];
  } catch {
    return [exampleDraft];
  }
}

type WorkspacePanel = "create" | "images" | "review";

const workspacePanels: WorkspacePanel[] = ["create", "images", "review"];

function technicalDetailsText(draft: GuidePreviewDraft) {
  return [
    `taskId: ${draft.taskId}`,
    `guideId: ${draft.guideId}`,
    `slug: ${draft.slug}`,
    `versão editorial: ${draft.guideVersion}`,
    ...draft.steps.map((step, index) => `chave da etapa ${index + 1}: ${step.editorialKey}`),
  ].join("\n");
}

export function GuidePreviewWorkspace({
  applications,
}: {
  applications: GuideCreationApplicationOption[];
}) {
  const [drafts, setDrafts] = useState<GuidePreviewDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedStepIds, setSelectedStepIds] = useState<string[]>([]);
  const [activePanel, setActivePanel] = useState<WorkspacePanel>("create");
  const [hydrated, setHydrated] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const createPanelHeadingRef = useRef<HTMLHeadingElement>(null);
  const imagesPanelHeadingRef = useRef<HTMLHeadingElement>(null);
  const reviewPanelHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      setDrafts(loadDrafts());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(drafts));
    } catch {
      // A lista continua funcionando em memória quando o navegador bloqueia o localStorage.
    }
  }, [drafts, hydrated]);

  const focusPanelHeading = (panel: WorkspacePanel) => {
    const headingRefs = {
      create: createPanelHeadingRef,
      images: imagesPanelHeadingRef,
      review: reviewPanelHeadingRef,
    };
    window.requestAnimationFrame(() => headingRefs[panel].current?.focus({ preventScroll: true }));
  };

  const selectPanel = (panel: WorkspacePanel, moveFocus = false) => {
    setActivePanel(panel);
    if (moveFocus) focusPanelHeading(panel);
  };

  const handlePanelTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % workspacePanels.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + workspacePanels.length) % workspacePanels.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = workspacePanels.length - 1;
    if (nextIndex === index) return;
    event.preventDefault();
    setActivePanel(workspacePanels[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  };

  const handlePreviewValidated = (draft: GuidePreviewDraft) => {
    setDrafts((current) => [draft, ...current.filter((item) => (
      item.taskId !== draft.taskId
    ))]);
    setSelectedId(draft.id);
    setPendingDeleteId(null);
    setSelectedStepIds([]);
  };

  const handleDelete = (draft: GuidePreviewDraft) => {
    setDrafts((current) => current.filter((item) => item.id !== draft.id));
    setSelectedId((current) => current === draft.id ? null : current);
    setPendingDeleteId(null);
    setSelectedStepIds([]);
  };

  const selectedDraft = drafts.find((draft) => draft.id === selectedId);

  const reviewSummary = useMemo(() => ({
    total: drafts.length,
    awaiting: drafts.filter((draft) => draft.reviewStatus === "awaiting-images").length,
    inReview: drafts.filter((draft) => draft.reviewStatus === "in-review").length,
    ready: drafts.filter((draft) => draft.reviewStatus === "ready-for-human-review").length,
  }), [drafts]);

  const updateImageStatuses = (draftId: string, stepIds: string[], imageStatus: GuidePreviewImageStatus) => {
    if (stepIds.length === 0) return;
    const selectedSteps = new Set(stepIds);
    setDrafts((current) => current.map((draft) => {
      if (draft.id !== draftId) return draft;
      const steps = draft.steps.map((step) => selectedSteps.has(step.id) ? { ...step, imageStatus } : step);
      return { ...draft, steps, reviewStatus: getReviewStatus(steps), updatedAt: new Date().toISOString() };
    }));
    setSelectedStepIds([]);
  };

  const updateImageStatus = (draftId: string, stepId: string, imageStatus: GuidePreviewImageStatus) => {
    updateImageStatuses(draftId, [stepId], imageStatus);
  };

  const handleBulkStatusChange = (imageStatus: GuidePreviewImageStatus) => {
    if (!selectedDraft || selectedStepIds.length === 0) return;
    const action = imageStatus === "received" ? "marcar as etapas selecionadas como recebidas" : "validar as etapas selecionadas";
    const confirmed = window.confirm(`Confirme: ${action}?\n\n${selectedStepIds.length} ${selectedStepIds.length === 1 ? "etapa será alterada" : "etapas serão alteradas"}.`);
    if (confirmed) updateImageStatuses(selectedDraft.id, selectedStepIds, imageStatus);
  };

  const toggleAllSteps = () => {
    if (!selectedDraft) return;
    setSelectedStepIds((current) => current.length === selectedDraft.steps.length ? [] : selectedDraft.steps.map((step) => step.id));
  };

  const handlePreviewAction = (action: GuidePreviewAction) => {
    if (action === "open") {
      selectPanel("review", true);
      return;
    }
    if (action === "images") {
      selectPanel("images", true);
      return;
    }
    setSelectedId(null);
    setSelectedStepIds([]);
    setPendingDeleteId(null);
    selectPanel("create", true);
  };

  const copyTechnicalDetails = async () => {
    if (!selectedDraft) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(technicalDetailsText(selectedDraft));
      setCopyMessage("Detalhes técnicos copiados.");
    } catch {
      setCopyMessage("Não foi possível copiar. Selecione os detalhes manualmente.");
    }
  };

  const downloadJson = (guides: GuidePreviewDraft[], filename: string) => {
    const blob = new Blob([JSON.stringify(createGuidePreviewExport(guides), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > GUIDE_PREVIEW_MAX_IMPORT_BYTES) {
      setImportMessage("Esse arquivo é muito grande. Use um JSON com no máximo 2 MB.");
      return;
    }

    try {
      const imported = normalizeGuidePreviewExport(JSON.parse(await file.text()));
      if (imported.length === 0) {
        setImportMessage("Nenhum guia válido foi encontrado. Exporte um JSON da prévia do Guido.");
        return;
      }
      setDrafts((current) => {
        const byTask = new Map(current.map((draft) => [draft.taskId, draft]));
        imported.forEach((draft) => byTask.set(draft.taskId, draft));
        return [...byTask.values()].sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
      });
      setSelectedId(imported[0]?.id ?? null);
      setImportMessage(`${imported.length} ${imported.length === 1 ? "guia importado" : "guias importados"} para a lista local.`);
    } catch {
      setImportMessage("Não foi possível ler este arquivo. Confira se ele é um JSON válido.");
    }
  };

  const activePanelIndex = workspacePanels.indexOf(activePanel);
  const activePanelLabel = { create: "Criar guia", images: "Fila de prints", review: "Revisar" }[activePanel];

  return (
    <div className="guide-preview-workspace">
      <section className="guide-preview-onboarding internal-page-content internal-page-content--compact" aria-labelledby="guide-preview-onboarding-title">
        <p className="internal-page-eyebrow">Fluxo recomendado</p>
        <h1 id="guide-preview-onboarding-title">Crie e revise em três passos</h1>
        <ol className="guide-preview-onboarding-list">
          <li><strong>1. Prévia local</strong><span>Monte o roteiro e descreva os prints esperados.</span></li>
          <li><strong>2. Validação</strong><span>Confira os campos e crie uma cópia local para trabalhar.</span></li>
          <li><strong>3. Revisão humana</strong><span>Confira o material e os prints antes de qualquer publicação.</span></li>
        </ol>
        <p className="guide-preview-onboarding-note" role="note"><strong>Importante:</strong> validar só confere os campos e cria um rascunho neste navegador. Não salva nem publica automaticamente.</p>
      </section>

      <div className="guide-preview-progress internal-page-content internal-page-content--compact" aria-live="polite">
        <strong>Etapa {activePanelIndex + 1} de 3: {activePanelLabel}</strong>
        <span>{activePanel === "create" ? "Comece pelo roteiro." : activePanel === "images" ? "Organize os prints por etapa." : "Faça a conferência final."}</span>
      </div>

      <div className="guide-preview-tabs internal-page-content internal-page-content--compact" role="tablist" aria-label="Etapas do fluxo de guias">
        {workspacePanels.map((panel, index) => {
          const labels = { create: "Criar guia", images: "Fila de prints", review: "Revisar" };
          const descriptions = {
            create: "Comece por aqui",
            images: drafts.length === 0 ? "Depois de validar" : `${drafts.length} ${drafts.length === 1 ? "guia" : "guias"}`,
            review: selectedDraft ? "Roteiro selecionado" : "Escolha um roteiro",
          };
          const tabId = `guide-preview-tab-${panel}`;
          const panelId = `guide-preview-panel-${panel}`;
          return (
            <button
              key={panel}
              ref={(element) => { tabRefs.current[index] = element; }}
              type="button"
              id={tabId}
              role="tab"
              aria-selected={activePanel === panel}
              aria-controls={panelId}
              tabIndex={activePanel === panel ? 0 : -1}
              className={`guide-preview-tab ${activePanel === panel ? "is-active" : ""}`}
              onClick={() => selectPanel(panel)}
              onKeyDown={(event) => handlePanelTabKeyDown(event, index)}
            >
              <span className="guide-preview-tab-number" aria-hidden="true">{index + 1}</span>
              <span><strong>{labels[panel]}</strong><small>{descriptions[panel]}</small></span>
            </button>
          );
        })}
      </div>

      <section id="guide-preview-panel-create" className="guide-preview-panel" role="tabpanel" aria-labelledby="guide-create-panel-title" hidden={activePanel !== "create"}>
        <div className="guide-preview-panel-heading internal-page-content internal-page-content--compact">
          <Link href="/" className="guide-preview-panel-back">← Voltar ao início</Link>
          <p className="internal-page-eyebrow">Etapa 1 · Criar guia</p>
          <h2 id="guide-create-panel-title" ref={createPanelHeadingRef} tabIndex={-1}>Monte o roteiro</h2>
          <p>Preencha as informações essenciais. A prévia local não altera o banco nem publica conteúdo.</p>
        </div>
        <GuideCreationForm
          applications={applications}
          previewOnly
          hidePageIntro
          backHref="/"
          backLabel="← Voltar para o início"
          onPreviewValidated={handlePreviewValidated}
          onPreviewAction={handlePreviewAction}
        />
      </section>

      <section id="guide-preview-panel-images" className="guide-preview-panel" role="tabpanel" aria-labelledby="local-drafts-title" hidden={activePanel !== "images"}>
        <section className="guide-local-workspace internal-page-content internal-page-content--compact" id="rascunhos-locais" aria-labelledby="local-drafts-title">
          <header className="guide-local-header">
            <div>
              <p className="internal-page-eyebrow">Etapa 2 · Fila de prints</p>
              <h2 id="local-drafts-title" ref={imagesPanelHeadingRef} tabIndex={-1}>Fila de prints</h2>
              <p>Organize os guias criados nesta prévia, confira cada passo e prepare o material para o agente de imagens.</p>
            </div>
            <div className="guide-local-header-actions">
              <span className="guide-local-count" aria-live="polite">
                {hydrated ? `${drafts.length} ${drafts.length === 1 ? "guia" : "guias"}` : "Carregando…"}
              </span>
              <button type="button" className="secondary-action guide-local-export-action" onClick={() => downloadJson(drafts, "guido-guias-locais.json")} disabled={!hydrated || drafts.length === 0}>Exportar todos</button>
              <button type="button" className="primary-action guide-local-import-action" onClick={() => fileInputRef.current?.click()}>Importar JSON</button>
              <input ref={fileInputRef} className="guide-local-file-input" type="file" accept="application/json,.json" aria-label="Escolher arquivo JSON de guias" onChange={handleImport} />
            </div>
          </header>

          <div className="guide-local-notice" role="note">
            <strong>Somente neste computador</strong>
            <span> Nada desta lista é enviado ao Supabase. A exclusão também não altera o banco real.</span>
          </div>

          <div className="guide-local-summary" aria-label="Resumo dos rascunhos locais">
            <div className="guide-local-summary-item is-total">
              <span>Guias na fila</span>
              <strong>{hydrated ? reviewSummary.total : "—"}</strong>
              <small>neste navegador</small>
            </div>
            <div className="guide-local-summary-item is-waiting">
              <span>Aguardando prints</span>
              <strong>{hydrated ? reviewSummary.awaiting : "—"}</strong>
              <small>para o agente de imagens</small>
            </div>
            <div className="guide-local-summary-item is-review">
              <span>Em conferência</span>
              <strong>{hydrated ? reviewSummary.inReview : "—"}</strong>
              <small>imagens recebidas</small>
            </div>
            <div className="guide-local-summary-item is-ready">
              <span>Prontos para revisar</span>
              <strong>{hydrated ? reviewSummary.ready : "—"}</strong>
              <small>nenhuma etapa pendente</small>
            </div>
          </div>

          {importMessage && <p className="guide-local-import-message" role="status">{importMessage}</p>}

          {!hydrated ? (
            <div className="guide-local-empty" role="status">Carregando seus rascunhos locais…</div>
          ) : drafts.length === 0 ? (
            <div className="guide-local-empty" role="status">
              <strong>Nenhum rascunho local</strong>
              <span>Preencha e valide um guia acima para ele aparecer nesta lista.</span>
            </div>
          ) : (
            <GuideLibrary
              guides={drafts}
              applications={applications}
              selectedId={selectedId}
              pendingDeleteId={pendingDeleteId}
              onSelect={(draft) => {
                setSelectedId((current) => current === draft.id ? null : draft.id);
                setSelectedStepIds([]);
                setCopyMessage("");
              }}
              onRequestDelete={(draft) => setPendingDeleteId((current) => current === draft.id ? null : draft.id)}
              onConfirmDelete={handleDelete}
              onCancelDelete={() => setPendingDeleteId(null)}
            />
          )}

          {selectedDraft && (
            <section className="guide-local-detail" aria-labelledby="local-draft-detail-title">
              <header>
                <div>
                  <p className="internal-page-eyebrow">Fila de imagens</p>
                  <h2 id="local-draft-detail-title">{selectedDraft.title}</h2>
                  <p>{selectedDraft.applicationName} · {stepCountLabel(selectedDraft.steps.length)} · categoria: {selectedDraft.applicationCategory}</p>
                </div>
                <div className="guide-local-detail-actions">
                  <span className={`guide-local-status ${reviewStatusClass(selectedDraft.reviewStatus)}`}>{statusLabel(selectedDraft.reviewStatus)}</span>
                  <button type="button" className="secondary-action guide-local-export-action" onClick={() => downloadJson([selectedDraft], `${selectedDraft.slug}.json`)}>Exportar JSON</button>
                  <button type="button" className="secondary-action" onClick={() => { setSelectedId(null); setSelectedStepIds([]); }}>Fechar detalhes</button>
                </div>
              </header>

              <div className="guide-local-bulk-toolbar" aria-label="Ações em lote da fila de prints">
                <div>
                  <strong>Selecione uma ou mais etapas</strong>
                  <span>{selectedStepIds.length} {selectedStepIds.length === 1 ? "selecionada" : "selecionadas"}</span>
                </div>
                <div className="guide-local-bulk-actions">
                  <button type="button" className="secondary-action" onClick={toggleAllSteps}>{selectedStepIds.length === selectedDraft.steps.length ? "Desmarcar todas" : "Selecionar todas"}</button>
                  <button type="button" className="secondary-action" onClick={() => handleBulkStatusChange("received")} disabled={selectedStepIds.length === 0}>Marcar selecionadas como recebidas</button>
                  <button type="button" className="primary-action" onClick={() => handleBulkStatusChange("validated")} disabled={selectedStepIds.length === 0}>Validar selecionadas</button>
                </div>
              </div>

              <ol className="guide-local-step-list">
                {selectedDraft.steps.map((step, index) => (
                  <li key={step.id}>
                    <div className="guide-local-step-number" aria-hidden="true">{index + 1}</div>
                    <div className="guide-local-step-content">
                      <div className="guide-local-step-topline">
                        <p className="guide-local-step-label">Passo {index + 1}</p>
                        <label className="guide-local-step-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedStepIds.includes(step.id)}
                            onChange={() => setSelectedStepIds((current) => current.includes(step.id) ? current.filter((id) => id !== step.id) : [...current, step.id])}
                            aria-label={`Selecionar etapa ${index + 1}: ${step.title}`}
                          />
                          <span>Selecionar</span>
                        </label>
                        <span className={`guide-local-image-status ${imageStatusClass(step.imageStatus)}`}>{imageStatusLabel(step.imageStatus)}</span>
                      </div>
                      <h3>{step.title}</h3>
                      <p>{step.instruction}</p>
                      <div className="guide-local-image-note" role="note">
                        <strong>{step.imagePath ? "Imagem vinculada localmente" : "Imagem ainda não adicionada"}</strong>
                        <span>Descrição esperada: {step.imageAlt}</span>
                        {step.imagePath && <span>Arquivo: {step.imagePath}{step.imageSource ? ` · Fonte: ${step.imageSource}` : ""}</span>}
                      </div>
                      <div className="guide-local-step-actions" aria-label={`Status da imagem do passo ${index + 1}`}>
                        {step.imageStatus === "pending" && <button type="button" className="secondary-action" onClick={() => updateImageStatus(selectedDraft.id, step.id, "received")}>Simular imagem recebida</button>}
                        {step.imageStatus === "received" && <button type="button" className="secondary-action" onClick={() => updateImageStatus(selectedDraft.id, step.id, "validated")}>Marcar imagem como validada</button>}
                        {step.imageStatus === "validated" && <button type="button" className="secondary-action" onClick={() => updateImageStatus(selectedDraft.id, step.id, "received")}>Reabrir validação</button>}
                      </div>
                      {step.warning && <p className="guide-local-warning"><strong>Aviso:</strong> {step.warning}</p>}
                      {step.confirmationMessage && <p className="guide-local-confirmation"><strong>Após confirmar:</strong> {step.confirmationMessage}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </section>
      </section>

      <section id="guide-preview-panel-review" className="guide-preview-panel" role="tabpanel" aria-labelledby="guide-review-panel-title" hidden={activePanel !== "review"}>
        <section className="guide-review-panel internal-page-content internal-page-content--compact">
          <header className="guide-review-header">
            <div>
              <p className="internal-page-eyebrow">Etapa 3 · Revisão humana</p>
              <h2 id="guide-review-panel-title" ref={reviewPanelHeadingRef} tabIndex={-1}>Revisar roteiro</h2>
              <p>Confira o texto, os avisos e o estado dos prints antes de encaminhar o material.</p>
            </div>
            {selectedDraft && <span className={`guide-local-status ${reviewStatusClass(selectedDraft.reviewStatus)}`}>{statusLabel(selectedDraft.reviewStatus)}</span>}
          </header>

          {!selectedDraft ? (
            <div className="guide-local-empty" role="status">
              <strong>Nenhum roteiro selecionado</strong>
              <span>Valide uma prévia ou escolha um roteiro na fila de prints para começar a revisão.</span>
              <button type="button" className="secondary-action guide-local-clear-filters" onClick={() => selectPanel("images", true)}>Ir para fila de prints</button>
            </div>
          ) : (
            <>
              <div className="guide-review-overview">
                <div>
                  <span>Roteiro</span>
                  <h3>{selectedDraft.title}</h3>
                  <small>{selectedDraft.applicationName} · categoria: {selectedDraft.applicationCategory} · {stepCountLabel(selectedDraft.steps.length)}</small>
                </div>
                <button type="button" className="secondary-action" onClick={() => selectPanel("images", true)}>Voltar para fila de prints</button>
              </div>

              <ol className="guide-review-step-list">
                {selectedDraft.steps.map((step, index) => (
                  <li key={step.id}>
                    <div className="guide-review-step-heading">
                      <span className="guide-local-step-label">Passo {index + 1}</span>
                      <span className={`guide-local-image-status ${imageStatusClass(step.imageStatus)}`}>{imageStatusLabel(step.imageStatus)}</span>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.instruction}</p>
                    {step.warning && <p className="guide-local-warning"><strong>Aviso:</strong> {step.warning}</p>}
                    {step.confirmationMessage && <p className="guide-local-confirmation"><strong>Após confirmar:</strong> {step.confirmationMessage}</p>}
                  </li>
                ))}
              </ol>

              <details className="guide-local-technical-details">
                <summary>Detalhes técnicos</summary>
                <div className="guide-local-technical-content">
                  <dl className="guide-local-meta guide-local-meta--three">
                    <div><dt>taskId</dt><dd>{selectedDraft.taskId}</dd></div>
                    <div><dt>guideId</dt><dd>{selectedDraft.guideId}</dd></div>
                    <div><dt>Slug</dt><dd>{selectedDraft.slug}</dd></div>
                    <div><dt>Versão editorial</dt><dd>{selectedDraft.guideVersion}</dd></div>
                  </dl>
                  <div className="guide-local-technical-keys">
                    <strong>Chaves das etapas</strong>
                    <ul>
                      {selectedDraft.steps.map((step, index) => <li key={step.id}>Passo {index + 1}: <code>{step.editorialKey}</code></li>)}
                    </ul>
                  </div>
                  <div className="guide-local-technical-actions">
                    <button type="button" className="secondary-action" onClick={copyTechnicalDetails}>Copiar detalhes técnicos</button>
                    {copyMessage && <span role="status">{copyMessage}</span>}
                  </div>
                </div>
              </details>
            </>
          )}
        </section>
      </section>
    </div>
  );
}
