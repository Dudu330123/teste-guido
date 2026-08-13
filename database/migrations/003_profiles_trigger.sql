begin;

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, preferred_platform)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), 'Usuário'), 100),
    case
      when new.raw_user_meta_data ->> 'preferred_operating_system' = 'android'
        then 'android'::public.guido_platform
      when new.raw_user_meta_data ->> 'preferred_operating_system' = 'ios'
        then 'ios'::public.guido_platform
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

commit;

