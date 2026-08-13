begin;

alter table public.profiles enable row level security;
alter table public.team_members enable row level security;
alter table public.categories enable row level security;
alter table public.applications enable row level security;
alter table public.tutorials enable row level security;
alter table public.tutorial_search_terms enable row level security;
alter table public.guide_versions enable row level security;
alter table public.steps enable row level security;
alter table public.media_assets enable row level security;
alter table public.step_media enable row level security;
alter table public.guide_reviews enable row level security;
alter table public.user_progress enable row level security;
alter table public.favorites enable row level security;
alter table public.guide_reports enable row level security;
alter table public.audit_logs enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.applications, public.tutorials,
  public.tutorial_search_terms, public.guide_versions, public.steps,
  public.media_assets, public.step_media to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_progress to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert on public.guide_reports to authenticated;

create policy profiles_select_own on public.profiles
for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
for update to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy categories_read_published on public.categories
for select to anon, authenticated using (
  exists (
    select 1 from public.tutorials t
    where t.category_id = categories.id and t.status = 'published'
  )
);

create policy applications_read_published on public.applications
for select to anon, authenticated using (status = 'published');

create policy tutorials_read_published on public.tutorials
for select to anon, authenticated using (status = 'published');

create policy tutorial_search_terms_read_published on public.tutorial_search_terms
for select to anon, authenticated using (
  exists (
    select 1 from public.tutorials t
    where t.id = tutorial_search_terms.tutorial_id and t.status = 'published'
  )
);

create policy guide_versions_read_published on public.guide_versions
for select to anon, authenticated using (status = 'published');

create policy steps_read_published on public.steps
for select to anon, authenticated using (
  exists (
    select 1 from public.guide_versions g
    where g.id = steps.guide_version_id and g.status = 'published'
  )
);

create policy media_assets_read_published on public.media_assets
for select to anon, authenticated using (
  status = 'published' and contains_personal_data = false
);

create policy step_media_read_published on public.step_media
for select to anon, authenticated using (
  exists (
    select 1
    from public.steps s
    join public.guide_versions g on g.id = s.guide_version_id
    join public.media_assets m on m.id = step_media.media_id
    where s.id = step_media.step_id
      and g.status = 'published'
      and m.status = 'published'
      and m.contains_personal_data = false
  )
);

create policy progress_select_own on public.user_progress
for select to authenticated using ((select auth.uid()) = user_id);
create policy progress_insert_own on public.user_progress
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy progress_update_own on public.user_progress
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy progress_delete_own on public.user_progress
for delete to authenticated using ((select auth.uid()) = user_id);

create policy favorites_select_own on public.favorites
for select to authenticated using ((select auth.uid()) = user_id);
create policy favorites_insert_own on public.favorites
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy favorites_delete_own on public.favorites
for delete to authenticated using ((select auth.uid()) = user_id);

create policy guide_reports_insert on public.guide_reports
for insert to authenticated with check ((select auth.uid()) = reporter_id);
create policy guide_reports_select_own on public.guide_reports
for select to authenticated using ((select auth.uid()) = reporter_id);

-- team_members, guide_reviews e audit_logs não recebem políticas públicas.
-- O backend administrativo usará uma role PostgreSQL própria e de menor privilégio,
-- criada por operação segura fora destas migrations. Nunca use service_role no navegador.

commit;
