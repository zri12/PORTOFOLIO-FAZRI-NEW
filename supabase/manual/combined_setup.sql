-- Combined setup for Supabase SQL Editor
-- Run this first, then run production_seed.sql

-- Source: supabase/migrations/202607180001_extensions_and_enums.sql
create extension if not exists citext with schema public;
create extension if not exists pgcrypto with schema public;

do $$ begin
  create type public.publish_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.admin_role as enum ('owner', 'admin', 'editor');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.technology_category as enum ('Frontend', 'Backend', 'Database', 'Deployment', 'Creative');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.technology_level as enum ('Main Stack', 'Frequently Used', 'Familiar', 'Currently Learning');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.creative_category as enum ('UI/UX Design', 'Graphic Design', 'Photography', 'Videography', 'Photo Editing', 'Video Editing');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.comment_status as enum ('pending', 'approved', 'hidden');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.message_status as enum ('New', 'Read', 'Replied', 'Archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.client_type as enum ('Academic Project', 'Client Work', 'Personal Project');
exception when duplicate_object then null;
end $$;

-- Source: supabase/migrations/202607180002_schema.sql
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username public.citext unique not null check (length(trim(username::text)) > 0),
  display_name text not null check (length(trim(display_name)) > 0),
  role public.admin_role not null default 'owner',
  active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_profiles (
  id uuid primary key default gen_random_uuid(),
  singleton_key text unique not null default 'main' check (singleton_key = 'main'),
  full_name text not null,
  display_name text not null,
  title text not null,
  greeting text not null,
  headline text not null,
  description text not null,
  biography text not null,
  about_content text not null,
  email text not null,
  whatsapp text not null,
  location text not null,
  availability text not null,
  github_url text,
  linkedin_url text,
  instagram_url text,
  youtube_url text,
  tiktok_url text,
  cv_path text,
  profile_image_path text,
  professional_character_path text,
  spider_character_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key text unique not null default 'main' check (singleton_key = 'main'),
  website_name text not null,
  description text not null,
  language text not null default 'en',
  copyright text not null,
  default_mode text not null default 'professional' check (default_mode in ('professional', 'spider')),
  smooth_scroll boolean not null default true,
  splash_enabled boolean not null default true,
  three_enabled boolean not null default true,
  comments_enabled boolean not null default true,
  contact_enabled boolean not null default true,
  seo_title text not null,
  seo_description text not null,
  keywords text not null,
  navigation_settings jsonb not null default '{}'::jsonb check (jsonb_typeof(navigation_settings) = 'object'),
  section_settings jsonb not null default '{}'::jsonb check (jsonb_typeof(section_settings) = 'object'),
  professional_settings jsonb not null default '{}'::jsonb check (jsonb_typeof(professional_settings) = 'object'),
  spider_settings jsonb not null default '{}'::jsonb check (jsonb_typeof(spider_settings) = 'object'),
  animation_settings jsonb not null default '{}'::jsonb check (jsonb_typeof(animation_settings) = 'object'),
  social_preview_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug public.citext unique not null check (length(trim(slug::text)) > 0),
  title text not null check (length(trim(title)) > 0),
  full_name text not null,
  category text not null,
  project_type text not null,
  role text not null,
  year text not null,
  status public.publish_status not null default 'draft',
  featured boolean not null default false,
  client_type public.client_type not null,
  short_description text not null,
  full_description text not null,
  overview text not null,
  background text not null,
  solution text not null,
  architecture text not null,
  data_structure text not null,
  testing text not null,
  deployment text not null,
  result text not null,
  live_url text,
  source_url text,
  cover_path text,
  hero_path text,
  mobile_preview_path text,
  video_url text,
  objectives jsonb not null default '[]'::jsonb check (jsonb_typeof(objectives) = 'array'),
  target_users jsonb not null default '[]'::jsonb check (jsonb_typeof(target_users) = 'array'),
  responsibilities jsonb not null default '[]'::jsonb check (jsonb_typeof(responsibilities) = 'array'),
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  process jsonb not null default '[]'::jsonb check (jsonb_typeof(process) = 'array'),
  gallery jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery) = 'array'),
  challenges jsonb not null default '[]'::jsonb check (jsonb_typeof(challenges) = 'array'),
  decisions jsonb not null default '[]'::jsonb check (jsonb_typeof(decisions) = 'array'),
  display_order integer not null default 0 check (display_order >= 0),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (role, organization, period)
);

create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  name public.citext unique not null check (length(trim(name::text)) > 0),
  icon_key text not null,
  category public.technology_category not null,
  level public.technology_level not null,
  description text not null,
  website_url text,
  featured boolean not null default false,
  active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (title, issuer)
);

