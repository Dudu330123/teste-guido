import { z } from "zod";
import type { Application, GuideStep, OperatingSystem, Task } from "@/types/content";
import type { RemoteGuideContent } from "@/lib/api/catalog";
import { getSupabaseServerClient } from "./server";
import { isBankCategory } from "@/data/applications";

const publicationStatusSchema = z.enum(["draft", "under_review", "published", "outdated"]);
const mediaSchema = z.object({
  storage_bucket: z.string().min(1),
  storage_key: z.string().min(1),
  mime_type: z.enum(["image/avif", "image/webp", "image/png", "audio/mpeg"]),
  status: publicationStatusSchema,
  contains_personal_data: z.boolean(),
});
const guideRowSchema = z.object({
  id: z.string().uuid(),
  tutorial_id: z.string().uuid(),
  platform: z.enum(["android", "ios"]),
  app_version: z.string().min(1),
  guide_version: z.string().min(1),
  reviewed_at: z.string().nullable(),
  status: publicationStatusSchema,
  estimated_minutes: z.number().int().positive(),
  tutorials: z.object({
    id: z.string().uuid(),
    application_id: z.string().uuid(),
    title: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().min(1),
    difficulty: z.enum(["easy", "medium", "advanced"]),
    safety_warning: z.string(),
    status: publicationStatusSchema,
    is_demo: z.boolean(),
    image_context_slug: z.string().min(1),
    tutorial_search_terms: z.array(z.object({ term: z.string().min(1) })),
    applications: z.object({
      id: z.string().uuid(),
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().min(1),
      status: publicationStatusSchema,
      is_demo: z.boolean(),
      categories: z.object({ name: z.string().min(1) }),
    }),
  }),
  steps: z.array(z.object({
    id: z.string().uuid(),
    guide_version_id: z.string().uuid(),
    position: z.number().int().positive(),
    title: z.string().min(1),
    instruction: z.string().min(1),
    image_alt: z.string().min(1),
    warning: z.string().nullable(),
    confirmation_message: z.string().nullable(),
    step_media: z.array(z.object({
      purpose: z.enum(["screen", "audio"]),
      sort_order: z.number().int().nonnegative(),
      media_assets: mediaSchema,
    })),
  })).min(1),
});

const applicationRowsSchema = z.array(z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  status: publicationStatusSchema,
  is_demo: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  categories: z.object({ name: z.string().min(1) }),
}));
const tutorialRowsSchema = z.array(z.object({
  id: z.string().uuid(),
  application_id: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "advanced"]),
  safety_warning: z.string(),
  status: publicationStatusSchema,
  is_demo: z.boolean(),
  image_context_slug: z.string().min(1),
  tutorial_search_terms: z.array(z.object({ term: z.string().min(1) })),
  guide_versions: z.array(z.object({ status: publicationStatusSchema })),
}));
const popularityRowsSchema = z.array(z.object({
  tutorial_id: z.string().uuid(),
  access_count: z.number().int().nonnegative(),
}));
const uploadGuideRowsSchema = z.array(z.object({
  id: z.string().uuid(),
  platform: z.enum(["android", "ios"]),
  public_for_upload: z.literal(true),
  tutorials: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    applications: z.object({
      is_demo: z.boolean(),
      categories: z.object({ name: z.string().min(1) }),
    }),
  }),
  steps: z.array(z.object({
    position: z.number().int().positive(),
    editorial_key: z.string().min(1),
    title: z.string().min(1),
    instruction: z.string().min(1),
    image_alt: z.string().min(1),
    warning: z.string().nullable(),
    confirmation_message: z.string().nullable(),
  })),
}));

export interface SupabaseUploadGuide {
  category: "bank" | "other";
  slug: string;
  stepsByOperatingSystem: Record<OperatingSystem, GuideStep[]>;
  title: string;
}

type MediaLocation = z.infer<typeof mediaSchema>;

function mediaLocationKey(media: MediaLocation) {
  return `${media.storage_bucket}/${media.storage_key}`;
}

