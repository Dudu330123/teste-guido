begin;

-- Centraliza a verificação de equipe sem expor a tabela completa aos clientes.
create function public.is_active_team_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.team_members member
    where member.user_id = (select auth.uid())
      and member.active = true
  );
$$;

revoke all on function public.is_active_team_member() from public, anon;
grant execute on function public.is_active_team_member() to authenticated;

create table public.guide_image_drafts (
  id uuid primary key default gen_random_uuid(),
  guide_slug text not null check (guide_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  application_slug text check (
    application_slug is null or application_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  application_scope text generated always as (coalesce(application_slug, 'sem-aplicativo')) stored,
  operating_system public.guido_platform not null,
  step_id text not null check (
    char_length(step_id) between 1 and 200 and step_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  step_order smallint not null check (step_order between 1 and 500),
  storage_bucket text not null default 'guide-drafts' check (storage_bucket = 'guide-drafts'),
  storage_key text not null unique check (
    char_length(storage_key) between 1 and 1024 and storage_key !~ '(^|/)\.\.(/|$)'
  ),
  original_filename text not null check (char_length(original_filename) between 1 and 255),
  mime_type text not null check (mime_type in ('image/webp', 'image/png', 'image/jpeg')),
  byte_size bigint not null check (byte_size between 1 and 10485760),
  width integer not null check (width between 1 and 8192),
  height integer not null check (height between 1 and 8192),
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guide_slug, application_scope, operating_system, step_id)
);

create trigger guide_image_drafts_set_updated_at
before update on public.guide_image_drafts
for each row execute function public.set_updated_at();

-- A autoria original não pode ser reatribuída por um cliente autenticado.
create function public.preserve_guide_image_draft_creator()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_by := old.created_by;
  return new;
end;
$$;

create trigger guide_image_drafts_preserve_creator
before update on public.guide_image_drafts
for each row execute function public.preserve_guide_image_draft_creator();

revoke all on function public.preserve_guide_image_draft_creator() from public, anon, authenticated;

alter table public.guide_image_drafts enable row level security;

grant select on public.team_members to authenticated;
grant select, insert, update, delete on public.guide_image_drafts to authenticated;

create policy team_members_select_own on public.team_members
for select to authenticated using ((select auth.uid()) = user_id);

create policy guide_image_drafts_team_select on public.guide_image_drafts
for select to authenticated using ((select public.is_active_team_member()));

create policy guide_image_drafts_team_insert on public.guide_image_drafts
for insert to authenticated with check (
  (select public.is_active_team_member())
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy guide_image_drafts_team_update on public.guide_image_drafts
for update to authenticated using ((select public.is_active_team_member()))
with check (
  (select public.is_active_team_member())
  and updated_by = (select auth.uid())
);

create policy guide_image_drafts_team_delete on public.guide_image_drafts
for delete to authenticated using ((select public.is_active_team_member()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guide-drafts',
  'guide-drafts',
  false,
  10485760,
  array['image/webp', 'image/png', 'image/jpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

grant select, insert, update, delete on storage.objects to authenticated;

create policy guide_drafts_storage_team_select on storage.objects
for select to authenticated using (
  bucket_id = 'guide-drafts' and (select public.is_active_team_member())
);

create policy guide_drafts_storage_team_insert on storage.objects
for insert to authenticated with check (
  bucket_id = 'guide-drafts'
  and (select public.is_active_team_member())
  and split_part(name, '/', 1) = (select auth.uid())::text
);

create policy guide_drafts_storage_team_update on storage.objects
for update to authenticated using (
  bucket_id = 'guide-drafts' and (select public.is_active_team_member())
)
with check (
  bucket_id = 'guide-drafts' and (select public.is_active_team_member())
);

create policy guide_drafts_storage_team_delete on storage.objects
for delete to authenticated using (
  bucket_id = 'guide-drafts' and (select public.is_active_team_member())
);

comment on table public.guide_image_drafts is
  'Rascunhos privados compartilhados pela equipe; publicação exige fluxo de revisão separado.';

commit;
