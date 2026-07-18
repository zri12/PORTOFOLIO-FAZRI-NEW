-- Storage setup only for Supabase SQL Editor

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portfolio-public', 'portfolio-public', true, 10485760, array['image/png','image/jpeg','image/webp','image/gif','application/pdf','video/mp4']),
  ('portfolio-private', 'portfolio-private', false, 10485760, array['image/png','image/jpeg','image/webp','application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read public portfolio assets" on storage.objects;
create policy "Public can read public portfolio assets"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-public');

drop policy if exists "Admins can upload portfolio assets" on storage.objects;
create policy "Admins can upload portfolio assets"
on storage.objects for insert
to authenticated
with check (bucket_id in ('portfolio-public', 'portfolio-private') and public.is_active_admin());

drop policy if exists "Admins can update portfolio assets" on storage.objects;
create policy "Admins can update portfolio assets"
on storage.objects for update
to authenticated
using (bucket_id in ('portfolio-public', 'portfolio-private') and public.is_active_admin())
with check (bucket_id in ('portfolio-public', 'portfolio-private') and public.is_active_admin());

drop policy if exists "Admins can delete portfolio assets" on storage.objects;
create policy "Admins can delete portfolio assets"
on storage.objects for delete
to authenticated
using (bucket_id in ('portfolio-public', 'portfolio-private') and public.is_active_admin());
