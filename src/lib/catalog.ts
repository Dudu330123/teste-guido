import { z } from "zod";
import type { Application, GuideStep, OperatingSystem, Task } from "@/types/content";
import type { RemoteGuideContent } from "@/lib/api/catalog";
import { query } from "@/lib/db/client";
import { signedObjectUrl } from "@/lib/storage";
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
  public_for_upload: z.boolean(),
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
  // O Postgres serializa timestamptz com deslocamento (por exemplo +00:00).
  // Rejeitar esse formato fazia todo o catálogo remoto cair no fallback local.
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
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
  guide_versions: z.array(z.object({
    status: publicationStatusSchema,
    public_for_upload: z.boolean(),
  })),
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

/**
 * Rascunhos abertos à colaboração podem ser conferidos como prévia. O status
 * continua sendo exibido como não revisado e não equivale a publicação oficial.
 */
export function canOpenGuideVersion(
  status: "draft" | "under_review" | "published" | "outdated",
  isDemo: boolean,
  publicForUpload: boolean,
) {
  return status === "published" || isDemo || publicForUpload;
}

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
      availability: tutorial.is_demo || row.status !== "published" ? "demo" : "available",
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
  const result = await query<{
    guide_id: string; tutorial_id: string; platform: OperatingSystem; public_for_upload: boolean; app_version: string; guide_version: string; reviewed_at: string | null; guide_status: "draft" | "under_review" | "published" | "outdated"; estimated_minutes: number;
    tutorial_title: string; tutorial_slug: string; tutorial_description: string; difficulty: "easy" | "medium" | "advanced"; safety_warning: string; tutorial_status: "draft" | "under_review" | "published" | "outdated"; is_demo: boolean; image_context_slug: string; application_id: string; application_name: string; application_slug: string; application_description: string; application_status: "draft" | "under_review" | "published" | "outdated"; application_is_demo: boolean; category_name: string; search_term: string | null;
    step_id: string | null; guide_version_id: string | null; position: number | null; step_title: string | null; instruction: string | null; image_alt: string | null; warning: string | null; confirmation_message: string | null;
    purpose: "screen" | "audio" | null; sort_order: number | null; storage_bucket: string | null; storage_key: string | null; mime_type: "image/avif" | "image/webp" | "image/png" | "audio/mpeg" | null; media_status: "draft" | "under_review" | "published" | "outdated" | null; contains_personal_data: boolean | null;
  }>(
    `select gv.id as guide_id, gv.tutorial_id, gv.platform, gv.public_for_upload, gv.app_version, gv.guide_version, gv.reviewed_at, gv.status as guide_status, gv.estimated_minutes,
            t.title as tutorial_title, t.slug as tutorial_slug, t.description as tutorial_description, t.difficulty, t.safety_warning, t.status as tutorial_status, t.is_demo, t.image_context_slug, t.application_id,
            a.name as application_name, a.slug as application_slug, a.description as application_description, a.status as application_status, a.is_demo as application_is_demo, c.name as category_name, tst.term as search_term,
            s.id as step_id, s.guide_version_id, s.position, s.title as step_title, s.instruction, s.image_alt, s.warning, s.confirmation_message,
            sm.purpose, sm.sort_order, ma.storage_bucket, ma.storage_key, ma.mime_type, ma.status as media_status, ma.contains_personal_data
       from guide_versions gv join tutorials t on t.id = gv.tutorial_id join applications a on a.id = t.application_id join categories c on c.id = t.category_id
       left join tutorial_search_terms tst on tst.tutorial_id = t.id left join steps s on s.guide_version_id = gv.id left join step_media sm on sm.step_id = s.id left join media_assets ma on ma.id = sm.media_id
      where t.slug = $1 and gv.platform = $2 and (gv.status = 'published' or (gv.status = 'draft' and (t.is_demo or gv.public_for_upload)))
      order by (gv.status = 'published') desc, gv.updated_at desc, s.position asc, sm.sort_order asc`,
    [tutorialSlug, operatingSystem],
  );
  const first = result.rows[0];
  if (!first) return null;
  const stepMap = new Map<string, { id: string; guide_version_id: string; position: number; title: string; instruction: string; image_alt: string; warning: string | null; confirmation_message: string | null; step_media: Array<{ purpose: "screen" | "audio"; sort_order: number; media_assets: MediaLocation }> }>();
  const searchTerms = new Map<string, string>();
  for (const row of result.rows) {
    if (row.search_term) searchTerms.set(row.search_term, row.search_term);
    if (!row.step_id || row.position === null || !row.step_title || !row.instruction || !row.image_alt || !row.guide_version_id) continue;
    const step = stepMap.get(row.step_id) ?? { id: row.step_id, guide_version_id: row.guide_version_id, position: row.position, title: row.step_title, instruction: row.instruction, image_alt: row.image_alt, warning: row.warning, confirmation_message: row.confirmation_message, step_media: [] };
    if (row.purpose && row.storage_bucket && row.storage_key && row.mime_type && row.media_status && row.contains_personal_data !== null) step.step_media.push({ purpose: row.purpose, sort_order: row.sort_order ?? 0, media_assets: { storage_bucket: row.storage_bucket, storage_key: row.storage_key, mime_type: row.mime_type, status: row.media_status, contains_personal_data: row.contains_personal_data } });
    stepMap.set(row.step_id, step);
  }
  const payload = {
    id: first.guide_id, tutorial_id: first.tutorial_id, platform: first.platform, public_for_upload: first.public_for_upload, app_version: first.app_version, guide_version: first.guide_version, reviewed_at: first.reviewed_at, status: first.guide_status, estimated_minutes: first.estimated_minutes,
    tutorials: { id: first.tutorial_id, application_id: first.application_id, title: first.tutorial_title, slug: first.tutorial_slug, description: first.tutorial_description, difficulty: first.difficulty, safety_warning: first.safety_warning, status: first.tutorial_status, is_demo: first.is_demo, image_context_slug: first.image_context_slug, tutorial_search_terms: [...searchTerms.values()].map((term) => ({ term })), applications: { id: first.application_id, name: first.application_name, slug: first.application_slug, description: first.application_description, status: first.application_status, is_demo: first.application_is_demo, categories: { name: first.category_name } } },
    steps: [...stepMap.values()],
  };
  const media = [...stepMap.values()].flatMap((step) => step.step_media.map(({ media_assets: asset }) => asset));
  const signedUrls = new Map(media.map((asset) => [mediaLocationKey(asset), signedObjectUrl(asset.storage_bucket, asset.storage_key)]));
  return parseSupabaseGuideRow(payload, signedUrls);
}

