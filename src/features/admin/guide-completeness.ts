export type GuideCompletenessStatus = "complete" | "incomplete";
export type GuideCompletenessReason = "metadata" | "steps" | "images" | "review" | "complete";

export interface GuideCompletenessStep {
  title: string;
  instruction: string;
  imageAlt: string;
  imageStatus: "pending" | "received" | "validated";
}

export interface GuidePlatformCoverage {
  totalSteps: number;
  stepsWithImages: number;
  validatedImages: number;
}

export interface GuideCompletenessInput {
  applicationId?: string | null;
  categoryId?: string | null;
  title?: string | null;
  description?: string | null;
  searchTerms?: readonly string[];
  stepsByPlatform: Record<string, readonly GuideCompletenessStep[]>;
  requiredPlatforms?: readonly string[];
  requireHumanReview?: boolean;
  humanValidated?: boolean;
}

export interface GuideCompleteness {
  status: GuideCompletenessStatus;
  reason: GuideCompletenessReason;
  totalSteps: number;
  stepsWithImages: number;
  validatedImages: number;
  platformCoverage: Record<string, GuidePlatformCoverage>;
}

function hasText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function countCoverage(steps: readonly GuideCompletenessStep[]): GuidePlatformCoverage {
  return {
    totalSteps: steps.length,
    stepsWithImages: steps.filter((step) => step.imageStatus !== "pending").length,
    validatedImages: steps.filter((step) => step.imageStatus === "validated").length,
  };
}

/**
 * Regra única para a biblioteca editorial.
 * Rascunho, imagem recebida e revisão humana não significam publicação.
 */
export function getGuideCompleteness(input: GuideCompletenessInput): GuideCompleteness {
  const requiredPlatforms = input.requiredPlatforms ?? Object.keys(input.stepsByPlatform);
  const platformCoverage = Object.fromEntries(
    requiredPlatforms.map((platform) => [platform, countCoverage(input.stepsByPlatform[platform] ?? [])]),
  );
  const allPlatforms = Object.values(platformCoverage);
  const allSteps = requiredPlatforms.flatMap((platform) => input.stepsByPlatform[platform] ?? []);
  const totalSteps = allSteps.length;
  const stepsWithImages = allPlatforms.reduce((total, coverage) => total + coverage.stepsWithImages, 0);
  const validatedImages = allPlatforms.reduce((total, coverage) => total + coverage.validatedImages, 0);

  const hasRequiredMetadata = [
    input.applicationId,
    input.categoryId,
    input.title,
    input.description,
  ].every((value) => hasText(value));
  const hasSearchTerms = (input.searchTerms ?? []).some((term) => hasText(term));
  if (!hasRequiredMetadata || !hasSearchTerms) {
    return {
      status: "incomplete",
      reason: "metadata",
      totalSteps,
      stepsWithImages,
      validatedImages,
      platformCoverage,
    };
  }

  const hasMissingSteps = requiredPlatforms.length === 0
    || requiredPlatforms.some((platform) => (input.stepsByPlatform[platform] ?? []).length === 0)
    || allSteps.some((step) => !hasText(step.title) || !hasText(step.instruction) || !hasText(step.imageAlt));
  if (hasMissingSteps) {
    return {
      status: "incomplete",
      reason: "steps",
      totalSteps,
      stepsWithImages,
      validatedImages,
      platformCoverage,
    };
  }

  if (allSteps.some((step) => step.imageStatus !== "validated")) {
    return {
      status: "incomplete",
      reason: "images",
      totalSteps,
      stepsWithImages,
      validatedImages,
      platformCoverage,
    };
  }

  if (input.requireHumanReview && !input.humanValidated) {
    return {
      status: "incomplete",
      reason: "review",
      totalSteps,
      stepsWithImages,
      validatedImages,
      platformCoverage,
    };
  }

  return {
    status: "complete",
    reason: "complete",
    totalSteps,
    stepsWithImages,
    validatedImages,
    platformCoverage,
  };
}
