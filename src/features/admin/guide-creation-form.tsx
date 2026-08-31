"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { ApplicationSearch, type ApplicationSearchOption } from "./application-search";
import {
  normalizeApplicationCreationInput,
  type ApplicationCreationInput,
} from "./application-creation-validation";
import {
  GUIDE_STEP_MAX,
  GUIDE_STEP_MIN,
  normalizeGuideCreationInput,
  normalizeGuideEditInput,
  slugifyGuideTitle,
  type GuideCreationInput,
  type GuideEditInput,
} from "./guide-creation-validation";
import { createGuidePreviewDraft, type GuidePreviewDraft } from "./guide-preview-draft";

export type { GuidePreviewDraft } from "./guide-preview-draft";

export interface GuideCreationApplicationOption extends ApplicationSearchOption {
  categoryId?: string;
  guideCount?: number;
}

export interface GuideCreationCategoryOption {
  id: string;
  name: string;
}

export interface GuideEditorStepValue {
  id?: string;
  pairedId?: string;
  title: string;
  instruction: string;
  imageAlt: string;
  warning: string;
  confirmationMessage: string;
  hasPrint?: boolean;
}

interface GuideFormState {
  applicationSlug: string;
  title: string;
  slug: string;
  description: string;
  difficulty: GuideCreationInput["difficulty"];
  safetyWarning: string;
  appVersion: string;
  guideVersion: string;
  estimatedMinutes: number;
  searchTerms: string;
  steps: GuideEditorStepValue[];
}

export interface GuideEditorInitialValue {
  tutorialId: string;
  applicationSlug: string;
  applicationName?: string;
  applicationCategory?: string;
  title: string;
  slug: string;
  description: string;
  difficulty: GuideCreationInput["difficulty"];
  safetyWarning: string;
  appVersion: string;
  guideVersion: string;
  estimatedMinutes: number;
  searchTerms: string[];
  updatedAt: string;
  reviewHref?: string;
  steps: GuideEditorStepValue[];
}

interface SavedGuideEdit {
  tutorialId: string;
  slug: string;
  updatedAt?: string;
  reviewHref?: string;
}

interface NewApplicationState {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
}

interface CreatedGuide {
  tutorialId: string;
  slug: string;
  guideVersionIds: { android: string; ios: string };
  stepCount: number;
}

interface PreviewResult {
  slug: string;
  stepCount: number;
  applicationName?: string;
}

interface CreatedApplicationGuide {
  application: { id: string; slug: string; name: string; category: string };
  guide: CreatedGuide;
}

type CreationMode = "existing" | "new";

export type GuidePreviewAction = "open" | "images" | "new";

const localPreviewCategoryId = "00000000-0000-4000-8000-000000000099";

function emptyStep(): GuideEditorStepValue {
  return {
    title: "",
    instruction: "",
    imageAlt: "",
    warning: "",
    confirmationMessage: "",
  };
}

function hasStepContent(step: GuideEditorStepValue) {
  return [step.title, step.instruction, step.imageAlt, step.warning, step.confirmationMessage]
    .some((value) => value.trim().length > 0);
}

function stepCountLabel(count: number) {
  return `${count} ${count === 1 ? "etapa" : "etapas"} do roteiro`;
}

function initialForm(
  applications: GuideCreationApplicationOption[],
  initialValues?: GuideEditorInitialValue,
): GuideFormState {
  if (initialValues) {
    return {
      applicationSlug: initialValues.applicationSlug,
      title: initialValues.title,
      slug: initialValues.slug,
      description: initialValues.description,
      difficulty: initialValues.difficulty,
      safetyWarning: initialValues.safetyWarning,
      appVersion: initialValues.appVersion,
      guideVersion: initialValues.guideVersion,
      estimatedMinutes: initialValues.estimatedMinutes,
      searchTerms: initialValues.searchTerms.join(", "),
      steps: initialValues.steps.length > 0 ? initialValues.steps : [emptyStep()],
    };
  }
  return {
    applicationSlug: applications[0]?.slug ?? "",
    title: "",
    slug: "",
    description: "",
    difficulty: "medium",
    safetyWarning: "",
    appVersion: "genérica",
    guideVersion: "0.1",
    estimatedMinutes: 5,
    searchTerms: "",
    steps: [emptyStep()],
  };
}

function initialNewApplication(
  applications: GuideCreationApplicationOption[],
  categories: GuideCreationCategoryOption[] | undefined,
  previewOnly: boolean,
): NewApplicationState {
  const firstCategoryOption = categories?.[0]
    ?? applications
      .filter((application) => application.category)
      .map((application) => ({
        id: application.categoryId ?? (previewOnly ? `preview-${slugifyGuideTitle(application.category)}` : ""),
        name: application.category,
      }))
      .find((category) => category.id);
  return {
    name: "",
    slug: "",
    categoryId: firstCategoryOption?.id ?? "",
    description: "",
  };
}

