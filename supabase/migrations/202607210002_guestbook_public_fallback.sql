drop policy if exists "public read approved comments" on public.visitor_comments;
drop policy if exists "public read visible guestbook comments" on public.visitor_comments;
drop policy if exists "public submit pending comments" on public.visitor_comments;
drop policy if exists "public submit comment contacts" on public.visitor_comment_contacts;

alter table public.visitor_comments
add column if not exists parent_comment_id uuid references public.visitor_comments(id) on delete set null;

create index if not exists visitor_comments_parent_comment_id_idx
on public.visitor_comments (parent_comment_id);

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

create or replace function public.public_like_comment(target_comment_id uuid, target_visitor_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_likes integer;
begin
  if target_comment_id is null or target_visitor_id is null then
    raise exception 'Missing comment or visitor ID.';
  end if;

  insert into public.comment_likes (comment_id, visitor_id)
  values (target_comment_id, target_visitor_id)
  on conflict (comment_id, visitor_id) do nothing;

  select likes_count into next_likes
  from public.visitor_comments
  where id = target_comment_id;

  return coalesce(next_likes, 0);
end;
$$;

grant execute on function public.public_like_comment(uuid, uuid) to anon, authenticated;
