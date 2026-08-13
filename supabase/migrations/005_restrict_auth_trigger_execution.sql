begin;

-- Esta função existe somente para o trigger de auth.users. Impedir chamadas RPC
-- diretas evita que papéis da Data API executem código com privilégios elevados.
revoke all on function public.handle_new_auth_user() from public;
revoke all on function public.handle_new_auth_user() from anon;
revoke all on function public.handle_new_auth_user() from authenticated;

commit;