function getGuidePayload(form: GuideFormState, applicationSlug: string) {
  return {
    ...form,
    applicationSlug,
    estimatedMinutes: Number(form.estimatedMinutes),
    searchTerms: form.searchTerms.split(",").map((term) => term.trim()).filter(Boolean),
  };
}

export function GuideCreationForm({
  applications,
  categories,
  existingGuideSlugs = [],
  previewOnly = false,
  backHref = "/admin",
  backLabel = "← Voltar para administração",
  hidePageIntro = false,
  onPreviewValidated,
  onPreviewAction,
  mode = "create",
  initialValues,
  editId,
}: {
  applications: GuideCreationApplicationOption[];
  categories?: GuideCreationCategoryOption[];
  existingGuideSlugs?: string[];
  previewOnly?: boolean;
  backHref?: string;
  backLabel?: string;
  hidePageIntro?: boolean;
  onPreviewValidated?: (draft: GuidePreviewDraft) => void;
  onPreviewAction?: (action: GuidePreviewAction) => void;
  mode?: "create" | "edit";
  initialValues?: GuideEditorInitialValue;
  editId?: string;
}) {
  const isEditing = mode === "edit";
  const [form, setForm] = useState<GuideFormState>(() => initialForm(applications, initialValues));
  const [creationMode, setCreationMode] = useState<CreationMode>("existing");
  const [newApplication, setNewApplication] = useState<NewApplicationState>(() => initialNewApplication(applications, categories, previewOnly));
  const [newApplicationSlugEdited, setNewApplicationSlugEdited] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [stepCount, setStepCount] = useState<number | "">(initialValues?.steps.length || GUIDE_STEP_MIN);
  const [stepCountMessage, setStepCountMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [createdGuide, setCreatedGuide] = useState<CreatedGuide | null>(null);
  const [createdApplicationSlug, setCreatedApplicationSlug] = useState("");
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [savedEdit, setSavedEdit] = useState<SavedGuideEdit | null>(null);

  const categoryOptions = useMemo(() => {
    if (categories !== undefined) {
      return categories
        .filter((category) => category.id && category.name.trim())
        .map((category) => ({ id: category.id, name: category.name.trim() }))
        .sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
    }

    const categoryMap = new Map<string, { id: string; name: string }>();
    applications.forEach((application) => {
      if (!application.category) return;
      const id = application.categoryId ?? (previewOnly ? `preview-${slugifyGuideTitle(application.category)}` : "");
      if (!id) return;
      if (!categoryMap.has(id)) categoryMap.set(id, { id, name: application.category });
    });
    return [...categoryMap.values()].sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
  }, [applications, categories, previewOnly]);

  const duplicateGuideSlug = !isEditing && Boolean(form.slug && existingGuideSlugs.includes(form.slug));

  const selectedApplication = applications.find((application) => application.slug === form.applicationSlug);

  const updateStep = (index: number, field: keyof Pick<GuideEditorStepValue, "title" | "instruction" | "imageAlt" | "warning" | "confirmationMessage">, value: string) => {
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[`steps.${index}.${field}`];
      return next;
    });
    setForm((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [field]: value } : step,
      ),
    }));
  };

  const resizeSteps = (nextCount: number) => {
    if (!Number.isInteger(nextCount) || nextCount < GUIDE_STEP_MIN || nextCount > GUIDE_STEP_MAX) {
      setStepCount(form.steps.length);
      setStepCountMessage(`Escolha entre ${GUIDE_STEP_MIN} e ${GUIDE_STEP_MAX} etapas.`);
      return;
    }

    const currentCount = form.steps.length;
    if (nextCount < currentCount) {
      const removedCount = currentCount - nextCount;
      const removedSteps = form.steps.slice(nextCount);
      if (removedSteps.some(hasStepContent)) {
        const confirmed = window.confirm(
          `Confirme: Remover as últimas etapas\n\n${removedCount} ${removedCount === 1 ? "etapa preenchida será descartada" : "etapas preenchidas serão descartadas"}. O texto dessas etapas será perdido e qualquer print correspondente precisará ser revisado depois. Essa ação não pode ser desfeita.`,
        );
        if (!confirmed) {
          setStepCount(currentCount);
          return;
        }
      }
    }

    setForm((current) => ({
      ...current,
      steps: nextCount > current.steps.length
        ? [...current.steps, ...Array.from({ length: nextCount - current.steps.length }, emptyStep)]
        : current.steps.slice(0, nextCount),
    }));
    setStepCount(nextCount);
    setStepCountMessage("");
    setFieldErrors((current) => Object.fromEntries(
      Object.entries(current).filter(([key]) => {
        const match = key.match(/^steps\.(\d+)\./);
        return !match || Number(match[1]) < nextCount;
      }),
    ));
  };

  const stepError = (index: number, field: keyof GuideEditorStepValue) => fieldErrors[`steps.${index}.${field}`];

  const changeCreationMode = (mode: CreationMode) => {
    setCreationMode(mode);
    setMessage("");
    setCreatedGuide(null);
    setCreatedApplicationSlug("");
    setPreviewResult(null);
    setSavedEdit(null);
    setFieldErrors({});
  };

  const resetForNewGuide = () => {
    setForm(initialForm(applications));
    setCreationMode("existing");
    setNewApplication(initialNewApplication(applications, categories, previewOnly));
    setNewApplicationSlugEdited(false);
    setSlugEdited(false);
    setStepCount(GUIDE_STEP_MIN);
    setStepCountMessage("");
    setFieldErrors({});
    setSubmitting(false);
    setMessage("");
    setCreatedGuide(null);
    setCreatedApplicationSlug("");
    setPreviewResult(null);
    setSavedEdit(null);
    onPreviewAction?.("new");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setCreatedGuide(null);
    setCreatedApplicationSlug("");
    setPreviewResult(null);
    setSavedEdit(null);

    if (isEditing && (!editId || !initialValues?.updatedAt)) {
      setMessage("A versão deste rascunho não está disponível. Reabra a edição pela biblioteca.");
      return;
    }

    if (!isEditing && creationMode === "existing" && !selectedApplication) {
      setMessage("Selecione um aplicativo existente no catálogo.");
      return;
    }

    const guideApplicationSlug = isEditing || creationMode === "existing" ? form.applicationSlug : newApplication.slug;
    const guidePayload = getGuidePayload(form, guideApplicationSlug);
    const parsedGuide = isEditing
      ? normalizeGuideEditInput({ expectedUpdatedAt: initialValues?.updatedAt, ...guidePayload })
      : normalizeGuideCreationInput(guidePayload);
    if (!parsedGuide.success) {
      const nextFieldErrors: Record<string, string> = {};
      parsedGuide.error.issues.forEach((issue) => {
        if (issue.path.length === 3 && issue.path[0] === "steps" && typeof issue.path[1] === "number" && typeof issue.path[2] === "string") {
          nextFieldErrors[`steps.${issue.path[1]}.${issue.path[2]}`] = issue.message;
        } else if (issue.path.length === 1 && typeof issue.path[0] === "string") {
          nextFieldErrors[issue.path[0]] = issue.message;
        }
      });
      setFieldErrors(nextFieldErrors);
      setMessage(parsedGuide.error.issues[0]?.message ?? "Revise os campos do guia.");
      return;
    }

    if (!isEditing && duplicateGuideSlug) {
      setFieldErrors({ slug: "Já existe um guia com este identificador. Escolha outro slug." });
      setMessage("Já existe um guia com este identificador. Escolha outro slug.");
      return;
    }

    let parsedApplication: { success: true; data: ApplicationCreationInput } | null = null;
    if (!isEditing && creationMode === "new") {
      const applicationInput = {
        ...newApplication,
        categoryId: previewOnly ? localPreviewCategoryId : newApplication.categoryId,
      };
      const result = normalizeApplicationCreationInput(applicationInput);
      if (!result.success) {
        const applicationErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path.length === 1 && typeof issue.path[0] === "string") {
            applicationErrors[`application.${issue.path[0]}`] = issue.message;
          }
        });
        setFieldErrors(applicationErrors);
        setMessage(result.error.issues[0]?.message ?? "Revise os campos do aplicativo.");
        return;
      }
      parsedApplication = result;
    }

    if (previewOnly) {
      const previewGuide = normalizeGuideCreationInput(guidePayload);
      if (!previewGuide.success) return;
      const applicationName = parsedApplication?.data.name ?? selectedApplication?.name ?? guideApplicationSlug;
      const applicationCategory = creationMode === "new"
        ? categoryOptions.find((category) => category.id === newApplication.categoryId)?.name ?? "Novo aplicativo"
        : selectedApplication?.category ?? "Aplicativo";
      const draft = createGuidePreviewDraft({
        guide: previewGuide.data,
        applicationName,
        applicationCategory,
        applicationId: selectedApplication?.id,
      });
      onPreviewValidated?.(draft);
      setPreviewResult({
        slug: previewGuide.data.slug,
        stepCount: previewGuide.data.steps.length,
        applicationName,
      });
      setMessage("Prévia local validada. Nada foi enviado ou salvo.");
      return;
    }

    if (isEditing) {
      const editData = parsedGuide.data as GuideEditInput;
      const removedPrint = initialValues?.steps.some((step) => (
        step.id && step.hasPrint && !editData.steps.some((candidate) => candidate.id === step.id)
      ));
      if (removedPrint) {
        const confirmed = window.confirm(
          "Confirme: uma ou mais etapas removidas possuem print vinculado. O vínculo será desvinculado e precisará ser revisado depois. Deseja continuar?",
        );
        if (!confirmed) return;
      }

      setSubmitting(true);
      try {
        const response = await fetch(`/api/admin/guides/${encodeURIComponent(editId!)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        });
        const payload = await response.json() as { data?: SavedGuideEdit; error?: { message?: string } };
        if (!response.ok || !payload.data) {
          if (response.status === 409) {
            setMessage(payload.error?.message ?? "Este rascunho mudou. Recarregue para revisar a versão atual.");
            return;
          }
          throw new Error(payload.error?.message ?? "Não foi possível salvar as alterações.");
        }
        setSavedEdit(payload.data);
        setMessage("Alterações salvas no rascunho. A biblioteca será atualizada ao voltar ao painel.");
      } catch (error: unknown) {
        setMessage(error instanceof Error ? error.message : "Não foi possível salvar as alterações.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = creationMode === "new" ? "/api/admin/applications" : "/api/admin/guides";
      const body = creationMode === "new" ? { application: parsedApplication?.data, guide: parsedGuide.data } : parsedGuide.data;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json() as {
        data?: CreatedGuide | CreatedApplicationGuide;
        error?: { message?: string };
      };
      if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "Não foi possível criar o rascunho.");

      const guide = creationMode === "new" ? (payload.data as CreatedApplicationGuide).guide : payload.data as CreatedGuide;
      setCreatedGuide(guide);
      setCreatedApplicationSlug(guideApplicationSlug);
      setMessage(creationMode === "new"
        ? "Aplicativo e guia criados como rascunho. Agora você pode revisar o roteiro e adicionar os prints."
        : "Guia criado como rascunho. Agora você pode revisar o roteiro e adicionar os prints.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Não foi possível criar o rascunho.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="internal-page-content internal-page-content--compact guide-editor-page">
      {!hidePageIntro && (
        <>
          <Link href={backHref} className="internal-page-back">{backLabel}</Link>
          <header className="guide-editor-intro">
            <div>
              <h1 className="internal-page-title">{previewOnly ? "Prévia do editor de guias" : isEditing ? "Editar rascunho" : "Criar um guia"}</h1>
              <p className="internal-page-description">
                {previewOnly
                  ? "Preencha um exemplo e veja como o cadastro funciona. Nada será enviado ou salvo."
                  : isEditing
                    ? "Atualize o conteúdo com segurança. O guia continua como rascunho até a revisão humana."
                    : "Monte o roteiro em poucos passos. O guia começa como rascunho para revisão humana."}
              </p>
            </div>
            <span className="guide-editor-mode">{previewOnly ? "Modo local" : "Rascunho"}</span>
          </header>
        </>
      )}

      <div className="guide-editor-overview" role="note">
        <strong>Você só precisa preencher:</strong>
        <span> aplicativo, informações do guia e passos do roteiro.</span>
      </div>

      <aside className="guide-editor-summary" aria-label="Resumo atual do guia">
        <div>
          <span>Aplicativo</span>
          <strong>{creationMode === "new" ? newApplication.name || "Novo aplicativo" : selectedApplication?.name || "Ainda não selecionado"}</strong>
        </div>
        <div>
          <span>Categoria</span>
          <strong>{creationMode === "new" ? categoryOptions.find((category) => category.id === newApplication.categoryId)?.name || "Ainda não selecionado" : selectedApplication?.category || "Vinculado ao aplicativo"}</strong>
        </div>
        <div>
          <span>Guia</span>
          <strong>{form.title || "Sem título"}</strong>
        </div>
        <div>
          <span>Roteiro</span>
          <strong>{stepCountLabel(form.steps.length)}</strong>
        </div>
      </aside>

      <form className="guide-editor-form" onSubmit={submit} noValidate>
        <section className="guide-editor-section" aria-labelledby="guide-application-source-title">
          <div className="guide-editor-section-heading">
            <span className="guide-editor-index" aria-hidden="true">1</span>
            <div>
              <h2 id="guide-application-source-title">Aplicativo</h2>
              <p>Escolha um app do catálogo ou cadastre um novo.</p>
            </div>
          </div>

          {isEditing ? (
            <div className="guide-editor-selected guide-editor-selected--locked" role="status">
              <div>
                <span>Aplicativo vinculado</span>
                <strong>{selectedApplication?.name ?? initialValues?.applicationName ?? form.applicationSlug}</strong>
                <small>{selectedApplication?.category ?? initialValues?.applicationCategory ?? "Categoria preservada"}</small>
              </div>
              <small>O aplicativo e a categoria não são alterados nesta edição.</small>
            </div>
          ) : (
          <>
          <fieldset className="guide-editor-choice">
            <legend>Como começar?</legend>
            <div className="guide-editor-choice-grid">
              <label className={`guide-source-option ${creationMode === "existing" ? "is-selected" : ""}`}>
                <input type="radio" name="application-source" value="existing" checked={creationMode === "existing"} onChange={() => changeCreationMode("existing")} />
                <span><strong>Usar aplicativo existente</strong><small>Pesquisar no catálogo</small></span>
              </label>
              <label className={`guide-source-option ${creationMode === "new" ? "is-selected" : ""}`}>
                <input type="radio" name="application-source" value="new" checked={creationMode === "new"} onChange={() => changeCreationMode("new")} />
                <span><strong>Cadastrar novo aplicativo</strong><small>Criar o app e o rascunho</small></span>
              </label>
            </div>
          </fieldset>

          {creationMode === "existing" ? (
            <div className="guide-editor-field-group">
              <ApplicationSearch
                key={form.applicationSlug || "empty"}
                applications={applications}
                value={form.applicationSlug}
                onSelect={(application) => setForm((current) => ({ ...current, applicationSlug: application.slug }))}
                disabled={applications.length === 0}
              />
              {selectedApplication && (
                <div className="guide-editor-selected" role="status">
                  <div>
                    <span>Selecionado</span>
                    <strong>{selectedApplication.name}</strong>
                    <small>{selectedApplication.category}{selectedApplication.guideCount !== undefined ? ` · ${selectedApplication.guideCount} guia(s)` : ""}</small>
                  </div>
                  <button type="button" className="guide-editor-inline-action" onClick={() => setForm((current) => ({ ...current, applicationSlug: "" }))}>Trocar</button>
                </div>
              )}
              {applications.length === 0 && <p className="guide-editor-help">Nenhum aplicativo disponível para pesquisa.</p>}
            </div>
          ) : (
            <div className="guide-editor-field-grid">
              <label className="guide-editor-field guide-editor-field--wide">
                Nome do aplicativo
                <input value={newApplication.name} onChange={(event) => { const name = event.target.value; setFieldErrors((current) => { const next = { ...current }; delete next["application.name"]; return next; }); setNewApplication((current) => ({ ...current, name, slug: newApplicationSlugEdited ? current.slug : slugifyGuideTitle(name) })); }} className="glass-control" placeholder="Ex.: Meu banco digital" maxLength={100} required aria-invalid={Boolean(fieldErrors["application.name"])} aria-describedby={fieldErrors["application.name"] ? "application-name-error" : undefined} />
                {fieldErrors["application.name"] && <span id="application-name-error" className="guide-editor-error" role="alert">{fieldErrors["application.name"]}</span>}
              </label>
              <label className="guide-editor-field">
                Categoria existente
                <select value={newApplication.categoryId} onChange={(event) => { setFieldErrors((current) => { const next = { ...current }; delete next["application.categoryId"]; return next; }); setNewApplication((current) => ({ ...current, categoryId: event.target.value })); }} className="glass-control" required aria-invalid={Boolean(fieldErrors["application.categoryId"])} aria-describedby={fieldErrors["application.categoryId"] ? "application-category-error" : undefined}>
                  <option value="">Selecione a categoria</option>
                  {categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                {fieldErrors["application.categoryId"] && <span id="application-category-error" className="guide-editor-error" role="alert">{fieldErrors["application.categoryId"]}</span>}
                {categoryOptions.length === 0 && <span className="guide-editor-help" role="status">Nenhuma categoria existente foi carregada. Recarregue o catálogo antes de criar um aplicativo.</span>}
              </label>
              <label className="guide-editor-field">
                Identificador do aplicativo
                <input value={newApplication.slug} onChange={(event) => { setNewApplicationSlugEdited(true); setFieldErrors((current) => { const next = { ...current }; delete next["application.slug"]; return next; }); setNewApplication((current) => ({ ...current, slug: event.target.value })); }} className="glass-control" placeholder="meu-banco-digital" maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required aria-invalid={Boolean(fieldErrors["application.slug"])} aria-describedby={fieldErrors["application.slug"] ? "application-slug-error" : undefined} />
                {fieldErrors["application.slug"] && <span id="application-slug-error" className="guide-editor-error" role="alert">{fieldErrors["application.slug"]}</span>}
              </label>
              <label className="guide-editor-field guide-editor-field--wide">
                Descrição do aplicativo
                <textarea value={newApplication.description} onChange={(event) => { setFieldErrors((current) => { const next = { ...current }; delete next["application.description"]; return next; }); setNewApplication((current) => ({ ...current, description: event.target.value })); }} className="glass-control" placeholder="Explique que tipo de serviço o aplicativo oferece." maxLength={500} required aria-invalid={Boolean(fieldErrors["application.description"])} aria-describedby={fieldErrors["application.description"] ? "application-description-error" : undefined} />
                {fieldErrors["application.description"] && <span id="application-description-error" className="guide-editor-error" role="alert">{fieldErrors["application.description"]}</span>}
              </label>
            </div>
          )}
          </>
          )}
        </section>

        <section className="guide-editor-section" aria-labelledby="guide-details-title">
          <div className="guide-editor-section-heading">
            <span className="guide-editor-index" aria-hidden="true">2</span>
            <div>
              <h2 id="guide-details-title">Informações do guia</h2>
              <p>Comece pelo nome e explique o que a pessoa vai aprender.</p>
            </div>
          </div>

          <div className="guide-editor-field-grid">
            <label className="guide-editor-field guide-editor-field--wide">
              Nome do guia
              <input value={form.title} onChange={(event) => { const title = event.target.value; setFieldErrors((current) => { const next = { ...current }; delete next.title; delete next.slug; return next; }); setForm((current) => ({ ...current, title, slug: isEditing || slugEdited ? current.slug : slugifyGuideTitle(title) })); }} className="glass-control" placeholder="Ex.: Consultar o saldo" maxLength={160} required aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? "guide-title-error" : undefined} />
              {fieldErrors.title && <span id="guide-title-error" className="guide-editor-error" role="alert">{fieldErrors.title}</span>}
            </label>
            <label className="guide-editor-field guide-editor-field--wide">
              Descrição
              <textarea value={form.description} onChange={(event) => { setFieldErrors((current) => { const next = { ...current }; delete next.description; return next; }); setForm((current) => ({ ...current, description: event.target.value })); }} className="glass-control" placeholder="Explique em uma frase o que a pessoa vai aprender." maxLength={1000} required aria-invalid={Boolean(fieldErrors.description)} aria-describedby={fieldErrors.description ? "guide-description-error" : undefined} />
              {fieldErrors.description && <span id="guide-description-error" className="guide-editor-error" role="alert">{fieldErrors.description}</span>}
            </label>
            <label className="guide-editor-field">
              Dificuldade
              <select value={form.difficulty} onChange={(event) => setForm((current) => ({ ...current, difficulty: event.target.value as GuideFormState["difficulty"] }))} className="glass-control"><option value="easy">Fácil</option><option value="medium">Média</option><option value="advanced">Avançada</option></select>
            </label>
            <label className="guide-editor-field">
              Tempo estimado (minutos)
              <input type="number" value={form.estimatedMinutes} onChange={(event) => setForm((current) => ({ ...current, estimatedMinutes: Number(event.target.value) }))} className="glass-control" min={1} max={120} required />
            </label>
          </div>

          <details className="guide-editor-details">
            <summary>Mais opções do guia</summary>
            <div className="guide-editor-field-grid">
              <label className="guide-editor-field guide-editor-field--wide">
                Identificador do guia (slug)
                <input value={form.slug} onChange={(event) => { if (isEditing) return; setSlugEdited(true); setFieldErrors((current) => { const next = { ...current }; delete next.slug; return next; }); setForm((current) => ({ ...current, slug: event.target.value })); }} readOnly={isEditing} className="glass-control" placeholder="consultar-saldo" maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" aria-invalid={Boolean(fieldErrors.slug || duplicateGuideSlug)} aria-describedby={duplicateGuideSlug ? "guide-slug-duplicate" : fieldErrors.slug ? "guide-slug-error" : "guide-slug-help"} required />
                <span id="guide-slug-help" className="guide-editor-help">{isEditing ? "O identificador é preservado para não quebrar links existentes." : "É preenchido automaticamente pelo nome. Use letras minúsculas, números e hífens."}</span>
                {duplicateGuideSlug && <span id="guide-slug-duplicate" className="guide-editor-error" role="alert">Já existe um guia com este identificador. Escolha outro slug.</span>}
                {fieldErrors.slug && !duplicateGuideSlug && <span id="guide-slug-error" className="guide-editor-error" role="alert">{fieldErrors.slug}</span>}
              </label>
              <label className="guide-editor-field">
                Versão do aplicativo
                <input value={form.appVersion} onChange={(event) => setForm((current) => ({ ...current, appVersion: event.target.value }))} className="glass-control" placeholder="genérica ou 1.2.3" maxLength={80} required />
              </label>
              <label className="guide-editor-field">
                Versão editorial
                <input value={form.guideVersion} onChange={(event) => setForm((current) => ({ ...current, guideVersion: event.target.value }))} className="glass-control" placeholder="0.1" maxLength={80} required />
              </label>
              <label className="guide-editor-field guide-editor-field--wide">
                Aviso de segurança
                <textarea value={form.safetyWarning} onChange={(event) => setForm((current) => ({ ...current, safetyWarning: event.target.value }))} className="glass-control" placeholder="Ex.: Nunca informe sua senha ou código ao Guido." maxLength={1500} />
              </label>
              <label className="guide-editor-field guide-editor-field--wide">
                Termos de busca
                <input value={form.searchTerms} onChange={(event) => setForm((current) => ({ ...current, searchTerms: event.target.value }))} className="glass-control" placeholder="saldo, consultar saldo, dinheiro disponível" aria-describedby="guide-search-help" />
                <span id="guide-search-help" className="guide-editor-help">Separe os termos por vírgula.</span>
              </label>
            </div>
          </details>
        </section>

        <section className="guide-editor-section" aria-labelledby="guide-steps-title">
          <div className="guide-editor-section-heading guide-editor-section-heading--steps">
            <span className="guide-editor-index" aria-hidden="true">3</span>
            <div>
              <h2 id="guide-steps-title">Passos do roteiro</h2>
              <p>Escreva uma ação simples por vez. Os prints entram depois.</p>
            </div>
          </div>

          <div className="guide-editor-step-toolbar">
            <label className="guide-editor-step-count" htmlFor="guide-step-count">
              <span>Número de etapas</span>
              <input
                id="guide-step-count"
                type="number"
                min={GUIDE_STEP_MIN}
                max={GUIDE_STEP_MAX}
                step={1}
                value={stepCount}
                onChange={(event) => {
                  setStepCount(event.currentTarget.value === "" ? "" : Number(event.currentTarget.value));
                  setStepCountMessage("");
                }}
                onBlur={() => resizeSteps(stepCount === "" ? 0 : stepCount)}
                className="glass-control"
                aria-invalid={Boolean(stepCountMessage)}
                aria-describedby={stepCountMessage ? "guide-step-count-error" : "guide-step-count-help"}
              />
            </label>
            <p id="guide-step-count-help" className="guide-editor-step-summary" aria-live="polite">{stepCountLabel(form.steps.length)}</p>
            <div className="guide-editor-step-actions">
              <button type="button" className="secondary-action" onClick={() => resizeSteps(form.steps.length + 1)} disabled={form.steps.length >= GUIDE_STEP_MAX}>+ Adicionar etapa</button>
              <button type="button" className="secondary-action" onClick={() => resizeSteps(form.steps.length - 1)} disabled={form.steps.length <= GUIDE_STEP_MIN}>Remover última etapa</button>
            </div>
          </div>
          {stepCountMessage && <p id="guide-step-count-error" className="guide-editor-error" role="alert">{stepCountMessage}</p>}

          <div className="guide-editor-steps">
            {form.steps.map((step, index) => (
              <fieldset key={index} className="guide-editor-step">
                <legend><span>Passo {index + 1}</span><small>Obrigatório</small></legend>
                <div className="guide-editor-field-grid">
                  {(["title", "instruction", "imageAlt"] as const).map((field) => {
                    const labels = { title: "Título do passo", instruction: "Instrução", imageAlt: "Descrição da imagem esperada" };
                    const placeholders = { title: "Ex.: Abra o aplicativo oficial", instruction: "Explique uma ação por vez, com palavras simples.", imageAlt: "Descreva o print seguro que deve aparecer." };
                    const error = stepError(index, field);
                    const errorId = `step-${index}-${field}-error`;
                    return (
                      <label key={field} className={`guide-editor-field ${field === "title" ? "guide-editor-field--wide" : ""}`}>
                        {labels[field]}
                        {field === "title" ? (
                          <input value={step.title} onChange={(event) => updateStep(index, field, event.target.value)} className="glass-control" placeholder={placeholders[field]} maxLength={160} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
                        ) : (
                          <textarea value={step[field]} onChange={(event) => updateStep(index, field, event.target.value)} className="glass-control" placeholder={placeholders[field]} maxLength={field === "instruction" ? 2000 : 1000} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
                        )}
                        {error && <span id={errorId} className="guide-editor-error" role="alert">{error}</span>}
                      </label>
                    );
                  })}
                </div>
                <details className="guide-editor-details guide-editor-step-details">
                  <summary>Adicionar aviso ou mensagem (opcional)</summary>
                  <div className="guide-editor-field-grid">
                    {(["warning", "confirmationMessage"] as const).map((field) => {
                      const labels = { warning: "Aviso do passo", confirmationMessage: "Mensagem após confirmar" };
                      const error = stepError(index, field);
                      const errorId = `step-${index}-${field}-error`;
                      return (
                        <label key={field} className="guide-editor-field">
                          {labels[field]}
                          <textarea value={step[field]} onChange={(event) => updateStep(index, field, event.target.value)} className="glass-control" maxLength={field === "warning" ? 2000 : 1000} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
                          {error && <span id={errorId} className="guide-editor-error" role="alert">{error}</span>}
                        </label>
                      );
                    })}
                  </div>
                </details>
              </fieldset>
            ))}
          </div>
        </section>

        <div className="guide-editor-submit">
          <div className="guide-editor-safety" role="note">
            <strong>Segurança primeiro</strong>
            <span> Não use senha, código, CPF, saldo ou imagem com dado real.</span>
          </div>
          <button type="submit" disabled={submitting || (!isEditing && creationMode === "existing" && !selectedApplication) || (!isEditing && creationMode === "new" && categoryOptions.length === 0)} aria-busy={submitting} className="primary-action guide-editor-submit-button">{submitting ? "Salvando…" : previewOnly ? "Validar e criar rascunho local" : isEditing ? "Salvar alterações" : creationMode === "new" ? "Criar aplicativo e rascunho" : "Criar guia como rascunho"}</button>
        </div>
        {(submitting || message) && <p role={submitting || createdGuide || previewResult || savedEdit ? "status" : "alert"} aria-live={submitting || createdGuide || previewResult || savedEdit ? "polite" : "assertive"} className={`guide-editor-feedback ${submitting ? "notice-info" : createdGuide || previewResult || savedEdit ? "notice-success" : "notice-danger"}`}>{submitting ? isEditing ? "Salvando alterações…" : "Criando o rascunho…" : message}</p>}
        {createdGuide && <div className="guide-editor-result glass-panel"><p className="font-bold">Rascunho criado: {createdGuide.stepCount} passo(s) nas duas versões.</p><p className="mt-2 text-[var(--muted)]">Slug: <strong>{createdGuide.slug}</strong>. O roteiro ainda não está publicado e nenhum placeholder de imagem foi criado.</p><div className="mt-4 flex flex-wrap gap-3"><Link href={`/admin?guide=${encodeURIComponent(createdGuide.slug)}${createdApplicationSlug ? `&application=${encodeURIComponent(createdApplicationSlug)}` : ""}&os=android&androidVersionId=${encodeURIComponent(createdGuide.guideVersionIds.android)}&iosVersionId=${encodeURIComponent(createdGuide.guideVersionIds.ios)}`} className="primary-action inline-flex min-h-12 items-center rounded-xl px-4 py-2 font-bold">Enviar prints Android e iPhone</Link><Link href="/admin" className="secondary-action inline-flex min-h-12 items-center rounded-xl px-4 py-2 font-bold">Voltar ao painel</Link><Link href={`/tarefas/${createdGuide.slug}`} className="secondary-action inline-flex min-h-12 items-center rounded-xl px-4 py-2 font-bold">Abrir prévia</Link></div></div>}
        {previewResult && <div className="guide-editor-result notice-success guide-preview-confirmation" role="status" aria-labelledby="guide-preview-confirmation-title">
          <p id="guide-preview-confirmation-title" className="font-bold">Rascunho local criado</p>
          <p className="mt-2">{previewResult.stepCount} passo(s) preenchido(s). {previewResult.applicationName ? `Aplicativo: ${previewResult.applicationName}. ` : ""}Slug: <strong>{previewResult.slug}</strong>.</p>
          <p className="mt-2">Nada foi enviado ao Supabase e nenhuma alteração foi salva.</p>
          <div className="guide-preview-confirmation-actions">
            <button type="button" className="primary-action" onClick={() => onPreviewAction?.("images")}>Continuar para adicionar prints</button>
            <button type="button" className="secondary-action" onClick={() => onPreviewAction?.("open")}>Revisar roteiro</button>
            <button type="button" className="guide-preview-tertiary-action" onClick={resetForNewGuide}>Criar outro guia</button>
          </div>
        </div>}
        {savedEdit && <div className="guide-editor-result notice-success" role="status"><p className="font-bold">Rascunho atualizado com sucesso.</p><p className="mt-2">O conteúdo continua em rascunho. Confira os prints antes de qualquer revisão ou publicação.</p><div className="mt-4 flex flex-wrap gap-3"><Link href={savedEdit.reviewHref ?? initialValues?.reviewHref ?? "/admin"} className="primary-action inline-flex min-h-12 items-center rounded-xl px-4 py-2 font-bold">Revisar prints</Link><Link href="/admin" className="secondary-action inline-flex min-h-12 items-center rounded-xl px-4 py-2 font-bold">Voltar ao painel</Link></div></div>}
      </form>
    </div>
  );
}