/** Converte apenas linhas já filtradas pelas políticas públicas do Supabase. */
export function parseSupabaseGuideRow(
  payload: unknown,
  signedUrls: ReadonlyMap<string, string> = new Map(),
): RemoteGuideContent | null {
  const parsed = guideRowSchema.safeParse(payload);
  if (!parsed.success) return null;
  const row = parsed.data;
  const tutorial = row.tutorials;
  const application = tutorial.applications;

  return {
    application: {
      id: application.id,
      name: application.name,
      slug: application.slug,
      description: application.description,
      category: application.categories.name,
      logoPath: null,
      searchTerms: [],
      status: application.status === "published" || application.is_demo ? "available" : "preparing",
      createdAt: "",
      updatedAt: "",
    },
    task: {
      id: tutorial.id,
      applicationId: tutorial.application_id,
      title: tutorial.title,
      slug: tutorial.slug,
      description: tutorial.description,
      difficulty: tutorial.difficulty,
      safetyWarning: tutorial.safety_warning,
      searchTerms: tutorial.tutorial_search_terms.map(({ term }) => term),
      availability: tutorial.is_demo ? "demo" : "preparing",
      status: tutorial.status,
    },
    guide: {
      id: row.id,
      taskId: tutorial.id,
      operatingSystem: row.platform,
      appVersion: row.app_version,
      guideVersion: row.guide_version,
      lastReviewedAt: row.reviewed_at,
      status: row.status,
      estimatedMinutes: row.estimated_minutes,
    },
    imageContext: {
      guideSlug: tutorial.image_context_slug,
      applicationSlug: application.is_demo ? null : application.slug,
    },
    steps: row.steps
      .sort((first, second) => first.position - second.position)
      .map((step) => {
        const screen = step.step_media.find(({ purpose }) => purpose === "screen")?.media_assets;
        const audio = step.step_media.find(({ purpose }) => purpose === "audio")?.media_assets;
        const imagePath = screen ? signedUrls.get(mediaLocationKey(screen)) ?? "" : "";
        const audioPath = audio ? signedUrls.get(mediaLocationKey(audio)) : undefined;
        return {
          id: step.id,
          guideId: step.guide_version_id,
          order: step.position,
          title: step.title,
          instruction: step.instruction,
          imagePath,
          imageAlt: step.image_alt,
          ...(audioPath ? { audioPath } : {}),
          ...(step.warning ? { warning: step.warning } : {}),
          ...(step.confirmation_message ? { confirmationMessage: step.confirmation_message } : {}),
        };
      }),
  };
}

export async function getGuideFromSupabase(
  tutorialSlug: string,
  operatingSystem: OperatingSystem,
): Promise<RemoteGuideContent | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const loadRow = async (status: "draft" | "published") => supabase
      .from("guide_versions")
      .select(`
      id, tutorial_id, platform, app_version, guide_version, reviewed_at, status, estimated_minutes,
      tutorials!inner(
        id, application_id, title, slug, description, difficulty, safety_warning, status, is_demo, image_context_slug,
        tutorial_search_terms(term),
        applications!inner(id, name, slug, description, status, is_demo, categories!inner(name))
      ),
      steps(
        id, guide_version_id, position, title, instruction, image_alt, warning, confirmation_message,
        step_media(purpose, sort_order, media_assets(storage_bucket, storage_key, mime_type, status, contains_personal_data))
      )
    `)
      .eq("tutorials.slug", tutorialSlug)
      .eq("platform", operatingSystem)
      .eq("status", status)
      .order("updated_at", { ascending: false })
      .order("position", { referencedTable: "steps", ascending: true })
      .limit(1)
      .maybeSingle();

  let { data, error } = await loadRow("published");
  if (!data && !error) {
    const draft = await loadRow("draft");
    const parsedDraft = guideRowSchema.safeParse(draft.data);
    // Roteiros colaborativos podem ser lidos para receber prints, mas somente
    // uma demonstração explícita pode ser aberta antes da publicação humana.
    if (parsedDraft.success && parsedDraft.data.tutorials.is_demo) {
      data = draft.data;
      error = draft.error;
    }
  }
  if (error || !data) return null;

  const parsed = guideRowSchema.safeParse(data);
  if (!parsed.success) return null;
  const media = parsed.data.steps.flatMap((step) =>
    step.step_media.map(({ media_assets: asset }) => asset),
  );
  const uniqueMedia = [...new Map(media.map((asset) => [mediaLocationKey(asset), asset])).values()];
  const signedUrlEntries = await Promise.all(uniqueMedia.map(async (asset) => {
    // Buckets permanecem privados; URLs curtas evitam tornar prints revisados
    // permanentemente públicos e dependem da política de leitura do Storage.
    const { data: signed } = await supabase.storage
      .from(asset.storage_bucket)
      .createSignedUrl(asset.storage_key, 60 * 60);
    return signed?.signedUrl ? [mediaLocationKey(asset), signed.signedUrl] as const : null;
  }));
  const signedUrls = new Map(signedUrlEntries.filter((entry): entry is readonly [string, string] => entry !== null));
  return parseSupabaseGuideRow(parsed.data, signedUrls);
}

export interface SupabaseCatalog {
  applications: Application[];
  tasks: Task[];
}

