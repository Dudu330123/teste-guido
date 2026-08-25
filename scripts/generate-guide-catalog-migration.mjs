import { writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

const migrationPath = process.argv[2];
if (!migrationPath) {
  throw new Error("Informe o caminho da migration que receberá o catálogo.");
}

const projectRoot = process.cwd();
const vite = await createServer({
  appType: "custom",
  configFile: path.join(projectRoot, "vitest.config.ts"),
  logLevel: "error",
  server: { hmr: false, middlewareMode: true },
});

const categoryMetadata = {
  "Comunicação": {
    slug: "comunicacao",
    description: "Orientações educativas para mensagens, chamadas e contatos.",
  },
  "Serviços financeiros": {
    slug: "servicos-financeiros",
    description: "Orientações educativas sobre aplicativos financeiros.",
  },
  "Serviços públicos": {
    slug: "servicos-publicos",
    description: "Orientações educativas para acessar serviços digitais públicos.",
  },
};

const actionImageContext = {
  pix: "fazer-pix",
  boleto: "pagar-boleto",
  comprovante: "ver-comprovante-pix",
  "bloquear-cartao": "bloquear-cartao",
  saldo: "saldo",
  limite: "limite",
};

function jsonForSql(value) {
  return JSON.stringify(value).replaceAll("$json$", "$ json $");
}

try {
  const [{ applications }, guideData, adminScripts, { actions }] = await Promise.all([
    vite.ssrLoadModule("/src/data/applications.ts"),
    vite.ssrLoadModule("/src/data/guides.ts"),
    vite.ssrLoadModule("/src/data/admin-guide-scripts.ts"),
    vite.ssrLoadModule("/src/data/actions.ts"),
  ]);

  const applicationById = new Map(applications.map((application) => [application.id, application]));
  const importedTasks = [...guideData.tasks];

  // Alguns roteiros bancários são agrupados por assunto no upload e não tinham
  // um item genérico próprio no catálogo local. Eles recebem esse item antes da
  // importação para que os 745 prints existentes mantenham o mesmo guide_slug.
  for (const action of actions) {
    if (!adminScripts.adminScriptSlugs.includes(action.slug)) continue;
    if (importedTasks.some((task) => task.slug === action.slug)) continue;
    importedTasks.push({
      id: `task-${action.slug}-generic`,
      applicationId: "app-demo-bancos",
      actionId: action.id,
      title: action.taskTitle,
      slug: action.slug,
      description: action.description,
      difficulty: "medium",
      safetyWarning: "Conteúdo em preparação e pendente de revisão humana.",
      searchTerms: action.searchTerms,
      availability: "preparing",
      status: "draft",
    });
  }

  const tasksBySlug = new Map(importedTasks.map((task) => [task.slug, task]));
  const categories = [...new Set(applications.map((application) => application.category))].map((name) => ({
    name,
    ...categoryMetadata[name],
  }));
  const applicationRows = applications.map((application) => ({
    slug: application.slug,
    category_slug: categoryMetadata[application.category].slug,
    name: application.name,
    description: application.description,
    status: application.id === "app-demo-bancos" ? "draft" : "published",
    is_demo: application.id === "app-demo-bancos",
  }));
  const tutorialRows = importedTasks.map((task) => {
    const application = applicationById.get(task.applicationId);
    if (!application) throw new Error(`Aplicativo ausente para ${task.slug}.`);
    // Roteiros genéricos da área editorial preservam o próprio slug usado nos
    // uploads. Somente itens específicos de um aplicativo apontam para o
    // contexto genérico compartilhado entre bancos.
    const imageContextSlug = adminScripts.adminScriptSlugs.includes(task.slug)
      ? task.slug
      : task.actionId
        ? actionImageContext[task.actionId] ?? task.slug
        : task.slug;
    return {
      slug: task.slug,
      application_slug: application.slug,
      category_slug: categoryMetadata[application.category].slug,
      title: task.title,
      description: task.description,
      difficulty: task.difficulty,
      safety_warning: task.safetyWarning,
      status: task.availability === "demo" ? "draft" : "published",
      is_demo: task.availability === "demo",
      image_context_slug: imageContextSlug,
      search_terms: task.searchTerms,
    };
  });

  const guideRows = [];
  const stepRows = [];
  const guideSlugs = ["pagar-boleto", ...adminScripts.adminScriptSlugs];
  for (const slug of guideSlugs) {
    const task = tasksBySlug.get(slug);
    if (!task) throw new Error(`Tarefa ausente para o roteiro ${slug}.`);
    for (const platform of ["android", "ios"]) {
      const localGuide = slug === "pagar-boleto" ? guideData.getGuide(platform) : null;
      const steps = slug === "pagar-boleto"
        ? guideData.getStepsForGuide(localGuide.id)
        : adminScripts.getAdminScriptSteps(slug, platform);
      const guideVersion = localGuide?.guideVersion ?? "0.1-imported";
      guideRows.push({
        tutorial_slug: slug,
        platform,
        app_version: localGuide?.appVersion ?? "genérica",
        guide_version: guideVersion,
        status: "draft",
        estimated_minutes: localGuide?.estimatedMinutes ?? Math.max(2, Math.ceil(steps.length * 0.75)),
        public_for_upload: true,
      });
      steps.forEach((step) => stepRows.push({
        tutorial_slug: slug,
        platform,
        guide_version: guideVersion,
        position: step.order,
        editorial_key: step.id,
        title: step.title,
        instruction: step.instruction,
        image_alt: step.imageAlt,
        warning: step.warning ?? null,
        confirmation_message: step.confirmationMessage ?? null,
      }));
    }
  }

  const sql = `begin;

-- O catálogo pode ser público sem publicar um roteiro. A publicação do guia
-- continua controlada por guide_versions.status e por revisão humana.
alter table public.tutorials
  add column if not exists image_context_slug text;

update public.tutorials
set image_context_slug = slug
where image_context_slug is null;

alter table public.tutorials
  alter column image_context_slug set not null;

alter table public.tutorials
  drop constraint if exists tutorials_image_context_slug_check;
alter table public.tutorials
  add constraint tutorials_image_context_slug_check
  check (image_context_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

alter table public.guide_versions
  add column if not exists public_for_upload boolean not null default false;

alter table public.steps
  add column if not exists editorial_key text;

alter table public.steps
  drop constraint if exists steps_editorial_key_check;
alter table public.steps
  add constraint steps_editorial_key_check check (
    editorial_key is null or (
      char_length(editorial_key) between 1 and 200
      and editorial_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    )
  );

create unique index if not exists steps_guide_editorial_key_idx
  on public.steps(guide_version_id, editorial_key)
  where editorial_key is not null;

create temporary table guido_import_categories on commit drop as
select * from jsonb_to_recordset($json$${jsonForSql(categories)}$json$::jsonb)
  as row(name text, slug text, description text);

create temporary table guido_import_applications on commit drop as
select * from jsonb_to_recordset($json$${jsonForSql(applicationRows)}$json$::jsonb)
  as row(slug text, category_slug text, name text, description text,
         status public.guido_publication_status, is_demo boolean);

create temporary table guido_import_tutorials on commit drop as
select * from jsonb_to_recordset($json$${jsonForSql(tutorialRows)}$json$::jsonb)
  as row(slug text, application_slug text, category_slug text, title text,
         description text, difficulty text, safety_warning text,
         status public.guido_publication_status, is_demo boolean,
         image_context_slug text, search_terms jsonb);

create temporary table guido_import_guides on commit drop as
select * from jsonb_to_recordset($json$${jsonForSql(guideRows)}$json$::jsonb)
  as row(tutorial_slug text, platform public.guido_platform, app_version text,
         guide_version text, status public.guido_publication_status,
         estimated_minutes smallint, public_for_upload boolean);

create temporary table guido_import_steps on commit drop as
select * from jsonb_to_recordset($json$${jsonForSql(stepRows)}$json$::jsonb)
  as row(tutorial_slug text, platform public.guido_platform, guide_version text,
         position smallint, editorial_key text, title text, instruction text,
         image_alt text, warning text, confirmation_message text);

insert into public.categories (name, slug, description)
select name, slug, description from guido_import_categories
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.applications (
  category_id, name, slug, description, status, is_demo
)
select category.id, source.name, source.slug, source.description,
       source.status, source.is_demo
from guido_import_applications source
join public.categories category on category.slug = source.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  is_demo = excluded.is_demo;

insert into public.tutorials (
  application_id, category_id, title, slug, description, difficulty,
  safety_warning, status, is_demo, image_context_slug
)
select application.id, category.id, source.title, source.slug,
       source.description, source.difficulty, source.safety_warning,
       source.status, source.is_demo, source.image_context_slug
from guido_import_tutorials source
join public.applications application on application.slug = source.application_slug
join public.categories category on category.slug = source.category_slug
on conflict (slug) do update set
  application_id = excluded.application_id,
  category_id = excluded.category_id,
  title = excluded.title,
  description = excluded.description,
  difficulty = excluded.difficulty,
  safety_warning = excluded.safety_warning,
  status = excluded.status,
  is_demo = excluded.is_demo,
  image_context_slug = excluded.image_context_slug;

insert into public.tutorial_search_terms (tutorial_id, term)
select tutorial.id, term.value
from guido_import_tutorials source
join public.tutorials tutorial on tutorial.slug = source.slug
cross join lateral jsonb_array_elements_text(source.search_terms) as term(value)
on conflict (tutorial_id, term) do nothing;

insert into public.guide_versions (
  tutorial_id, platform, app_version, guide_version, status,
  estimated_minutes, public_for_upload
)
select tutorial.id, source.platform, source.app_version,
       source.guide_version, source.status, source.estimated_minutes,
       source.public_for_upload
from guido_import_guides source
join public.tutorials tutorial on tutorial.slug = source.tutorial_slug
on conflict (tutorial_id, platform, guide_version) do update set
  app_version = excluded.app_version,
  estimated_minutes = excluded.estimated_minutes,
  public_for_upload = public.guide_versions.public_for_upload or excluded.public_for_upload;

insert into public.steps (
  guide_version_id, position, editorial_key, title, instruction,
  image_alt, warning, confirmation_message
)
select guide.id, source.position, source.editorial_key, source.title,
       source.instruction, source.image_alt, source.warning,
       source.confirmation_message
from guido_import_steps source
join public.tutorials tutorial on tutorial.slug = source.tutorial_slug
join public.guide_versions guide
  on guide.tutorial_id = tutorial.id
 and guide.platform = source.platform
 and guide.guide_version = source.guide_version
on conflict (guide_version_id, position) do update set
  editorial_key = excluded.editorial_key,
  title = excluded.title,
  instruction = excluded.instruction,
  image_alt = excluded.image_alt,
  warning = excluded.warning,
  confirmation_message = excluded.confirmation_message;

-- O catálogo e os passos de upload são públicos porque já aparecem na área
-- colaborativa. Um roteiro só fica navegável quando estiver published, exceto
-- a demonstração explicitamente marcada como is_demo.
drop policy if exists guide_versions_read_available on public.guide_versions;
create policy guide_versions_read_available on public.guide_versions
for select to anon, authenticated using (
  status = 'published'
  or public_for_upload = true
  or (
    status = 'draft' and exists (
      select 1 from public.tutorials tutorial
      where tutorial.id = guide_versions.tutorial_id
        and tutorial.status = 'draft'
        and tutorial.is_demo = true
    )
  )
);

drop policy if exists steps_read_available on public.steps;
create policy steps_read_available on public.steps
for select to anon, authenticated using (
  exists (
    select 1
    from public.guide_versions guide
    join public.tutorials tutorial on tutorial.id = guide.tutorial_id
    where guide.id = steps.guide_version_id
      and (
        guide.status = 'published'
        or guide.public_for_upload = true
        or (
          guide.status = 'draft'
          and tutorial.status = 'draft'
          and tutorial.is_demo = true
        )
      )
  )
);

-- Os arquivos e chaves existentes permanecem intocados. As novas FKs apenas
-- documentam a relação com o roteiro e permitem uma migração gradual.
alter table public.guide_public_images
  add column if not exists guide_version_id uuid
    references public.guide_versions(id) on delete set null,
  add column if not exists guide_step_id uuid
    references public.steps(id) on delete set null;

create index if not exists guide_public_images_guide_version_idx
  on public.guide_public_images(guide_version_id);
create index if not exists guide_public_images_guide_step_idx
  on public.guide_public_images(guide_step_id);

create or replace function public.link_guide_public_image()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  select guide.id, step.id
  into new.guide_version_id, new.guide_step_id
  from public.tutorials tutorial
  join public.guide_versions guide on guide.tutorial_id = tutorial.id
  join public.steps step
    on step.guide_version_id = guide.id
   and step.position = new.step_order
  where tutorial.image_context_slug = new.guide_slug
    and guide.platform = new.operating_system
    and (guide.public_for_upload = true or guide.status = 'published')
  order by (guide.status = 'published') desc, guide.updated_at desc
  limit 1;
  return new;
end;
$function$;

revoke all on function public.link_guide_public_image() from public, anon, authenticated;

drop trigger if exists guide_public_images_link_guide on public.guide_public_images;
create trigger guide_public_images_link_guide
before insert or update of guide_slug, operating_system, step_order
on public.guide_public_images
for each row execute function public.link_guide_public_image();

update public.guide_public_images image
set guide_version_id = linked.guide_version_id,
    guide_step_id = linked.guide_step_id
from (
  select image_row.id as image_id,
         guide.id as guide_version_id,
         step.id as guide_step_id,
         row_number() over (
           partition by image_row.id
           order by (guide.status = 'published') desc, guide.updated_at desc
         ) as preference
  from public.guide_public_images image_row
  join public.tutorials tutorial
    on tutorial.image_context_slug = image_row.guide_slug
  join public.guide_versions guide
    on guide.tutorial_id = tutorial.id
   and guide.platform = image_row.operating_system
   and (guide.public_for_upload = true or guide.status = 'published')
  join public.steps step
    on step.guide_version_id = guide.id
   and step.position = image_row.step_order
) linked
where image.id = linked.image_id
  and linked.preference = 1;

comment on column public.tutorials.image_context_slug is
  'Chave estável usada para preservar os prints já armazenados em guide-public.';
comment on column public.guide_versions.public_for_upload is
  'Permite exibir o roteiro na colaboração sem publicá-lo como guia validado.';
comment on column public.steps.editorial_key is
  'Identificador estável usado pela interface de upload e pelos prints existentes.';
comment on column public.guide_public_images.guide_step_id is
  'Vínculo opcional com o passo estruturado; storage_bucket e storage_key permanecem a fonte do arquivo.';

commit;
`;

  await writeFile(path.resolve(projectRoot, migrationPath), sql, "utf8");
  process.stdout.write(`Migration gerada com ${applicationRows.length} aplicativos, ${tutorialRows.length} tarefas, ${guideRows.length} versões e ${stepRows.length} passos.\n`);
} finally {
  await vite.close();
}
