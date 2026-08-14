begin;

-- As políticas existentes de tabela e Storage chamam esta função. Restringi-la
-- centralmente impede que um papel inferior contorne a interface e publique
-- diretamente pelas APIs do Supabase.
create or replace function public.is_active_guide_publisher()
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
      and member.role = 'superadmin'
  );
$$;

comment on function public.is_active_guide_publisher() is
  'Confirma se a sessão pertence a um superadministrador ativo autorizado a publicar imagens.';

commit;
