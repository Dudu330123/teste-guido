export type EvidenceStatus = "VERIFIED" | "PARTIAL" | "NOT_VERIFIED" | "INCOMPATIBLE" | "SKIPPED_APP_ICON_STEP";
export type EvidenceBounds = [number, number, number, number];

export interface SourceReview {
  sourceUrl: string;
  sourceType: "youtube" | "official-documentation";
  reviewedAt: string;
  appName: string;
  operatingSystem: "android" | "ios" | "unknown";
  interfaceStatus: "COMPATIBLE" | "REJECTED";
  reviewedRangeSeconds?: [number, number];
  reason: string;
}

export interface VisibleTarget {
  kind: "button" | "field" | "menu";
  text: string;
  bounds: EvidenceBounds;
}

export interface Redaction {
  bounds: EvidenceBounds;
  reason: "personal-data";
}

interface EvidenceStepBase {
  stepNumber: number;
  stepSlug: string;
  guideStepId: string;
  instruction: string;
}

export interface VerifiedEvidenceStep extends EvidenceStepBase {
  status: "VERIFIED";
  sourceUrl: string;
  sourceTimestampSeconds: number;
  sourceFramePath: string;
  visibleScreenText: string[];
  visibleTarget: VisibleTarget;
  redactions?: Redaction[];
  yellowHighlight: { bounds: EvidenceBounds };
  outputFile: string;
}

export interface UnverifiedEvidenceStep extends EvidenceStepBase {
  status: "PARTIAL" | "NOT_VERIFIED" | "INCOMPATIBLE";
  reason: string;
}

export interface SkippedAppIconEvidenceStep extends EvidenceStepBase {
  status: "SKIPPED_APP_ICON_STEP";
  reason: "SKIPPED — APP ICON STEP";
}

export type EvidenceStep = VerifiedEvidenceStep | UnverifiedEvidenceStep | SkippedAppIconEvidenceStep;

export interface EvidenceManifest {
  schemaVersion: 1;
  bankSlug: string;
  taskSlug: string;
  operatingSystem: "android" | "ios";
  appName: string;
  appVersionEvidence: string;
  researchCompletedAt: string;
  sourceReviews: SourceReview[];
  humanApproval?: { approvedBy: string; approvedAt: string };
  steps: EvidenceStep[];
}