create table if not exists public.project_technologies (
  project_id uuid not null references public.projects(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete restrict,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  primary key (project_id, technology_id)
);

create table if not exists public.creative_works (
  id uuid primary key default gen_random_uuid(),
  slug public.citext unique not null check (length(trim(slug::text)) > 0),
  title text not null,
  category public.creative_category not null,
  role text not null,
  client text,
  year text not null,
  description text not null,
  brief text not null,
  cover_path text,
  before_image_path text,
  after_image_path text,
  video_url text,
  duration text,
  tools jsonb not null default '[]'::jsonb check (jsonb_typeof(tools) = 'array'),
  gallery jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery) = 'array'),
  featured boolean not null default false,
  status public.publish_status not null default 'draft',
  display_order integer not null default 0 check (display_order >= 0),
  seo_title text,
  seo_description text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  organization text not null,
  experience_type text not null,
  period text not null,
  location text not null,
  description text not null,
  responsibilities jsonb not null default '[]'::jsonb check (jsonb_typeof(responsibilities) = 'array'),
  technologies jsonb not null default '[]'::jsonb check (jsonb_typeof(technologies) = 'array'),
  related_project_id uuid references public.projects(id) on delete set null,
  published boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  category text not null,
  issue_date date,
  credential_id text,
  credential_url text,
  image_path text,
  featured boolean not null default false,
  published boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visitor_comments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text,
  message text not null check (length(trim(message)) between 5 and 500),
  likes_count integer not null default 0 check (likes_count >= 0),
  admin_reply text,
  pinned boolean not null default false,
  status public.comment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  unique (name, message, created_at)
);

create table if not exists public.visitor_comment_contacts (
  comment_id uuid primary key references public.visitor_comments(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.visitor_comments(id) on delete cascade,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  unique (comment_id, visitor_id)
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  whatsapp text,
  project_type text not null,
  budget_range text not null,
  subject text not null,
  message text not null check (length(trim(message)) >= 10),
  status public.message_status not null default 'New',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, subject, created_at)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null,
  object_path text not null,
  name text not null,
  media_type text not null,
  mime_type text not null,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  width integer,
  height integer,
  alt text,
  notes text,
  public boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket_id, object_path)
);

create table if not exists public.submission_rate_limits (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  action text not null,
  window_start timestamptz not null default now(),
  attempts integer not null default 1 check (attempts >= 0),
  unique (identifier, action)
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists projects_slug_idx on public.projects (slug);
create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_featured_idx on public.projects (featured);
create index if not exists projects_category_idx on public.projects (category);
create index if not exists projects_display_order_idx on public.projects (display_order);
create index if not exists projects_year_idx on public.projects (year);
create index if not exists projects_status_order_idx on public.projects (status, display_order);
create index if not exists technologies_active_idx on public.technologies (active);
create index if not exists technologies_category_idx on public.technologies (category);
create index if not exists technologies_level_idx on public.technologies (level);
create index if not exists technologies_display_order_idx on public.technologies (display_order);
create index if not exists project_technologies_project_id_idx on public.project_technologies (project_id);
create index if not exists project_technologies_technology_id_idx on public.project_technologies (technology_id);
create index if not exists creative_works_slug_idx on public.creative_works (slug);
create index if not exists creative_works_status_idx on public.creative_works (status);
create index if not exists creative_works_category_idx on public.creative_works (category);
create index if not exists creative_works_featured_idx on public.creative_works (featured);
create index if not exists creative_works_display_order_idx on public.creative_works (display_order);
create index if not exists experiences_published_idx on public.experiences (published);
create index if not exists experiences_display_order_idx on public.experiences (display_order);
create index if not exists certificates_published_idx on public.certificates (published);
create index if not exists certificates_featured_idx on public.certificates (featured);
create index if not exists certificates_issue_date_idx on public.certificates (issue_date);
create index if not exists certificates_display_order_idx on public.certificates (display_order);
create index if not exists visitor_comments_status_idx on public.visitor_comments (status);
create index if not exists visitor_comments_pinned_idx on public.visitor_comments (pinned);
create index if not exists visitor_comments_created_at_idx on public.visitor_comments (created_at desc);
create index if not exists contact_messages_status_idx on public.contact_messages (status);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists media_assets_bucket_id_idx on public.media_assets (bucket_id);
create index if not exists media_assets_media_type_idx on public.media_assets (media_type);
create index if not exists media_assets_created_at_idx on public.media_assets (created_at desc);
create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_actor_id_idx on public.activity_logs (actor_id);
create index if not exists activity_logs_entity_type_idx on public.activity_logs (entity_type);

comment on table public.admin_users is 'Authorized portfolio CMS users mapped to Supabase Auth users.';
comment on table public.visitor_comment_contacts is 'Private visitor emails for comments. Never expose to public clients.';
comment on table public.submission_rate_limits is 'Simple server-side rate limiting state used by Edge Functions.';

-- Source: supabase/migrations/202607180003_functions_and_triggers.sql
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

-- Source: supabase/migrations/202607180004_rls_and_grants.sql
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
grant select on public.site_profiles, public.site_settings, public.projects, public.technologies, public.project_technologies, public.creative_works, public.experiences, public.certificates, public.visitor_comments, public.media_assets to anon, authenticated;
grant execute on function public.public_approved_comments() to anon, authenticated;

-- Source: supabase/migrations/202607180005_storage.sql
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

-- Source: supabase/migrations/202607180006_realtime.sql
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'projects',
    'technologies',
    'project_technologies',
    'creative_works',
    'experiences',
    'certificates',
    'visitor_comments',
    'contact_messages',
    'site_profiles',
    'site_settings'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    exception
      when duplicate_object then null;
      when undefined_object then null;
    end;
  end loop;
end $$;

