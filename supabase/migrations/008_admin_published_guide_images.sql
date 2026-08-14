begin;

-- Publicar imediatamente é uma capacidade administrativa, diferente do vínculo
-- editorial usado para visualizar rascunhos internos.
create function public.is_active_guide_publisher()
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
      and member.role in ('admin', 'superadmin')
  );
$$;

revoke all on function public.is_active_guide_publisher() from public, anon;
grant execute on function public.is_active_guide_publisher() to authenticated;

create table public.guide_public_images (
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
  storage_bucket text not null default 'guide-public' check (storage_bucket = 'guide-public'),
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

create trigger guide_public_images_set_updated_at
before update on public.guide_public_images
for each row execute function public.set_updated_at();

create function public.preserve_guide_public_image_creator()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_by := old.created_by;
  return new;
end;
$$;

create trigger guide_public_images_preserve_creator
before update on public.guide_public_images
for each row execute function public.preserve_guide_public_image_creator();

revoke all on function public.preserve_guide_public_image_creator() from public, anon, authenticated;

alter table public.guide_public_images enable row level security;

-- Visitantes recebem somente colunas necessárias para montar a imagem do guia;
-- autoria e nome original do arquivo não fazem parte da API pública.
grant select (
  id, guide_slug, application_slug, operating_system, step_id, step_order,
  storage_bucket, storage_key, mime_type, byte_size, width, height, updated_at
) on public.guide_public_images to anon, authenticated;
grant insert (
  guide_slug, application_slug, operating_system, step_id, step_order,
  storage_bucket, storage_key, original_filename, mime_type, byte_size,
  width, height, created_by, updated_by
) on public.guide_public_images to authenticated;
grant update (
  guide_slug, application_slug, operating_system, step_id, step_order,
  storage_bucket, storage_key, original_filename, mime_type, byte_size,
  width, height, updated_by
) on public.guide_public_images to authenticated;
grant delete on public.guide_public_images to authenticated;

create policy guide_public_images_read on public.guide_public_images
for select to anon, authenticated using (true);

create policy guide_public_images_admin_insert on public.guide_public_images
for insert to authenticated with check (
  (select public.is_active_guide_publisher())
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy guide_public_images_admin_update on public.guide_public_images
for update to authenticated using ((select public.is_active_guide_publisher()))
with check (
  (select public.is_active_guide_publisher())
  and updated_by = (select auth.uid())
);

create policy guide_public_images_admin_delete on public.guide_public_images
for delete to authenticated using ((select public.is_active_guide_publisher()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guide-public',
  'guide-public',
  true,
  10485760,
  array['image/webp', 'image/png', 'image/jpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy guide_public_storage_admin_insert on storage.objects
for insert to authenticated with check (
  bucket_id = 'guide-public'
  and (select public.is_active_guide_publisher())
  and split_part(name, '/', 1) = (select auth.uid())::text
);

create policy guide_public_storage_admin_update on storage.objects
for update to authenticated using (
  bucket_id = 'guide-public' and (select public.is_active_guide_publisher())
)
with check (
  bucket_id = 'guide-public' and (select public.is_active_guide_publisher())
);

create policy guide_public_storage_admin_delete on storage.objects
for delete to authenticated using (
  bucket_id = 'guide-public' and (select public.is_active_guide_publisher())
);

comment on table public.guide_public_images is
  'Imagens demonstrativas publicadas imediatamente por administradores do Guido.';

commit;
