begin;

-- A demonstração continua em draft e identificada como is_demo. Estas políticas
-- permitem somente esse caso explícito; rascunhos comuns permanecem invisíveis.
drop policy if exists categories_read_published on public.categories;
create policy categories_read_available on public.categories
for select to anon, authenticated using (
  exists (
    select 1 from public.tutorials t
    where t.category_id = categories.id
      and (t.status = 'published' or (t.status = 'draft' and t.is_demo = true))
  )
);

drop policy if exists applications_read_published on public.applications;
create policy applications_read_available on public.applications
for select to anon, authenticated using (
  status = 'published' or (status = 'draft' and is_demo = true)
);

drop policy if exists tutorials_read_published on public.tutorials;
create policy tutorials_read_available on public.tutorials
for select to anon, authenticated using (
  status = 'published' or (status = 'draft' and is_demo = true)
);

drop policy if exists tutorial_search_terms_read_published on public.tutorial_search_terms;
create policy tutorial_search_terms_read_available on public.tutorial_search_terms
for select to anon, authenticated using (
  exists (
    select 1 from public.tutorials t
    where t.id = tutorial_search_terms.tutorial_id
      and (t.status = 'published' or (t.status = 'draft' and t.is_demo = true))
  )
);

drop policy if exists guide_versions_read_published on public.guide_versions;
create policy guide_versions_read_available on public.guide_versions
for select to anon, authenticated using (
  status = 'published' or (
    status = 'draft' and exists (
      select 1 from public.tutorials t
      where t.id = guide_versions.tutorial_id
        and t.status = 'draft'
        and t.is_demo = true
    )
  )
);

drop policy if exists steps_read_published on public.steps;
create policy steps_read_available on public.steps
for select to anon, authenticated using (
  exists (
    select 1
    from public.guide_versions g
    join public.tutorials t on t.id = g.tutorial_id
    where g.id = steps.guide_version_id
      and (
        g.status = 'published' or
        (g.status = 'draft' and t.status = 'draft' and t.is_demo = true)
      )
  )
);

drop policy if exists media_assets_read_published on public.media_assets;
create policy media_assets_read_available on public.media_assets
for select to anon, authenticated using (
  contains_personal_data = false and (
    status = 'published' or (
      status = 'draft' and exists (
        select 1
        from public.step_media sm
        join public.steps s on s.id = sm.step_id
        join public.guide_versions g on g.id = s.guide_version_id
        join public.tutorials t on t.id = g.tutorial_id
        where sm.media_id = media_assets.id
          and g.status = 'draft'
          and t.status = 'draft'
          and t.is_demo = true
      )
    )
  )
);

drop policy if exists step_media_read_published on public.step_media;
create policy step_media_read_available on public.step_media
for select to anon, authenticated using (
  exists (
    select 1
    from public.steps s
    join public.guide_versions g on g.id = s.guide_version_id
    join public.tutorials t on t.id = g.tutorial_id
    where s.id = step_media.step_id
      and (
        g.status = 'published' or
        (g.status = 'draft' and t.status = 'draft' and t.is_demo = true)
      )
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guide-media',
  'guide-media',
  false,
  10485760,
  array['image/avif', 'image/webp', 'image/png', 'audio/mpeg']
)
on conflict (id) do nothing;

drop policy if exists guide_media_read_available on storage.objects;
create policy guide_media_read_available on storage.objects
for select to anon, authenticated using (
  bucket_id = 'guide-media' and exists (
    select 1
    from public.media_assets m
    where m.storage_bucket = storage.objects.bucket_id
      and m.storage_key = storage.objects.name
  )
);

commit;
