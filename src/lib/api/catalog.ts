import { z } from "zod";
import type { Application, Guide, GuideStep, OperatingSystem, Task } from "@/types/content";

const statusSchema = z.enum(["draft", "under_review", "published", "outdated"]);

const guideResponseSchema = z.object({
  data: z.object({
    application: z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().min(1),
      category: z.string().min(1),
      logoUrl: z.string().url().nullable(),
      status: statusSchema,
    }),
    tutorial: z.object({
      id: z.string().min(1),
      applicationId: z.string().min(1),
      applicationName: z.string().min(1),
      title: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().min(1),
      difficulty: z.enum(["easy", "medium", "advanced"]),
      safetyWarning: z.string(),
      searchTerms: z.array(z.string()),
      status: statusSchema,
      isDemo: z.boolean(),
    }),
    guide: z.object({
      id: z.string().min(1),
      tutorialId: z.string().min(1),
      platform: z.enum(["android", "ios"]),
      appVersion: z.string().min(1),
      guideVersion: z.string().min(1),
      lastReviewedAt: z.string().nullable(),
      status: statusSchema,
      estimatedMinutes: z.number().int().positive(),
    }),
    steps: z.array(z.object({
      id: z.string().min(1),
      guideId: z.string().min(1),
      order: z.number().int().positive(),
      title: z.string().min(1),
      instruction: z.string().min(1),
      imageUrl: z.string().url().nullable(),
      imageAlt: z.string().min(1),
      audioUrl: z.string().url().nullable(),
      warning: z.string().nullable(),
      confirmationMessage: z.string().nullable(),
    })).min(1),
  }),
});

export interface RemoteGuideContent {
  application: Application;
  guide: Guide;
  imageContext?: {
    applicationSlug: string | null;
    guideSlug: string;
  };
  steps: GuideStep[];
  task: Task;
}

export function parseGuideResponse(payload: unknown): RemoteGuideContent | null {
  // A API C++ é uma fronteira externa: nenhum dado entra nos componentes sem
  // validação estrutural e conversão para os tipos usados pelo frontend.
  const parsed = guideResponseSchema.safeParse(payload);
  if (!parsed.success) return null;
  const { application, tutorial, guide, steps } = parsed.data.data;

  return {
    application: {
      id: application.id,
      name: application.name,
      slug: application.slug,
      description: application.description,
      category: application.category,
      logoPath: application.logoUrl,
      searchTerms: [],
      status: application.status === "published" || tutorial.isDemo ? "available" : "preparing",
      createdAt: "",
      updatedAt: "",
    },
    task: {
      id: tutorial.id,
      applicationId: tutorial.applicationId,
      title: tutorial.title,
      slug: tutorial.slug,
      description: tutorial.description,
      difficulty: tutorial.difficulty,
      safetyWarning: tutorial.safetyWarning,
      searchTerms: tutorial.searchTerms,
      availability: tutorial.isDemo ? "demo" : "preparing",
      status: tutorial.status,
    },
    guide: {
      id: guide.id,
      taskId: tutorial.id,
      operatingSystem: guide.platform,
      appVersion: guide.appVersion,
      guideVersion: guide.guideVersion,
      lastReviewedAt: guide.lastReviewedAt,
      status: guide.status,
      estimatedMinutes: guide.estimatedMinutes,
    },
    steps: steps.map((step) => ({
      id: step.id,
      guideId: step.guideId,
      order: step.order,
      title: step.title,
      instruction: step.instruction,
      imagePath: step.imageUrl ?? "",
      imageAlt: step.imageAlt,
      ...(step.audioUrl ? { audioPath: step.audioUrl } : {}),
      ...(step.warning ? { warning: step.warning } : {}),
      ...(step.confirmationMessage ? { confirmationMessage: step.confirmationMessage } : {}),
    })),
  };
}

function getApiUrl() {
  const value = process.env.GUIDO_API_URL;
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export async function getGuideFromApi(
  tutorialSlug: string,
  operatingSystem: OperatingSystem,
): Promise<RemoteGuideContent | null> {
  const baseUrl = getApiUrl();
  if (!baseUrl) return null;

  const endpoint = new URL(`/api/v1/tutorials/${encodeURIComponent(tutorialSlug)}`, baseUrl);
  endpoint.searchParams.set("platform", operatingSystem);

  try {
    // O timeout curto impede que uma API indisponível deixe o idoso esperando.
    // null aciona o guia local demonstrativo na camada chamadora.
    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(2_000),
    });
    if (!response.ok) return null;
    return parseGuideResponse(await response.json());
  } catch {
    return null;
  }
}