export interface SupabaseCatalog {
  applications: Application[];
  tasks: Task[];
}

/** Valida a resposta completa antes que dados remotos cheguem aos componentes. */
export function parseSupabaseCatalogRows(
  applicationPayload: unknown,
  tutorialPayload: unknown,
): SupabaseCatalog | null {
  const applicationRows = applicationRowsSchema.safeParse(applicationPayload);
  const tutorialRows = tutorialRowsSchema.safeParse(tutorialPayload);
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
        : row.guide_versions.some(({ status }) => status === "published")
          ? "available"
          : row.guide_versions.some(({ status, public_for_upload }) => status === "draft" && public_for_upload)
            ? "demo"
            : "preparing",
      status: row.status,
    })),
  };
}

export function mergeCatalogWithFallback(
  remote: SupabaseCatalog | null,
  fallback: SupabaseCatalog,
): SupabaseCatalog {
  if (!remote) return fallback;
  const fallbackApplicationsBySlug = new Map(
    fallback.applications.map((application) => [application.slug, application]),
  );
  const applicationsBySlug = new Map(fallbackApplicationsBySlug);
  remote.applications.forEach((application) => {
    const localApplication = fallbackApplicationsBySlug.get(application.slug);
    applicationsBySlug.set(application.slug, {
      ...application,
      // O banco ainda não possui logos cadastradas. Dados editoriais remotos
      // prevalecem, mas os assets locais conhecidos não podem desaparecer.
      logoPath: application.logoPath ?? localApplication?.logoPath ?? null,
      searchTerms: [...new Set([
        ...(localApplication?.searchTerms ?? []),
        ...application.searchTerms,
      ])],
    });
  });
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
  try {
    const [applicationsResult, tutorialsResult] = await Promise.all([
      query(`select a.id, a.name, a.slug, a.description, a.status, a.is_demo, a.created_at, a.updated_at, c.name as category_name from applications a join categories c on c.id = a.category_id order by a.name`),
      query(`select t.id, t.application_id, t.title, t.slug, t.description, t.difficulty, t.safety_warning, t.status, t.is_demo, t.image_context_slug,
                    coalesce((select json_agg(json_build_object('term', tst.term)) from tutorial_search_terms tst where tst.tutorial_id = t.id), '[]'::json) as tutorial_search_terms,
                    coalesce((select json_agg(json_build_object('status', gv.status, 'public_for_upload', gv.public_for_upload)) from guide_versions gv where gv.tutorial_id = t.id), '[]'::json) as guide_versions
               from tutorials t order by t.title`),
    ]);
    const applicationPayload = applicationsResult.rows.map((row) => ({
      ...row,
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
      categories: { name: row.category_name },
    }));
    const tutorialPayload = tutorialsResult.rows;
    return parseSupabaseCatalogRows(applicationPayload, tutorialPayload);
  } catch {
    return null;
  }
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
  try {
    const result = await query(`select gv.id, gv.platform, gv.public_for_upload, t.title, t.slug, a.is_demo, c.name as category_name,
                                       s.position, s.editorial_key, s.title as step_title, s.instruction, s.image_alt, s.warning, s.confirmation_message
                                  from guide_versions gv join tutorials t on t.id = gv.tutorial_id join applications a on a.id = t.application_id join categories c on c.id = t.category_id
                                  join steps s on s.guide_version_id = gv.id where gv.public_for_upload = true order by t.title, gv.platform, s.position`);
    const payload = result.rows.map((row) => ({ id: row.id, platform: row.platform, public_for_upload: true, tutorials: { title: row.title, slug: row.slug, applications: { is_demo: row.is_demo, categories: { name: row.category_name } } }, steps: [{ position: row.position, editorial_key: row.editorial_key, title: row.step_title, instruction: row.instruction, image_alt: row.image_alt, warning: row.warning, confirmation_message: row.confirmation_message }] }));
    return parseSupabaseUploadGuides(payload);
  } catch {
    return null;
  }
}

/** Retorna somente contagens agregadas; nenhuma identidade ou histórico individual sai do banco. */
export async function getGuidePopularityFromSupabase() {
  try {
    const result = await query("select tutorial_id, access_count from guide_access_stats order by access_count desc limit 50");
    const parsed = popularityRowsSchema.safeParse(result.rows);
    if (!parsed.success) return new Map<string, number>();
    return new Map(parsed.data.map((row) => [row.tutorial_id, row.access_count]));
  } catch {
    return new Map<string, number>();
  }
}
