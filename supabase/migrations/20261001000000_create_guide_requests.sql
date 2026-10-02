begin;

create table public.guide_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null check (char_length(prompt) between 3 and 1000),
  input_mode text not null check (input_mode in ('text', 'voice')),
  status text not null check (status in ('completed', 'error')),
  generated_guide jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (
    (status = 'completed' and generated_guide is not null and error_message is null)
    or (status = 'error' and error_message is not null)
  )
);

create index guide_requests_user_created_idx
  on public.guide_requests(user_id, created_at desc);

alter table public.guide_requests enable row level security;

revoke all on table public.guide_requests from anon;
grant select, insert on table public.guide_requests to authenticated;

create policy guide_requests_read_own
  on public.guide_requests
  for select
  to authenticated
  using (user_id = auth.uid());

create policy guide_requests_insert_own
  on public.guide_requests
  for insert
  to authenticated
  with check (user_id = auth.uid());

comment on table public.guide_requests is
  'Pedidos personalizados de guias; cada linha pertence somente ao usuário autenticado e não publica conteúdo no catálogo oficial.';

commit;
