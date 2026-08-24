begin;

-- O produto aceita publicação imediata por qualquer conta autenticada. A
-- autoria permanece vinculada a auth.uid(); visitantes anônimos continuam sem
-- escrita e a exclusão do registro público permanece reservada ao superadmin.
drop policy if exists guide_public_images_admin_insert on public.guide_public_images;
drop policy if exists guide_public_images_admin_update on public.guide_public_images;

create policy guide_public_images_authenticated_insert
on public.guide_public_images
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy guide_public_images_authenticated_update
on public.guide_public_images
for update
to authenticated
using ((select auth.uid()) is not null)
with check (updated_by = (select auth.uid()));

drop policy if exists guide_public_storage_admin_insert on storage.objects;

create policy guide_public_storage_authenticated_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'guide-public'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

comment on table public.guide_public_images is
  'Imagens demonstrativas publicadas imediatamente por usuários autenticados do Guido.';

commit;
