-- Adds stable, public certificate URLs and removes direct anonymous write paths.
-- Apply through the normal Supabase migration workflow; this file does not modify remote state by itself.

alter table public.certificates add column if not exists slug text;

with numbered as (
  select id,
    trim(both '-' from regexp_replace(lower(coalesce(title, 'certificate')), '[^a-z0-9]+', '-', 'g')) as base_slug
  from public.certificates
), candidates as (
  select id, case when row_number() over (partition by base_slug order by id) = 1 then base_slug else base_slug || '-' || row_number() over (partition by base_slug order by id)::text end as slug
  from numbered
)
update public.certificates certificate set slug = candidates.slug
from candidates
where certificate.id = candidates.id and (certificate.slug is null or certificate.slug = '');

update public.certificates set slug = 'certificate-' || id::text where slug is null or slug = '';
alter table public.certificates alter column slug set not null;
create unique index if not exists certificates_slug_key on public.certificates (slug);

-- Public submissions use Edge Functions and service_role after validation,
-- moderation, and rate limiting. Revoke only anon DML: authenticated admin
-- clients retain their existing RLS-protected management path.
revoke insert, update, delete on public.visitor_comments from anon;
revoke insert, update, delete on public.visitor_comment_contacts from anon;
revoke insert, update, delete on public.comment_likes from anon, authenticated;
revoke insert, update, delete on public.contact_messages from anon;

drop policy if exists "public submit pending comments" on public.visitor_comments;
drop policy if exists "public submit comment contacts" on public.visitor_comment_contacts;
drop policy if exists "public insert likes" on public.comment_likes;

-- Keep public reads limited to approved comments; pending and hidden rows remain private.
drop policy if exists "public read approved comments" on public.visitor_comments;
drop policy if exists "public read visible guestbook comments" on public.visitor_comments;
create policy "public read approved comments" on public.visitor_comments
  for select to anon, authenticated using (status = 'approved');

grant select on public.visitor_comments to anon, authenticated;
grant select, insert, update, delete on public.visitor_comments to authenticated;
grant select, insert, update, delete on public.visitor_comment_contacts to authenticated;
grant select, insert, update, delete on public.contact_messages to authenticated;
grant select on public.comment_likes to authenticated;
grant all privileges on public.visitor_comments, public.visitor_comment_contacts, public.comment_likes, public.contact_messages to service_role;
