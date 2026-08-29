import type { GuideCreationInput } from "./guide-creation-validation";
import { getGuideCompleteness, type GuideCompleteness } from "./guide-completeness";

export const GUIDE_PREVIEW_EXPORT_FORMAT = "guido-local-guides";
export const GUIDE_PREVIEW_SCHEMA_VERSION = 1;
export const GUIDE_PREVIEW_MAX_IMPORT_BYTES = 2_000_000;

export type GuidePreviewSource = "example" | "local" | "imported";
export type GuidePreviewImageStatus = "pending" | "received" | "validated";
export type GuidePreviewReviewStatus = "awaiting-images" | "in-review" | "ready-for-human-review";

export interface GuidePreviewStep {
  id: string;
  editorialKey: string;
  title: string;
  instruction: string;
  imageAlt: string;
  warning: string;
  confirmationMessage: string;
  imageStatus: GuidePreviewImageStatus;
  imagePath: string | null;
  imageSource: string | null;
}

export interface GuidePreviewDraft {
  id: string;
  source: GuidePreviewSource;
  taskId: string;
  guideId: string;
  applicationId: string;
  applicationSlug: string;
  applicationName: string;
  applicationCategory: string;
  title: string;
  slug: string;
  description: string;
  safetyWarning: string;
  searchTerms: string[];
  difficulty: GuideCreationInput["difficulty"];
  estimatedMinutes: number;
  appVersion: string;
  guideVersion: string;
  reviewStatus: GuidePreviewReviewStatus;
  steps: GuidePreviewStep[];
  updatedAt: string;
}

export interface GuidePreviewExportFile {
  format: typeof GUIDE_PREVIEW_EXPORT_FORMAT;
  schemaVersion: typeof GUIDE_PREVIEW_SCHEMA_VERSION;
  exportedAt: string;
  guides: GuidePreviewDraft[];
}

function safeIdentifier(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "sem-identificador";
}

