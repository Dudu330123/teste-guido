export type OperatingSystem = "android" | "ios";
export type ContentStatus = "draft" | "under_review" | "published" | "outdated";
export type ApplicationAvailability = "available" | "preparing";

export interface Application {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logoPath: string | null;
  status: ApplicationAvailability;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  applicationId: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "easy" | "medium" | "advanced";
  safetyWarning: string;
  status: ContentStatus;
}

export interface Guide {
  id: string;
  taskId: string;
  operatingSystem: OperatingSystem;
  appVersion: string;
  guideVersion: string;
  lastReviewedAt: string | null;
  status: ContentStatus;
  estimatedMinutes: number;
}

export interface GuideStep {
  id: string;
  guideId: string;
  order: number;
  title: string;
  instruction: string;
  imagePath: string;
  imageAlt: string;
  audioPath?: string;
  warning?: string;
  confirmationMessage?: string;
}
