"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getGuidePreviewCompleteness,
  type GuidePreviewDraft,
  type GuidePreviewReviewStatus,
} from "./guide-preview-draft";

export type GuideLibraryStatusFilter = "all" | "complete" | "incomplete" | GuidePreviewReviewStatus;

export interface GuideLibraryApplicationOption {
  id?: string;
  slug: string;
  name: string;
}

export function guideEditHref(guideId: string) {
  return `/admin/guias/${encodeURIComponent(guideId)}/editar`;
}

export interface GuideLibraryProps {
  guides: GuidePreviewDraft[];
  applications: GuideLibraryApplicationOption[];
  selectedId: string | null;
  pendingDeleteId: string | null;
  onSelect: (draft: GuidePreviewDraft) => void;
  onRequestDelete: (draft: GuidePreviewDraft) => void;
  onConfirmDelete: (draft: GuidePreviewDraft) => void;
  onCancelDelete: () => void;
  editHref?: (draft: GuidePreviewDraft) => string | undefined;
}

const statusOptions: Array<{ value: GuideLibraryStatusFilter; label: string }> = [
  { value: "all", label: "Todos os status" },
  { value: "complete", label: "Completos" },
  { value: "incomplete", label: "Incompletos" },
  { value: "awaiting-images", label: "Aguardando prints" },
  { value: "in-review", label: "Imagens em revisão" },
  { value: "ready-for-human-review", label: "Prontos para revisão humana" },
];

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Data desconhecida";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

function stepCountLabel(count: number) {
  return `${count} ${count === 1 ? "etapa" : "etapas"}`;
}

function reviewStatusLabel(status: GuidePreviewReviewStatus) {
  if (status === "in-review") return "Imagens em revisão";
  if (status === "ready-for-human-review") return "Pronta para revisão humana";
  return "Aguardando imagens";
}

function reviewStatusClass(status: GuidePreviewReviewStatus) {
  if (status === "ready-for-human-review") return "is-ready";
  if (status === "in-review") return "is-review";
  return "is-waiting";
}

function sourceLabel(source: GuidePreviewDraft["source"]) {
  if (source === "example") return "Exemplo local";
  if (source === "imported") return "Importado local";
  return "Rascunho local";
}

function completenessLabel(status: "complete" | "incomplete") {
  return status === "complete" ? "Completo" : "Incompleto";
}

function completenessClass(status: "complete" | "incomplete") {
  return status === "complete" ? "is-complete" : "is-incomplete";
}

