import { z } from "zod";
import type { EvidenceManifest } from "@/types/guide-evidence";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const bounds = z.tuple([
  z.number().finite().nonnegative(), z.number().finite().nonnegative(),
  z.number().finite().positive(), z.number().finite().positive(),
]);
const base = z.object({
  stepNumber: z.number().int().positive(), stepSlug: slug,
  guideStepId: z.string().min(1), instruction: z.string().min(1),
});

const verified = base.extend({
  status: z.literal("VERIFIED"), sourceUrl: z.url(),
  sourceTimestampSeconds: z.number().finite().nonnegative(),
  sourceFramePath: z.string().regex(/^evidence\/.+\/frames\/.+\.png$/),
  visibleScreenText: z.array(z.string().min(1)).min(1),
  visibleTarget: z.object({ kind: z.enum(["button", "field", "menu"]), text: z.string().min(1), bounds }),
  redactions: z.array(z.object({ bounds, reason: z.literal("personal-data") })).optional(),
  yellowHighlight: z.object({ bounds }), outputFile: z.string().regex(/^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.png$/),
}).strict();
const unresolved = base.extend({
  status: z.enum(["PARTIAL", "NOT_VERIFIED", "INCOMPATIBLE"]), reason: z.string().min(1),
}).strict();
const skipped = base.extend({ status: z.literal("SKIPPED_APP_ICON_STEP"), reason: z.literal("SKIPPED — APP ICON STEP") }).strict();
const sourceReview = z.object({
  sourceUrl: z.url(), sourceType: z.enum(["youtube", "official-documentation"]), reviewedAt: z.iso.datetime(),
  appName: z.string().min(1), operatingSystem: z.enum(["android", "ios", "unknown"]),
  interfaceStatus: z.enum(["COMPATIBLE", "REJECTED"]),
  reviewedRangeSeconds: z.tuple([z.number().finite().nonnegative(), z.number().finite().nonnegative()]).optional(),
  reason: z.string().min(1),
}).strict().superRefine((value, context) => {
  if (value.reviewedRangeSeconds && value.reviewedRangeSeconds[1] < value.reviewedRangeSeconds[0]) {
    context.addIssue({ code: "custom", message: "reviewedRangeSeconds must be in ascending order" });
  }
});

export const evidenceManifestSchema = z.object({
  schemaVersion: z.literal(1), bankSlug: slug, taskSlug: slug,
  operatingSystem: z.enum(["android", "ios"]), appName: z.string().min(1),
  appVersionEvidence: z.string().min(1), researchCompletedAt: z.iso.datetime(),
  sourceReviews: z.array(sourceReview).min(2),
  humanApproval: z.object({ approvedBy: z.string().min(1), approvedAt: z.iso.datetime() }).optional(),
  steps: z.array(z.discriminatedUnion("status", [verified, unresolved, skipped])).min(1),
}).strict();

export function parseEvidenceManifest(input: unknown): EvidenceManifest {
  return evidenceManifestSchema.parse(input) as EvidenceManifest;
}
