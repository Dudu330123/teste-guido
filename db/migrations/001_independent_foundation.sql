begin;

create extension if not exists pgcrypto;
do $$ begin create type guido_platform as enum ('android', 'ios'); exception when duplicate_object then null; end $$;
do $$ begin create type guido_publication_status as enum ('draft', 'under_review', 'published', 'outdated'); exception when duplicate_object then null; end $$;
do $$ begin create type guido_team_role as enum ('editor', 'reviewer', 'admin', 'superadmin'); exception when duplicate_object then null; end $$;
do $$ begin create type guido_progress_status as enum ('not_started', 'in_progress', 'completed'); exception when duplicate_object then null; end $$;
do $$ begin create type guido_review_decision as enum ('changes_requested', 'approved'); exception when duplicate_object then null; end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(), email text not null, normalized_email text not null unique,
  password_hash text, email_verified_at timestamptz, display_name text not null,
  preferred_platform guido_platform, disabled boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists user_identities (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  provider text not null check (provider in ('password', 'google')), provider_subject text not null,
  provider_email text, created_at timestamptz not null default now(),
  unique (provider, provider_subject), unique (user_id, provider)
);
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique, expires_at timestamptz not null, created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(), revoked_at timestamptz, user_agent text, ip_hash text
);
create index if not exists sessions_lookup_idx on sessions(token_hash, expires_at) where revoked_at is null;
create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique, expires_at timestamptz not null, consumed_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists password_reset_lookup_idx on password_reset_tokens(token_hash, expires_at) where consumed_at is null;
create table if not exists email_verification_tokens (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique, expires_at timestamptz not null, consumed_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists email_verification_lookup_idx on email_verification_tokens(token_hash, expires_at) where consumed_at is null;
create table if not exists profiles (
  id uuid primary key references users(id) on delete cascade, display_name text not null, preferred_platform guido_platform,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists team_members (
  user_id uuid primary key references users(id) on delete cascade, role guido_team_role not null, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, description text not null default '', sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists applications (
  id uuid primary key default gen_random_uuid(), category_id uuid not null references categories(id), name text not null, slug text not null unique, description text not null,
  logo_media_id uuid, status guido_publication_status not null default 'draft', is_demo boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists tutorials (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references applications(id), category_id uuid not null references categories(id),
  title text not null, slug text not null unique, description text not null, difficulty text not null check (difficulty in ('easy', 'medium', 'advanced')),
  safety_warning text not null default '', status guido_publication_status not null default 'draft', is_demo boolean not null default false, image_context_slug text not null default '',
  search_document tsvector generated always as (setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') || setweight(to_tsvector('portuguese', coalesce(description, '')), 'B')) stored,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists tutorial_search_terms (tutorial_id uuid not null references tutorials(id) on delete cascade, term text not null, primary key (tutorial_id, term));
create table if not exists guide_versions (
  id uuid primary key default gen_random_uuid(), tutorial_id uuid not null references tutorials(id), platform guido_platform not null, app_version text not null, guide_version text not null,
  status guido_publication_status not null default 'draft', public_for_upload boolean not null default false, estimated_minutes smallint not null default 1,
  reviewed_at timestamptz, published_at timestamptz, replaced_by_id uuid references guide_versions(id) on delete set null, created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (tutorial_id, platform, guide_version)
);
create table if not exists steps (
  id uuid primary key default gen_random_uuid(), guide_version_id uuid not null references guide_versions(id) on delete cascade, position smallint not null,
  editorial_key text not null default '', title text not null, instruction text not null, image_alt text not null, warning text, confirmation_message text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (guide_version_id, position)
);
create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(), storage_bucket text not null, storage_key text not null, original_filename text not null, mime_type text not null,
  byte_size bigint not null, sha256_hex text not null default '', width integer, height integer, status guido_publication_status not null default 'draft', contains_personal_data boolean not null default false,
  reviewed_by uuid references users(id) on delete set null, reviewed_at timestamptz, created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (storage_bucket, storage_key)
);
alter table applications drop constraint if exists applications_logo_media_fk;
alter table applications add constraint applications_logo_media_fk foreign key (logo_media_id) references media_assets(id) on delete set null;
create table if not exists step_media (
  step_id uuid not null references steps(id) on delete cascade, media_id uuid not null references media_assets(id) on delete restrict, purpose text not null check (purpose in ('screen', 'audio')),
  sort_order smallint not null default 0, primary key (step_id, media_id, purpose)
);
create table if not exists guide_reviews (
  id uuid primary key default gen_random_uuid(), guide_version_id uuid not null references guide_versions(id) on delete cascade, reviewer_id uuid not null references users(id),
  decision guido_review_decision not null, notes text not null default '', created_at timestamptz not null default now()
);
create table if not exists user_progress (
  user_id uuid not null references users(id) on delete cascade, guide_version_id uuid not null references guide_versions(id) on delete cascade, current_step smallint not null default 0,
  status guido_progress_status not null default 'not_started', last_accessed_at timestamptz not null default now(), completed_at timestamptz, updated_at timestamptz not null default now(),
  primary key (user_id, guide_version_id)
);
create table if not exists favorites (user_id uuid not null references users(id) on delete cascade, tutorial_id uuid not null references tutorials(id) on delete cascade, created_at timestamptz not null default now(), primary key (user_id, tutorial_id));
create table if not exists guide_reports (
  id uuid primary key default gen_random_uuid(), guide_version_id uuid not null references guide_versions(id), reporter_id uuid references users(id) on delete set null,
  category text not null, description text not null, status text not null default 'open', created_at timestamptz not null default now(), resolved_at timestamptz
);
create table if not exists audit_logs (
  id bigint generated always as identity primary key, actor_user_id uuid references users(id) on delete set null, action text not null, resource_type text not null, resource_id uuid,
  request_id text, result text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists guide_image_drafts (
  id uuid primary key default gen_random_uuid(), guide_slug text not null, application_slug text, operating_system guido_platform not null, step_id text not null, step_order smallint not null,
  storage_bucket text not null default 'guide-drafts', storage_key text not null unique, original_filename text not null, mime_type text not null, byte_size bigint not null,
  width integer not null, height integer not null, created_by uuid references users(id), updated_by uuid references users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists guide_public_images (
  id uuid primary key default gen_random_uuid(), guide_slug text not null, application_slug text, operating_system guido_platform not null, step_id text not null, step_order smallint not null,
  storage_bucket text not null default 'guide-public', storage_key text not null unique, original_filename text not null, mime_type text not null, byte_size bigint not null,
  width integer not null, height integer not null, created_by uuid references users(id), updated_by uuid references users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists guide_access_stats (tutorial_id uuid primary key references tutorials(id) on delete cascade, access_count bigint not null default 0, last_accessed_at timestamptz not null default now());
create index if not exists tutorials_search_idx on tutorials using gin(search_document);
create index if not exists guide_versions_lookup_idx on guide_versions(tutorial_id, platform, status);
create index if not exists steps_lookup_idx on steps(guide_version_id, position);
create index if not exists user_progress_recent_idx on user_progress(user_id, last_accessed_at desc);
create index if not exists guide_images_context_idx on guide_public_images(guide_slug, application_slug, operating_system, step_order);

create or replace function set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
do $$ declare target text; begin
  foreach target in array array['users','profiles','team_members','categories','applications','tutorials','guide_versions','steps','media_assets','user_progress','guide_image_drafts','guide_public_images'] loop
    execute format('drop trigger if exists %I_updated_at on %I', target, target);
    execute format('create trigger %I_updated_at before update on %I for each row execute function set_updated_at()', target, target);
  end loop;
end $$;

commit;
