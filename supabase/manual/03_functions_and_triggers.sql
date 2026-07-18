create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and active = true
  );
$$;

create or replace function public.public_approved_comments()
returns table (
  id uuid,
  name text,
  avatar text,
  message text,
  likes_count integer,
  admin_reply text,
  pinned boolean,
  created_at timestamptz
)
language sql
stable
security invoker
as $$
  select id, name, avatar, message, likes_count, admin_reply, pinned, created_at
  from public.visitor_comments
  where status = 'approved'
  order by pinned desc, created_at desc;
$$;

create or replace function public.sync_comment_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_comment_id uuid;
begin
  target_comment_id := coalesce(new.comment_id, old.comment_id);
  update public.visitor_comments
  set likes_count = (
    select count(*)::integer
    from public.comment_likes
    where comment_id = target_comment_id
  )
  where id = target_comment_id;
  return null;
end;
$$;

do $$ declare t text; begin
  foreach t in array array[
    'admin_users','site_profiles','site_settings','projects','technologies','creative_works',
    'experiences','certificates','visitor_comments','contact_messages','media_assets'
  ] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

drop trigger if exists comment_likes_insert_count on public.comment_likes;
create trigger comment_likes_insert_count after insert on public.comment_likes for each row execute function public.sync_comment_likes_count();

drop trigger if exists comment_likes_delete_count on public.comment_likes;
create trigger comment_likes_delete_count after delete on public.comment_likes for each row execute function public.sync_comment_likes_count();
