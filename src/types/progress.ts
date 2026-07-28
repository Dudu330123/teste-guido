import type { OperatingSystem } from "./content";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface UserProgress {
  guideId: string;
  currentStep: number;
  status: ProgressStatus;
  lastAccessedAt: string;
  guideVersion: string;
  operatingSystem: OperatingSystem;
}
