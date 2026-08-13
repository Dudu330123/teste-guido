begin;

comment on function public.handle_new_auth_user() is
  'Função interna do trigger auth.users; execução direta pela Data API é revogada.';

commit;
