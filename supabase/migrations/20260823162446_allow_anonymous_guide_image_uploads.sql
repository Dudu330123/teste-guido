begin;

-- Decisao de produto: permitir colaboracao imediata sem login. A autoria fica
-- nula para visitantes, por isso a moderacao futura deve usar auditoria de
-- Storage/CDN, limite de taxa e uma fila de revisao quando o MVP evoluir.
alter table public.guide_public_images
  alter column created_by drop not null,
  alter column updated_by drop not null;

grant insert (
  guide_slug, application_slug, operating_system, step_id, step_order,
  storage_bucket, storage_key, original_filename, mime_type, byte_size,
  width, height, created_by, updated_by
) on public.guide_public_images to anon;

grant update (
  guide_slug, application_slug, operating_system, step_id, step_order,
  storage_bucket, storage_key, original_filename, mime_type, byte_size,
  width, height, updated_by
) on public.guide_public_images to anon;

drop policy if exists guide_public_images_authenticated_insert on public.guide_public_images;
drop policy if exists guide_public_images_authenticated_update on public.guide_public_images;

create policy guide_public_images_public_insert
on public.guide_public_images
for insert
to anon, authenticated
with check (
  created_by is null
  and updated_by is null
  and storage_key like 'public/%'
);

create policy guide_public_images_public_update
on public.guide_public_images
for update
to anon, authenticated
using (true)
with check (
  updated_by is null
  and storage_key like 'public/%'
);

drop policy if exists guide_public_storage_authenticated_insert on storage.objects;

create policy guide_public_storage_public_insert
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'guide-public'
  and (storage.foldername(name))[1] = 'public'
);

comment on table public.guide_public_images is
  'Imagens demonstrativas publicadas imediatamente por visitantes e usuários do Guido.';

commit;
