import { z } from "zod";
import type { OperatingSystem } from "@/types/content";
import type { ProgressStatus } from "@/types/progress";

const remoteProgressSchema = z.object({
  data: z.object({
    guideId: z.string().min(1),
    currentStep: z.number().int().min(0).max(499),
    status: z.enum(["not_started", "in_progress", "completed"]),
    lastAccessedAt: z.string().min(1),
    completedAt: z.string().nullable(),
  }),
});

export interface RemoteProgress {
  guideId: string;
  currentStep: number;
  status: ProgressStatus;
  lastAccessedAt: string;
}

const remoteHistorySchema = z.object({
  data: z.array(z.object({
    guideId: z.string().uuid(),
    currentStep: z.number().int().min(0).max(499),
    status: z.enum(["not_started", "in_progress", "completed"]),
    lastAccessedAt: z.string().datetime(),
    guideVersion: z.string().min(1),
    operatingSystem: z.enum(["android", "ios"]),
    taskSlug: z.string().min(1),
    taskTitle: z.string().min(1),
    applicationName: z.string().min(1),
  })),
});

export interface RemoteHistoryItem extends RemoteProgress {
  guideVersion: string;
  operatingSystem: OperatingSystem;
  taskSlug: string;
  taskTitle: string;
  applicationName: string;
}

export async function loadRemoteProgress(guideId: string): Promise<RemoteProgress | null> {
  // Esta chamada passa pelo BFF do Next.js: o token de sessão nunca é lido nem
  // manipulado por este módulo executado no navegador.
  try {
    const response = await fetch(`/api/progress/${encodeURIComponent(guideId)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const parsed = remoteProgressSchema.safeParse(await response.json());
    if (!parsed.success) return null;
    return parsed.data.data;
  } catch {
    return null;
  }
}

export async function saveRemoteProgress(
  guideId: string,
  currentStep: number,
  status: ProgressStatus,
): Promise<boolean> {
  // Falhas de sincronização não interrompem o guia. O progresso local continua
  // sendo a fonte de recuperação para visitantes e durante instabilidades.
  try {
    const response = await fetch(`/api/progress/${encodeURIComponent(guideId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ currentStep, status }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function loadRemoteHistory(): Promise<RemoteHistoryItem[]> {
  try {
    const response = await fetch("/api/progress", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const parsed = remoteHistorySchema.safeParse(await response.json());
    return parsed.success ? parsed.data.data : [];
  } catch {
    return [];
  }
}
