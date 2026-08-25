begin;

create table public.guide_access_stats (
  tutorial_id uuid primary key references public.tutorials(id) on delete cascade,
  access_count bigint not null default 0 check (access_count >= 0),
  last_accessed_at timestamptz not null default now()
);

alter table public.guide_access_stats enable row level security;
revoke all on table public.guide_access_stats from anon, authenticated;
grant select on table public.guide_access_stats to anon, authenticated;

create policy guide_access_stats_read_available on public.guide_access_stats
for select to anon, authenticated using (
  exists (
    select 1
    from public.tutorials tutorial
    where tutorial.id = guide_access_stats.tutorial_id
      and (
        tutorial.status = 'published' or
        (tutorial.status = 'draft' and tutorial.is_demo = true)
      )
  )
);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- A primeira abertura autenticada cria user_progress. O trigger agrega somente
-- esse início e não expõe identidade, etapas percorridas ou histórico pessoal.
create function private.increment_guide_access_on_progress()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tutorial_id uuid;
begin
  select guide.tutorial_id
    into target_tutorial_id
  from public.guide_versions guide
  where guide.id = new.guide_version_id;

  if target_tutorial_id is not null then
    insert into public.guide_access_stats (tutorial_id, access_count, last_accessed_at)
    values (target_tutorial_id, 1, now())
    on conflict (tutorial_id) do update
      set access_count = public.guide_access_stats.access_count + 1,
          last_accessed_at = excluded.last_accessed_at;
  end if;
  return new;
end;
$$;

revoke all on function private.increment_guide_access_on_progress() from public, anon, authenticated;

create trigger user_progress_increment_guide_access
after insert on public.user_progress
for each row execute function private.increment_guide_access_on_progress();

create index guide_access_stats_count_idx
  on public.guide_access_stats(access_count desc, last_accessed_at desc);

comment on table public.guide_access_stats is
  'Contagem agregada de usuários autenticados que iniciaram cada guia; não contém identidade.';

commit;