export function mergeCatalogWithFallback(
  remote: SupabaseCatalog | null,
  fallback: SupabaseCatalog,
): SupabaseCatalog {
  if (!remote) return fallback;
  const applicationsBySlug = new Map(fallback.applications.map((application) => [application.slug, application]));
  remote.applications.forEach((application) => applicationsBySlug.set(application.slug, application));
  const mergedApplications = [...applicationsBySlug.values()];
  const replacementIds = new Map(fallback.applications.map((application) => [
    application.id,
    applicationsBySlug.get(application.slug)?.id ?? application.id,
  ]));
  const tasksBySlug = new Map(fallback.tasks.map((task) => [task.slug, {
    ...task,
    applicationId: replacementIds.get(task.applicationId) ?? task.applicationId,
  }]));
  remote.tasks.forEach((task) => tasksBySlug.set(task.slug, task));
  return { applications: mergedApplications, tasks: [...tasksBySlug.values()] };
}

export async function getCatalogFromSupabase(): Promise<SupabaseCatalog | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const [applicationsResult, tutorialsResult] = await Promise.all([
    supabase
      .from("applications")
      .select("id, name, slug, description, status, is_demo, created_at, updated_at, categories!inner(name)")
      .order("name", { ascending: true }),
    supabase
      .from("tutorials")
      .select("id, application_id, title, slug, description, difficulty, safety_warning, status, is_demo, image_context_slug, tutorial_search_terms(term), guide_versions(status)")
      .order("title", { ascending: true }),
  ]);
  if (applicationsResult.error || tutorialsResult.error) return null;
  const applicationRows = applicationRowsSchema.safeParse(applicationsResult.data);
  const tutorialRows = tutorialRowsSchema.safeParse(tutorialsResult.data);
  if (!applicationRows.success || !tutorialRows.success) return null;

  return {
    applications: applicationRows.data.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      category: row.categories.name,
      logoPath: null,
      searchTerms: [],
      status: "available",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    tasks: tutorialRows.data.map((row) => ({
      id: row.id,
      applicationId: row.application_id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      difficulty: row.difficulty,
      safetyWarning: row.safety_warning,
      searchTerms: row.tutorial_search_terms.map(({ term }) => term),
      availability: row.is_demo
        ? "demo"
        : row.guide_versions.some(({ status }) => status === "published") ? "available" : "preparing",
      status: row.status,
    })),
  };
}

/** Converte os roteiros públicos para upload mantendo a chave editorial antiga. */
export function parseSupabaseUploadGuides(payload: unknown): SupabaseUploadGuide[] | null {
  const parsed = uploadGuideRowsSchema.safeParse(payload);
  if (!parsed.success) return null;
  const guides = new Map<string, SupabaseUploadGuide>();
  for (const row of parsed.data) {
    const current = guides.get(row.tutorials.slug) ?? {
      slug: row.tutorials.slug,
      title: row.tutorials.title,
      category: row.tutorials.applications.is_demo
        && isBankCategory(row.tutorials.applications.categories.name) ? "bank" : "other",
      stepsByOperatingSystem: { android: [], ios: [] },
    };
    current.stepsByOperatingSystem[row.platform] = row.steps
      .sort((first, second) => first.position - second.position)
      .map((step) => ({
        id: step.editorial_key,
        guideId: row.id,
        order: step.position,
        title: step.title,
        instruction: step.instruction,
        imagePath: "",
        imageAlt: step.image_alt,
        ...(step.warning ? { warning: step.warning } : {}),
        ...(step.confirmation_message ? { confirmationMessage: step.confirmation_message } : {}),
      }));
    guides.set(current.slug, current);
  }
  return [...guides.values()].sort((first, second) => first.title.localeCompare(second.title, "pt-BR"));
}

export async function getUploadGuidesFromSupabase(): Promise<SupabaseUploadGuide[] | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("guide_versions")
    .select(`
      id, platform, public_for_upload,
      tutorials!inner(title, slug, applications!inner(is_demo, categories!inner(name))),
      steps(position, editorial_key, title, instruction, image_alt, warning, confirmation_message)
    `)
    .eq("public_for_upload", true)
    .order("position", { referencedTable: "steps", ascending: true });
  if (error) return null;
  return parseSupabaseUploadGuides(data);
}

/** Retorna somente contagens agregadas; nenhuma identidade ou histórico individual sai do banco. */
export async function getGuidePopularityFromSupabase() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return new Map<string, number>();
  const { data, error } = await supabase
    .from("guide_access_stats")
    .select("tutorial_id, access_count")
    .order("access_count", { ascending: false })
    .limit(50);
  if (error) return new Map<string, number>();
  const parsed = popularityRowsSchema.safeParse(data);
  if (!parsed.success) return new Map<string, number>();
  return new Map(parsed.data.map((row) => [row.tutorial_id, row.access_count]));
}