export function GuideLibrary({
  guides,
  applications,
  selectedId,
  pendingDeleteId,
  onSelect,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  editHref,
}: GuideLibraryProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<GuideLibraryStatusFilter>("all");
  const [applicationFilter, setApplicationFilter] = useState("all");

  const applicationOptions = useMemo(() => {
    const unique = new Map<string, GuideLibraryApplicationOption>();
    applications.forEach((application) => unique.set(application.id ?? application.slug, application));
    return [...unique.values()].sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
  }, [applications]);

  const filteredGuides = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    const selectedApplication = applicationOptions.find((application) => (application.id ?? application.slug) === applicationFilter);
    return guides.filter((guide) => {
      const completeness = getGuidePreviewCompleteness(guide);
      const searchableValues = [
        guide.title,
        guide.slug,
        guide.applicationName,
        guide.applicationCategory,
        ...guide.searchTerms,
      ];
      const matchesQuery = !normalizedQuery || searchableValues.some((value) => normalizeSearchValue(value).includes(normalizedQuery));
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "complete" && completeness.status === "complete")
        || (statusFilter === "incomplete" && completeness.status === "incomplete")
        || guide.reviewStatus === statusFilter;
      const matchesApplication = applicationFilter === "all"
        || guide.applicationId === applicationFilter
        || selectedApplication?.slug === guide.applicationSlug;
      return matchesQuery && matchesStatus && matchesApplication;
    });
  }, [applicationFilter, applicationOptions, guides, query, statusFilter]);

  const hasActiveFilters = Boolean(query.trim()) || statusFilter !== "all" || applicationFilter !== "all";
  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setApplicationFilter("all");
  };

  if (guides.length === 0) {
    return (
      <div className="guide-local-empty" role="status">
        <strong>Nenhum rascunho local</strong>
        <span>Preencha e valide um guia acima para ele aparecer nesta biblioteca.</span>
      </div>
    );
  }

  return (
    <>
      <div className="guide-local-toolbar" aria-label="Filtros da biblioteca de guias">
        <label>
          Pesquisar tarefa
          <input
            className="glass-control"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Título, aplicativo, nicho ou palavra-chave"
          />
        </label>
        <label>
          Filtrar por status
          <select className="glass-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as GuideLibraryStatusFilter)}>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          Filtrar por aplicativo
          <select className="glass-control" value={applicationFilter} onChange={(event) => setApplicationFilter(event.target.value)}>
            <option value="all">Todos os aplicativos</option>
            {applicationOptions.map((application) => {
              const applicationId = application.id ?? application.slug;
              return <option key={applicationId} value={applicationId}>{application.name}</option>;
            })}
          </select>
        </label>
        <p aria-live="polite">Mostrando {filteredGuides.length} de {guides.length}</p>
      </div>

      {filteredGuides.length === 0 ? (
        <div className="guide-local-empty" role="status">
          <strong>Nenhuma tarefa encontrada</strong>
          <span>Altere os filtros para encontrar outro guia local.</span>
          {hasActiveFilters && <button type="button" className="secondary-action guide-local-clear-filters" onClick={clearFilters}>Limpar filtros</button>}
        </div>
      ) : (
        <div className={`guide-local-draft-grid ${filteredGuides.length === 1 ? "is-single" : ""}`}>
          {filteredGuides.map((draft) => {
            const completeness = getGuidePreviewCompleteness(draft);
            const isSelected = selectedId === draft.id;
            const isPendingDelete = pendingDeleteId === draft.id;
            return (
              <article key={draft.id} className={`guide-local-draft ${isSelected ? "is-selected" : ""}`}>
                <header className="guide-local-draft-header">
                  <div>
                    <span className={`guide-local-badge ${draft.source === "example" ? "is-example" : ""}`}>{sourceLabel(draft.source)}</span>
                    <p className="guide-local-category">{draft.applicationCategory} · {draft.applicationName}</p>
                  </div>
                  <div className="guide-local-card-status">
                    <span className={`guide-local-status ${completenessClass(completeness.status)}`}>{completenessLabel(completeness.status)}</span>
                    <span className={`guide-local-status ${reviewStatusClass(draft.reviewStatus)}`}>{reviewStatusLabel(draft.reviewStatus)}</span>
                  </div>
                </header>

                <h3>{draft.title}</h3>
                <p className="guide-local-description">{draft.description}</p>

                <dl className="guide-local-meta guide-local-meta--three">
                  <div><dt>Etapas</dt><dd>{stepCountLabel(completeness.totalSteps)}</dd></div>
                  <div><dt>Prints</dt><dd>{completeness.validatedImages}/{completeness.totalSteps} validados</dd></div>
                  <div><dt>Atualizado</dt><dd>{formatUpdatedAt(draft.updatedAt)}</dd></div>
                </dl>

                <div className="guide-local-actions">
                  <button
                    type="button"
                    className="secondary-action guide-local-open"
                    aria-label={`${isSelected ? "Fechar roteiro" : "Abrir roteiro"}: ${draft.title}`}
                    aria-expanded={isSelected}
                    onClick={() => onSelect(draft)}
                  >
                    {isSelected ? "Fechar roteiro" : "Abrir roteiro"}
                  </button>
                  {editHref?.(draft) && (
                    <Link href={editHref(draft)!} className="secondary-action guide-local-edit">
                      Editar guia
                    </Link>
                  )}
                  <button
                    type="button"
                    className="guide-local-delete"
                    aria-label={`Apagar rascunho: ${draft.title}`}
                    onClick={() => onRequestDelete(draft)}
                    aria-expanded={isPendingDelete}
                  >
                    Apagar rascunho
                  </button>
                </div>

                {isPendingDelete && (
                  <div className="guide-local-confirm" role="alertdialog" aria-label={`Confirmar exclusão de ${draft.title}`}>
                    <strong>Apagar este rascunho?</strong>
                    <p>Isso remove somente este item do navegador. O banco não será alterado.</p>
                    <div>
                      <button type="button" className="secondary-action" onClick={onCancelDelete}>Cancelar</button>
                      <button type="button" className="guide-local-confirm-delete" aria-label={`Confirmar apagar rascunho: ${draft.title}`} onClick={() => onConfirmDelete(draft)}>Apagar agora</button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
