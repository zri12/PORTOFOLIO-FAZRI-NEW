-- Run this on an existing Supabase project if admin login succeeds in Auth
-- but the CMS shows "Login failed" or later cannot save content.

create policy if not exists "admin read own admin account"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create policy if not exists "admin update own login timestamp"
on public.admin_users
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, update on public.admin_users to authenticated;

grant insert, update, delete on
  public.site_profiles,
  public.site_settings,
  public.projects,
  public.technologies,
  public.project_technologies,
  public.creative_works,
  public.experiences,
  public.certificates,
  public.visitor_comments,
  public.visitor_comment_contacts,
  public.comment_likes,
  public.contact_messages,
  public.media_assets
to authenticated;
