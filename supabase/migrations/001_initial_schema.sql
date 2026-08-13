begin;

create extension if not exists pgcrypto;

create type public.guido_platform as enum ('android', 'ios');
create type public.guido_publication_status as enum ('draft', 'under_review', 'published', 'outdated');
create type public.guido_team_role as enum ('editor', 'reviewer', 'admin', 'superadmin');
create type public.guido_progress_status as enum ('not_started', 'in_progress', 'completed');
create type public.guido_review_decision as enum ('changes_requested', 'approved');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 100),
  preferred_platform public.guido_platform,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.guido_team_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '' check (char_length(description) <= 500),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null check (char_length(description) between 1 and 500),
  logo_media_id uuid,
  status public.guido_publication_status not null default 'draft',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tutorials (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null check (char_length(description) between 1 and 1000),
  difficulty text not null check (difficulty in ('easy', 'medium', 'advanced')),
  safety_warning text not null default '' check (char_length(safety_warning) <= 1500),
  status public.guido_publication_status not null default 'draft',
  is_demo boolean not null default false,
  search_document tsvector generated always as (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tutorial_search_terms (
  tutorial_id uuid not null references public.tutorials(id) on delete cascade,
  term text not null check (char_length(term) between 1 and 120),
  normalized_term text generated always as (lower(term)) stored,
  primary key (tutorial_id, term)
);

create table public.guide_versions (
  id uuid primary key default gen_random_uuid(),
  tutorial_id uuid not null references public.tutorials(id) on delete restrict,
  platform public.guido_platform not null,
  app_version text not null check (char_length(app_version) between 1 and 80),
  guide_version text not null check (char_length(guide_version) between 1 and 80),
  status public.guido_publication_status not null default 'draft',
  estimated_minutes smallint not null check (estimated_minutes between 1 and 120),
  reviewed_at timestamptz,
  published_at timestamptz,
  replaced_by_id uuid references public.guide_versions(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tutorial_id, platform, guide_version)
);

create table public.steps (
  id uuid primary key default gen_random_uuid(),
  guide_version_id uuid not null references public.guide_versions(id) on delete cascade,
  position smallint not null check (position between 1 and 500),
  title text not null check (char_length(title) between 1 and 160),
  instruction text not null check (char_length(instruction) between 1 and 2000),
  image_alt text not null check (char_length(image_alt) between 1 and 1000),
  warning text check (warning is null or char_length(warning) <= 2000),
  confirmation_message text check (confirmation_message is null or char_length(confirmation_message) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guide_version_id, position)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null check (char_length(storage_bucket) between 1 and 63),
  storage_key text not null check (
    char_length(storage_key) between 1 and 1024 and
    storage_key !~ '(^|/)\.\.(/|$)'
  ),
  original_filename text not null check (char_length(original_filename) between 1 and 255),
  mime_type text not null check (mime_type in ('image/avif', 'image/webp', 'image/png', 'audio/mpeg')),
  byte_size bigint not null check (byte_size between 1 and 10485760),
  sha256_hex text not null check (sha256_hex ~ '^[0-9a-f]{64}$'),
  width integer check (width is null or width between 1 and 8192),
  height integer check (height is null or height between 1 and 8192),
  status public.guido_publication_status not null default 'draft',
  contains_personal_data boolean not null default false,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_key)
);

alter table public.applications
  add constraint applications_logo_media_fk
  foreign key (logo_media_id) references public.media_assets(id) on delete set null;

create table public.step_media (
  step_id uuid not null references public.steps(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  purpose text not null check (purpose in ('screen', 'audio')),
  sort_order smallint not null default 0 check (sort_order between 0 and 100),
  primary key (step_id, media_id, purpose)
);

create table public.guide_reviews (
  id uuid primary key default gen_random_uuid(),
  guide_version_id uuid not null references public.guide_versions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete restrict,
  decision public.guido_review_decision not null,
  notes text not null default '' check (char_length(notes) <= 5000),
  created_at timestamptz not null default now()
);

create table public.user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  guide_version_id uuid not null references public.guide_versions(id) on delete cascade,
  current_step smallint not null default 0 check (current_step between 0 and 499),
  status public.guido_progress_status not null default 'not_started',
  last_accessed_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, guide_version_id),
  check ((status = 'completed' and completed_at is not null) or status <> 'completed')
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  tutorial_id uuid not null references public.tutorials(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tutorial_id)
);

create table public.guide_reports (
  id uuid primary key default gen_random_uuid(),
  guide_version_id uuid not null references public.guide_versions(id) on delete restrict,
  reporter_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('outdated', 'incorrect', 'unsafe', 'accessibility', 'other')),
  description text not null check (char_length(description) between 10 and 2000),
  status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (char_length(action) between 1 and 120),
  resource_type text not null check (char_length(resource_type) between 1 and 80),
  resource_id uuid,
  request_id text check (request_id is null or char_length(request_id) <= 100),
  result text not null check (result in ('success', 'denied', 'failure')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger team_members_set_updated_at before update on public.team_members
for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger applications_set_updated_at before update on public.applications
for each row execute function public.set_updated_at();
create trigger tutorials_set_updated_at before update on public.tutorials
for each row execute function public.set_updated_at();
create trigger guide_versions_set_updated_at before update on public.guide_versions
for each row execute function public.set_updated_at();
create trigger steps_set_updated_at before update on public.steps
for each row execute function public.set_updated_at();
create trigger media_assets_set_updated_at before update on public.media_assets
for each row execute function public.set_updated_at();
create trigger user_progress_set_updated_at before update on public.user_progress
for each row execute function public.set_updated_at();

create index applications_category_idx on public.applications(category_id, status);
create index tutorials_application_idx on public.tutorials(application_id, status);
create index tutorials_category_idx on public.tutorials(category_id, status);
create index tutorials_search_idx on public.tutorials using gin(search_document);
create index tutorial_search_terms_normalized_idx on public.tutorial_search_terms(normalized_term);
create index guide_versions_tutorial_platform_idx
  on public.guide_versions(tutorial_id, platform, status);
create unique index guide_versions_one_published_idx
  on public.guide_versions(tutorial_id, platform) where status = 'published';
create index steps_guide_position_idx on public.steps(guide_version_id, position);
create index media_assets_status_idx on public.media_assets(status, created_at desc);
create index guide_reviews_guide_idx on public.guide_reviews(guide_version_id, created_at desc);
create index user_progress_recent_idx on public.user_progress(user_id, last_accessed_at desc);
create index guide_reports_status_idx on public.guide_reports(status, created_at);
create index audit_logs_resource_idx on public.audit_logs(resource_type, resource_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs(actor_user_id, created_at desc);

comment on table public.media_assets is
  'Metadados de arquivos. O conteúdo físico permanece no Supabase Storage.';
comment on column public.audit_logs.metadata is
  'Metadados mínimos sem tokens, senhas, CPF ou dados bancários.';

commit;
