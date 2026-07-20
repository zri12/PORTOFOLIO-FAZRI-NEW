create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.uid() is not null and (
    exists (
      select 1
      from public.admin_users
      where user_id = auth.uid()
        and active = true
    )
    or (auth.jwt() -> 'app_metadata' ->> 'role') in ('owner', 'admin')
  ), false);
$$;
