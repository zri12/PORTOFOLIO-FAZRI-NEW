drop policy if exists "public read approved comments" on public.visitor_comments;
drop policy if exists "public read visible guestbook comments" on public.visitor_comments;
drop policy if exists "public submit pending comments" on public.visitor_comments;
drop policy if exists "public submit comment contacts" on public.visitor_comment_contacts;

create policy "public read visible guestbook comments" on public.visitor_comments
for select to anon, authenticated
using (status in ('approved', 'pending'));

create policy "public submit pending comments" on public.visitor_comments
for insert to anon, authenticated
with check (
  status = 'pending'
  and likes_count = 0
  and pinned = false
  and admin_reply is null
  and approved_at is null
  and approved_by is null
);

create policy "public submit comment contacts" on public.visitor_comment_contacts
for insert to anon, authenticated
with check (
  exists (
    select 1
    from public.visitor_comments c
    where c.id = comment_id
      and c.status = 'pending'
  )
);

grant insert on public.visitor_comments to anon, authenticated;
grant insert on public.visitor_comment_contacts to anon, authenticated;
grant insert on public.comment_likes to anon, authenticated;
