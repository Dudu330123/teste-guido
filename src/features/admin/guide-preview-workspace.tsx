"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  GuideCreationForm,
  type GuideCreationApplicationOption,
  type GuideEditorInitialValue,
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

export function GuidePreviewWorkspace({
  applications,
}: {
  applications: GuideCreationApplicationOption[];
}) {
  const [drafts, setDrafts] = useState<GuidePreviewDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<GuidePreviewDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePreviewValidated = (draft: GuidePreviewDraft) => {
    setDrafts((current) => [draft, ...current.filter((item) => (
      item.taskId !== draft.taskId
    ))]);
    setSelectedId(draft.id);
    setPendingDeleteId(null);
    setEditingDraft(null);
  };

  const handleDelete = (draft: GuidePreviewDraft) => {
    setDrafts((current) => current.filter((item) => item.id !== draft.id));
    setSelectedId((current) => current === draft.id ? null : current);
    setPendingDeleteId(null);
  };

  const selectedDraft = drafts.find((draft) => draft.id === selectedId);

  const editorInitialValues: GuideEditorInitialValue | undefined = editingDraft
    ? {
        tutorialId: editingDraft.taskId,
        applicationSlug: editingDraft.applicationSlug,
        applicationName: editingDraft.applicationName,
        applicationCategory: editingDraft.applicationCategory,
        title: editingDraft.title,
        slug: editingDraft.slug,
        description: editingDraft.description,
        difficulty: editingDraft.difficulty,
        safetyWarning: editingDraft.safetyWarning,
        appVersion: editingDraft.appVersion,
        guideVersion: editingDraft.guideVersion,
        estimatedMinutes: editingDraft.estimatedMinutes,
        searchTerms: editingDraft.searchTerms,
        updatedAt: editingDraft.updatedAt,
        steps: editingDraft.steps.map((step) => ({
          id: step.id,
          title: step.title,
          instruction: step.instruction,
          imageAlt: step.imageAlt,
          warning: step.warning,
          confirmationMessage: step.confirmationMessage,
          hasPrint: step.imageStatus !== "pending",
        })),
      }
    : undefined;

  const reviewSummary = useMemo(() => ({
    total: drafts.length,
    awaiting: drafts.filter((draft) => draft.reviewStatus === "awaiting-images").length,
    inReview: drafts.filter((draft) => draft.reviewStatus === "in-review").length,
    ready: drafts.filter((draft) => draft.reviewStatus === "ready-for-human-review").length,
  }), [drafts]);

  const updateImageStatus = (draftId: string, stepId: string, imageStatus: GuidePreviewImageStatus) => {
    setDrafts((current) => current.map((draft) => {
      if (draft.id !== draftId) return draft;
      const steps = draft.steps.map((step) => step.id === stepId ? { ...step, imageStatus } : step);
      return { ...draft, steps, reviewStatus: getReviewStatus(steps), updatedAt: new Date().toISOString() };
    }));
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

  return (
    <>
      <GuideCreationForm
        key={editingDraft?.id ?? "new-guide"}
        applications={applications}
        previewOnly
        backHref="/"
        backLabel="← Voltar para o início"
        onPreviewValidated={handlePreviewValidated}
        mode={editingDraft ? "edit" : "create"}
        editId={editingDraft?.id}
        initialValues={editorInitialValues}
      />

      <section className="guide-local-workspace internal-page-content internal-page-content--compact" id="rascunhos-locais" aria-labelledby="local-drafts-title">
        <header className="guide-local-header">
          <div>
            <p className="internal-page-eyebrow">Antes do Supabase</p>
            <h2 id="local-drafts-title">Tarefas locais</h2>
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
            onSelect={(draft) => setSelectedId((current) => current === draft.id ? null : draft.id)}
            onRequestDelete={(draft) => setPendingDeleteId((current) => current === draft.id ? null : draft.id)}
            onConfirmDelete={handleDelete}
            onCancelDelete={() => setPendingDeleteId(null)}
          />
        )}

        {selectedDraft && (
          <section className="guide-local-detail" aria-labelledby="local-draft-detail-title">
            <header>
              <div>
                <p className="internal-page-eyebrow">Revisão local</p>
                <h2 id="local-draft-detail-title">{selectedDraft.title}</h2>
                <p>{selectedDraft.applicationName} · {stepCountLabel(selectedDraft.steps.length)} · slug: {selectedDraft.slug}</p>
              </div>
              <div className="guide-local-detail-actions">
                <span className={`guide-local-status ${reviewStatusClass(selectedDraft.reviewStatus)}`}>{statusLabel(selectedDraft.reviewStatus)}</span>
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => {
                    setEditingDraft(selectedDraft);
                    document.getElementById("criar-guia")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Editar roteiro
                </button>
                <button type="button" className="secondary-action guide-local-export-action" onClick={() => downloadJson([selectedDraft], `${selectedDraft.slug}.json`)}>Exportar JSON</button>
                <button type="button" className="secondary-action" onClick={() => setSelectedId(null)}>Fechar detalhes</button>
              </div>
            </header>

            <div className="guide-local-identifiers" role="note">
              <span><strong>taskId:</strong> {selectedDraft.taskId}</span>
              <span><strong>guideId:</strong> {selectedDraft.guideId}</span>
              <span><strong>versão:</strong> {selectedDraft.guideVersion}</span>
            </div>

            <ol className="guide-local-step-list">
              {selectedDraft.steps.map((step, index) => (
                <li key={step.id}>
                  <div className="guide-local-step-number" aria-hidden="true">{index + 1}</div>
                  <div className="guide-local-step-content">
                    <div className="guide-local-step-topline">
                      <p className="guide-local-step-label">Passo {index + 1}</p>
                      <span className={`guide-local-image-status ${imageStatusClass(step.imageStatus)}`}>{imageStatusLabel(step.imageStatus)}</span>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.instruction}</p>
                    <div className="guide-local-image-note" role="note">
                      <strong>{step.imagePath ? "Imagem vinculada localmente" : "Imagem ainda não adicionada"}</strong>
                      <span>Descrição esperada: {step.imageAlt}</span>
                      {step.imagePath && <span>Arquivo: {step.imagePath}{step.imageSource ? ` · Fonte: ${step.imageSource}` : ""}</span>}
                    </div>
                    <p className="guide-local-editorial-key"><strong>Chave da etapa:</strong> {step.editorialKey}</p>
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
    </>
  );
}
