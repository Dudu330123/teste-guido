import type { EvidenceManifest, EvidenceStep } from "@/types/guide-evidence";

export interface GuideStepReference { id: string; order: number; instruction: string }
export interface ValidationResult { ok: boolean; errors: string[]; buildableStepNumbers: number[] }

export function finalImagePath(manifest: EvidenceManifest, step: EvidenceStep) {
  return `/guides/${manifest.bankSlug}/${manifest.taskSlug}/${String(step.stepNumber).padStart(2, "0")}-${step.stepSlug}.png`;
}

export function validateManifestAgainstGuide(manifest: EvidenceManifest, guideSteps: GuideStepReference[], requireHumanApproval = false): ValidationResult {
  const errors: string[] = [];
  const orderedGuideSteps = [...guideSteps].sort((a, b) => a.order - b.order);
  const outputs = new Set<string>();
  if (requireHumanApproval && !manifest.humanApproval) errors.push("humanApproval is required before image publication");
  if (manifest.steps.length !== orderedGuideSteps.length) errors.push("step count must match the selected guide");
  manifest.steps.forEach((step) => {
    const guideStep = orderedGuideSteps[step.stepNumber - 1];
    if (!guideStep || step.stepNumber !== guideStep.order) errors.push(`stepNumber ${step.stepNumber} does not match guide order ${guideStep?.order ?? "missing"}`);
    if (!guideStep || step.guideStepId !== guideStep.id) errors.push(`guideStepId ${step.guideStepId} does not match the selected guide`);
    if (guideStep && step.instruction !== guideStep.instruction) errors.push(`instruction for stepNumber ${step.stepNumber} does not match the selected guide`);
    if (step.status === "VERIFIED") {
      const expected = `${String(step.stepNumber).padStart(2, "0")}-${step.stepSlug}.png`;
      if (step.outputFile !== expected) errors.push(`outputFile ${step.outputFile} must equal ${expected}`);
      if (outputs.has(step.outputFile)) errors.push(`outputFile ${step.outputFile} is duplicated`);
      outputs.add(step.outputFile);
    }
  });
  return { ok: errors.length === 0, errors, buildableStepNumbers: errors.length === 0 && Boolean(manifest.humanApproval) ? manifest.steps.filter((step) => step.status === "VERIFIED").map((step) => step.stepNumber) : [] };
}
