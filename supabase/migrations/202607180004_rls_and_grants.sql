alter table public.admin_users enable row level security;
alter table public.site_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.projects enable row level security;
alter table public.technologies enable row level security;
alter table public.project_technologies enable row level security;
alter table public.creative_works enable row level security;
alter table public.experiences enable row level security;
alter table public.certificates enable row level security;
alter table public.visitor_comments enable row level security;
alter table public.visitor_comment_contacts enable row level security;
alter table public.comment_likes enable row level security;
alter table public.contact_messages enable row level security;
alter table public.media_assets enable row level security;
alter table public.submission_rate_limits enable row level security;
alter table public.activity_logs enable row level security;

do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

create policy "public read singleton profile" on public.site_profiles for select to anon, authenticated using (true);
create policy "admin manage singleton profile" on public.site_profiles for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "public read singleton settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admin manage singleton settings" on public.site_settings for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "public read published projects" on public.projects for select to anon, authenticated using (status = 'published');
create policy "admin manage projects" on public.projects for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "public read active technologies" on public.technologies for select to anon, authenticated using (active = true);
create policy "admin manage technologies" on public.technologies for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "public read published project technologies" on public.project_technologies for select to anon, authenticated using (
  exists (select 1 from public.projects p where p.id = project_id and p.status = 'published')
);
create policy "admin manage project technologies" on public.project_technologies for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "public read published creative works" on public.creative_works for select to anon, authenticated using (status = 'published');
create policy "admin manage creative works" on public.creative_works for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "public read published experiences" on public.experiences for select to anon, authenticated using (published = true);
create policy "admin manage experiences" on public.experiences for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "public read published certificates" on public.certificates for select to anon, authenticated using (published = true);
create policy "admin manage certificates" on public.certificates for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "public read approved comments" on public.visitor_comments for select to anon, authenticated using (status = 'approved');
create policy "admin manage visitor comments" on public.visitor_comments for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "admin manage comment contacts" on public.visitor_comment_contacts for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "public insert likes" on public.comment_likes for insert to anon, authenticated with check (
  exists (select 1 from public.visitor_comments c where c.id = comment_id and c.status = 'approved')
);
create policy "admin read likes" on public.comment_likes for select to authenticated using (public.is_active_admin());

create policy "admin manage contact messages" on public.contact_messages for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "public read public media" on public.media_assets for select to anon, authenticated using (public = true);
create policy "admin manage media" on public.media_assets for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "service role manages rate limits" on public.submission_rate_limits for all to service_role using (true) with check (true);
create policy "admin read activity logs" on public.activity_logs for select to authenticated using (public.is_active_admin());

grant usage on schema public to anon, authenticated;
grant usage on schema public to service_role;
grant select on public.site_profiles, public.site_settings, public.projects, public.technologies, public.project_technologies, public.creative_works, public.experiences, public.certificates, public.visitor_comments, public.media_assets to anon, authenticated;
grant all privileges on all tables in schema public to service_role;
grant execute on function public.public_approved_comments() to anon, authenticated;
