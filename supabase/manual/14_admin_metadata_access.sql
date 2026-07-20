-- Run this if admin login works but CMS save actions are blocked by RLS.
-- The primary admin check remains public.admin_users. The app_metadata fallback
-- supports users provisioned with scripts/create-supabase-admin.mjs.

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