function stepSuffix(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function getTaskId(applicationSlug: string, slug: string) {
  return `task-${safeIdentifier(applicationSlug)}-${safeIdentifier(slug)}`;
}

export function getGuideId(taskId: string, guideVersion: string) {
  return `guide-${taskId}-${safeIdentifier(guideVersion)}`;
}

export function getStepIds(slug: string, guideId: string, index: number) {
  const suffix = stepSuffix(index);
  return {
    id: `${guideId}-step-${suffix}`,
    editorialKey: `${safeIdentifier(slug)}.step.${suffix}`,
  };
}

export function getReviewStatus(steps: GuidePreviewStep[]): GuidePreviewReviewStatus {
  if (steps.some((step) => step.imageStatus === "pending")) return "awaiting-images";
  if (steps.some((step) => step.imageStatus === "received")) return "in-review";
  return "ready-for-human-review";
}

export function createGuidePreviewDraft({
  guide,
  applicationName,
  applicationCategory,
  applicationId,
  source = "local",
  updatedAt = new Date().toISOString(),
}: {
  guide: GuideCreationInput;
  applicationName: string;
  applicationCategory: string;
  applicationId?: string;
  source?: GuidePreviewSource;
  updatedAt?: string;
}): GuidePreviewDraft {
  const taskId = getTaskId(guide.applicationSlug, guide.slug);
  const guideId = getGuideId(taskId, guide.guideVersion);
  const steps = guide.steps.map((step, index) => ({
    ...getStepIds(guide.slug, guideId, index),
    ...step,
    imageStatus: "pending" as const,
    imagePath: null,
    imageSource: null,
  }));

  return {
    id: taskId,
    source,
    taskId,
    guideId,
    applicationId: applicationId ?? guide.applicationSlug,
    applicationSlug: guide.applicationSlug,
    applicationName,
    applicationCategory,
    title: guide.title,
    slug: guide.slug,
    description: guide.description,
    safetyWarning: guide.safetyWarning,
    searchTerms: guide.searchTerms,
    difficulty: guide.difficulty,
    estimatedMinutes: guide.estimatedMinutes,
    appVersion: guide.appVersion,
    guideVersion: guide.guideVersion,
    reviewStatus: getReviewStatus(steps),
    steps,
    updatedAt,
  };
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asImageStatus(value: unknown): GuidePreviewImageStatus {
  if (value === "received" || value === "validated") return value;
  return "pending";
}

function asSource(value: unknown): GuidePreviewSource {
  if (value === "example" || value === "imported") return value;
  return "local";
}

/** Normaliza rascunhos antigos e arquivos do agente para o contrato atual. */
export function normalizeGuidePreviewDraft(value: unknown, sourceOverride?: GuidePreviewSource): GuidePreviewDraft | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<GuidePreviewDraft>;
  const applicationSlug = asString(raw.applicationSlug);
  const applicationId = asString(raw.applicationId, applicationSlug);
  const slug = asString(raw.slug);
  const title = asString(raw.title);
  const guideVersion = asString(raw.guideVersion, "0.1");
  const rawSteps = Array.isArray(raw.steps) ? raw.steps : [];
  if (!applicationSlug || !slug || !title || rawSteps.length < 1 || rawSteps.length > 50) return null;

  const taskId = getTaskId(applicationSlug, slug);
  const guideId = getGuideId(taskId, guideVersion);
  const steps: GuidePreviewStep[] = [];
  for (const [index, value] of rawSteps.entries()) {
    if (!value || typeof value !== "object") return null;
    const rawStep = value as Partial<GuidePreviewStep>;
    const stepTitle = asString(rawStep.title);
    const instruction = asString(rawStep.instruction);
    const imageAlt = asString(rawStep.imageAlt);
    if (!stepTitle || !instruction || !imageAlt) return null;
    steps.push({
      ...getStepIds(slug, guideId, index),
      title: stepTitle,
      instruction,
      imageAlt,
      warning: asString(rawStep.warning),
      confirmationMessage: asString(rawStep.confirmationMessage),
      imageStatus: asImageStatus(rawStep.imageStatus),
      imagePath: asString(rawStep.imagePath) || null,
      imageSource: asString(rawStep.imageSource) || null,
    });
  }

  const estimatedMinutes = typeof raw.estimatedMinutes === "number" && Number.isInteger(raw.estimatedMinutes)
    ? Math.min(120, Math.max(1, raw.estimatedMinutes))
    : 5;

  return {
    id: taskId,
    source: sourceOverride ?? asSource(raw.source),
    taskId,
    guideId,
    applicationId,
    applicationSlug,
    applicationName: asString(raw.applicationName, applicationSlug),
    applicationCategory: asString(raw.applicationCategory, "Sem categoria"),
    title,
    slug,
    description: asString(raw.description),
    safetyWarning: asString(raw.safetyWarning),
    searchTerms: asStringArray(raw.searchTerms),
    difficulty: raw.difficulty === "easy" || raw.difficulty === "advanced" ? raw.difficulty : "medium",
    estimatedMinutes,
    appVersion: asString(raw.appVersion, "genérica"),
    guideVersion,
    reviewStatus: getReviewStatus(steps),
    steps,
    updatedAt: asString(raw.updatedAt, new Date().toISOString()),
  };
}

export function getGuidePreviewCompleteness(draft: GuidePreviewDraft): GuideCompleteness {
  return getGuideCompleteness({
    applicationId: draft.applicationId,
    categoryId: draft.applicationCategory === "Sem categoria" ? null : draft.applicationCategory,
    title: draft.title,
    description: draft.description,
    searchTerms: draft.searchTerms,
    stepsByPlatform: { local: draft.steps },
    requiredPlatforms: ["local"],
  });
}

export function normalizeGuidePreviewExport(value: unknown): GuidePreviewDraft[] {
  if (!value || typeof value !== "object") return [];
  const raw = value as Partial<GuidePreviewExportFile> & { guide?: unknown };
  if (raw.format !== GUIDE_PREVIEW_EXPORT_FORMAT || raw.schemaVersion !== GUIDE_PREVIEW_SCHEMA_VERSION) return [];
  const values = Array.isArray(raw.guides) ? raw.guides : raw.guide ? [raw.guide] : [];
  return values
    .map((item) => normalizeGuidePreviewDraft(item, "imported"))
    .filter((item): item is GuidePreviewDraft => item !== null);
}

export function createGuidePreviewExport(guides: GuidePreviewDraft[]): GuidePreviewExportFile {
  return {
    format: GUIDE_PREVIEW_EXPORT_FORMAT,
    schemaVersion: GUIDE_PREVIEW_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    guides,
  };
}
