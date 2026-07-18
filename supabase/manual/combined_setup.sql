-- ============================================================
-- 01_extensions_and_enums.sql
-- ============================================================

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



-- ============================================================
-- 02_tables_and_indexes.sql
-- ============================================================

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
  logo_path text,
  favicon_path text,
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
  related_project_slug text,
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
  updated_at timestamptz not null default now()
);

create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  name public.citext unique not null check (length(trim(name::text)) > 0),
  icon_key text not null,
  logo_path text,
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
  updated_at timestamptz not null default now()
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
  updated_at timestamptz not null default now(),
  unique (role, organization, period)
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
  updated_at timestamptz not null default now(),
  unique (title, issuer)
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



-- ============================================================
-- 03_functions_and_triggers.sql
-- ============================================================

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



-- ============================================================
-- 04_policies_and_grants.sql
-- ============================================================

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



-- ============================================================
-- 05_storage_buckets_and_policies.sql
-- ============================================================

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



-- ============================================================
-- 06_realtime.sql
-- ============================================================

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



-- ============================================================
-- 07_production_seed.sql
-- ============================================================

insert into public.site_profiles (
  singleton_key, full_name, display_name, title, greeting, headline, description, biography, about_content,
  email, whatsapp, location, availability, github_url, linkedin_url, instagram_url, youtube_url, tiktok_url, cv_path,
  logo_path, favicon_path, profile_image_path, professional_character_path, spider_character_path
) values (
  'main',
  'Fazri Lukman Nurrohman',
  'Fazri',
  'Creative Web Developer',
  'Hello, I''m Fazri.',
  'I create modern web applications and interactive experiences that combine reliable functionality with thoughtful visual design.',
  'Web development is my main focus, supported by UI design, photography, videography, and visual editing.',
  'A Creative Web Developer who enjoys turning ambiguous ideas into clear, useful, and visually considered web experiences.',
  'My work blends web development with interface design, photography, videography, and visual editing so each product works clearly and communicates well.',
  'hello@fazri.dev',
  '+62 812 0000 0000',
  'Indonesia',
  'Available for selected projects',
  'https://github.com/fazrilukman',
  'https://www.linkedin.com/in/fazrilukman',
  'https://instagram.com/fazrilukman',
  'https://youtube.com/@fazrilukman',
  'https://tiktok.com/@fazrilukman',
  '/cv-fazri-lukman.pdf',
  null,
  null,
  'seed/fazri.png',
  'seed/character-professional.png',
  'seed/character-spider.png'
) on conflict (singleton_key) do update set
  full_name = excluded.full_name,
  display_name = excluded.display_name,
  title = excluded.title,
  greeting = excluded.greeting,
  headline = excluded.headline,
  description = excluded.description,
  biography = excluded.biography,
  about_content = excluded.about_content,
  email = excluded.email,
  whatsapp = excluded.whatsapp,
  location = excluded.location,
  availability = excluded.availability,
  github_url = excluded.github_url,
  linkedin_url = excluded.linkedin_url,
  instagram_url = excluded.instagram_url,
  youtube_url = excluded.youtube_url,
  tiktok_url = excluded.tiktok_url,
  cv_path = excluded.cv_path,
  logo_path = excluded.logo_path,
  favicon_path = excluded.favicon_path,
  profile_image_path = excluded.profile_image_path,
  professional_character_path = excluded.professional_character_path,
  spider_character_path = excluded.spider_character_path;

insert into public.site_settings (
  singleton_key, website_name, description, language, copyright, default_mode, smooth_scroll, splash_enabled,
  three_enabled, comments_enabled, contact_enabled, seo_title, seo_description, keywords
) values (
  'main',
  'Fazri Portfolio',
  'Creative Web Developer portfolio for web applications, interface design, and visual storytelling.',
  'en',
  'Fazri Lukman Nurrohman. All rights reserved.',
  'professional',
  true,
  true,
  true,
  true,
  true,
  'Fazri Lukman Nurrohman - Creative Web Developer',
  'Portfolio of Fazri Lukman Nurrohman, a Creative Web Developer focused on modern web applications and visual digital experiences.',
  'web developer, portfolio, React, Laravel, UI design, Indonesia'
) on conflict (singleton_key) do update set
  website_name = excluded.website_name,
  description = excluded.description,
  language = excluded.language,
  copyright = excluded.copyright,
  default_mode = excluded.default_mode,
  smooth_scroll = excluded.smooth_scroll,
  splash_enabled = excluded.splash_enabled,
  three_enabled = excluded.three_enabled,
  comments_enabled = excluded.comments_enabled,
  contact_enabled = excluded.contact_enabled,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  keywords = excluded.keywords;

with rows(slug, title, full_name, category, project_type, role, year, status, featured, client_type, short_description, full_description, overview, background, solution, architecture, data_structure, live_url, source_url, display_order) as (
  values
  ('sinden','SINDEN','Student Evaluation and Monitoring System','Education','Web Application','Full-Stack Web Developer','2023','published'::public.publish_status,true,'Academic Project'::public.client_type,'Student evaluation and monitoring system with role-based dashboards and analytical tools.','A platform for tracking grades, attendance, and behavioral notes across a school environment.','SINDEN focuses on academic visibility: turning scattered student records into structured, accessible dashboards.','Evaluation data was difficult to review when stored across manual sheets and separate communication channels.','The interface centralizes student data, role-based views, reporting modules, and clear review workflows.','Single-page frontend, authenticated dashboard shell, service layer prepared for Supabase data access.','Students, classes, evaluations, attendance records, behavior notes, and user roles.','https://fazri.dev/projects/sinden','https://github.com/fazrilukman/sinden',1),
  ('so-harmony','SO Harmony','Mess Monitoring System','Dashboard','Operations Dashboard','Full-Stack Web Developer','2023','published',true,'Client Work','Monitoring system for occupancy, maintenance complaints, and room status workflows.','An operational dashboard for lodging facilities with room tracking and maintenance coordination.','SO Harmony organizes daily operational signals into a dashboard that staff can scan quickly.','Manual room status updates created delays between occupancy, housekeeping, and maintenance decisions.','A clear interface for room state, complaint handling, checklists, and historical activity.','Laravel application with relational data model and modular dashboard screens.','Rooms, occupants, complaints, maintenance status, staff notes, and activity logs.','https://fazri.dev/projects/so-harmony','https://github.com/fazrilukman/so-harmony',2),
  ('sumut-cluster','SumutCluster','Tourism Clustering and Recommendation Platform','Data Mining','Recommendation Platform','Web Developer and Data Integration','2024','published',true,'Academic Project','Data mining platform visualizing tourism trends and destination recommendations.','A tourism analysis interface supported by K-Means clustering and interactive destination views.','SumutCluster presents tourism data in a way that helps users compare destination potential.','Tourism records needed clearer grouping and presentation for exploration and recommendation use cases.','The frontend translates clustering results into searchable cards, map-like visuals, and recommendation details.','Next.js frontend prepared to consume Python-generated clustering output and Supabase records.','Destinations, categories, visitor indicators, cluster labels, recommendation metadata.','https://fazri.dev/projects/sumut-cluster','https://github.com/fazrilukman/sumut-cluster',3),
  ('sm-v-lab-ipa','SM V-Lab IPA','Interactive Science Learning Platform','Education','Learning Platform','Web Developer','2022','published',false,'Academic Project','Virtual laboratory platform for interactive science experiments and learning modules.','A remote learning tool with modules, grading support, and teacher oversight.','SM V-Lab IPA makes science practice more accessible when physical lab access is limited.','Remote learning created a gap between theory and hands-on science activities.','Interactive modules, guided activities, and teacher review screens support practical learning online.','Laravel-based application with PWA-friendly frontend patterns.','Modules, experiments, questions, submissions, scores, and teacher feedback.','https://fazri.dev/projects/sm-v-lab-ipa','https://github.com/fazrilukman/sm-v-lab-ipa',4),
  ('marketing-crm','Marketing CRM','Travel Marketing Management System','CRM','Web Application','Web Developer','2023','published',false,'Client Work','Custom CRM for lead generation, follow-up scheduling, and campaign visibility.','A customer relationship management prototype tailored for a travel marketing pipeline.','Marketing CRM helps staff track prospects and follow-up responsibilities in one workspace.','Follow-up notes and lead status were hard to maintain when spread across messaging and spreadsheets.','Pipeline boards, lead profiles, reminders, and campaign views make relationship work easier to manage.','MERN-style frontend and API structure prepared for CRM workflows.','Leads, pipelines, notes, tasks, campaigns, and user assignments.','https://fazri.dev/projects/marketing-crm','https://github.com/fazrilukman/marketing-crm',5),
  ('sistem-cuti-skm','Sistem Cuti SKM Mill','Employee and Leave Management System','Dashboard','Employee Management','Web Developer','2022','published',false,'Client Work','Internal HR tool for leave balances, approval flows, and workforce scheduling.','A focused employee leave management system replacing paper-based request workflows.','The system keeps leave requests visible and reviewable for employees and HR administrators.','Paper forms made leave tracking slow, repetitive, and difficult to audit.','Digital request forms, approval states, and calendar-style views streamline the HR process.','Classic PHP application with Bootstrap interface and MySQL persistence.','Employees, leave quotas, requests, approval steps, schedules, and departments.','https://fazri.dev/projects/sistem-cuti-skm','https://github.com/fazrilukman/sistem-cuti-skm',6)
)
insert into public.projects (
  slug, title, full_name, category, project_type, role, year, status, featured, client_type, short_description, full_description,
  overview, background, solution, architecture, data_structure, live_url, source_url, display_order,
  objectives, target_users, responsibilities, features, process, gallery, challenges, decisions, testing, deployment, result
)
select slug, title, full_name, category, project_type, role, year, status, featured, client_type, short_description, full_description,
  overview, background, solution, architecture, data_structure, live_url, source_url, display_order,
  '["Reduce manual reporting","Clarify user workflows","Make data easier to review","Support responsive access"]'::jsonb,
  '["Administrators","Staff operators","Managers","Students or clients depending on context"]'::jsonb,
  '["Interface planning","Frontend implementation","Database integration planning","Testing and deployment preparation"]'::jsonb,
  '["Role-based dashboard","Structured data views","Search and filtering","Responsive interface","Export-ready reporting"]'::jsonb,
  '["Discovery","Information architecture","Wireframe","Interface system","Implementation","Integration","Testing","Deployment"]'::jsonb,
  '[]'::jsonb,
  '["Balancing dense information with readable layouts","Keeping navigation clear across roles","Maintaining visual consistency on smaller screens"]'::jsonb,
  '["Use card density only where scanning matters","Prefer predictable tables for operational data","Keep public and admin flows visually distinct"]'::jsonb,
  'Tested through form validation, responsive checks, route checks, and common user task walkthroughs.',
  'Prepared for static frontend deployment with future backend integration points.',
  'A clearer frontend experience that communicates system purpose without relying on exaggerated metrics.'
from rows
on conflict (slug) do update set
  title = excluded.title,
  full_name = excluded.full_name,
  category = excluded.category,
  project_type = excluded.project_type,
  role = excluded.role,
  year = excluded.year,
  status = excluded.status,
  featured = excluded.featured,
  client_type = excluded.client_type,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  overview = excluded.overview,
  background = excluded.background,
  solution = excluded.solution,
  architecture = excluded.architecture,
  data_structure = excluded.data_structure,
  live_url = excluded.live_url,
  source_url = excluded.source_url,
  display_order = excluded.display_order;

with rows(name, icon_key, category, level, description, featured, active, display_order) as (
  values
  ('HTML5','html5','Frontend'::public.technology_category,'Main Stack'::public.technology_level,'HTML5 for responsive web interfaces.',true,true,1),
  ('CSS3','css3','Frontend','Main Stack','CSS3 for responsive web interfaces.',true,true,2),
  ('JavaScript','javascript','Frontend','Main Stack','JavaScript for responsive web interfaces.',true,true,3),
  ('TypeScript','typescript','Frontend','Main Stack','TypeScript for responsive web interfaces.',true,true,4),
  ('React','react','Frontend','Main Stack','React for responsive web interfaces.',true,true,5),
  ('Vite','vite','Frontend','Frequently Used','Vite for responsive web interfaces.',true,true,6),
  ('Next.js','nextjs','Frontend','Frequently Used','Next.js for responsive web interfaces.',false,true,7),
  ('Tailwind CSS','tailwindcss','Frontend','Frequently Used','Tailwind CSS for responsive web interfaces.',false,true,8),
  ('Bootstrap','bootstrap','Frontend','Frequently Used','Bootstrap for responsive web interfaces.',false,true,9),
  ('Laravel','laravel','Backend','Frequently Used','Laravel for server-side application work.',true,true,20),
  ('PHP','php','Backend','Frequently Used','PHP for server-side application work.',true,true,21),
  ('Node.js','nodejs','Backend','Familiar','Node.js for server-side application work.',false,true,22),
  ('Express','express','Backend','Familiar','Express for server-side application work.',false,true,23),
  ('MySQL','mysql','Database','Frequently Used','MySQL for structured application data.',true,true,40),
  ('PostgreSQL','postgresql','Database','Frequently Used','PostgreSQL for structured application data.',true,true,41),
  ('Supabase','supabase','Database','Frequently Used','Supabase for structured application data.',true,true,42),
  ('Firebase','firebase','Database','Familiar','Firebase for structured application data.',false,true,43),
  ('SQLite','sqlite','Database','Familiar','SQLite for structured application data.',false,true,44),
  ('Git','git','Deployment','Frequently Used','Git for delivery and local workflow.',true,true,60),
  ('GitHub','github','Deployment','Frequently Used','GitHub for delivery and local workflow.',true,true,61),
  ('Vercel','vercel','Deployment','Frequently Used','Vercel for delivery and local workflow.',true,true,62),
  ('cPanel','cpanel','Deployment','Familiar','cPanel for delivery and local workflow.',false,true,63),
  ('XAMPP','xampp','Deployment','Familiar','XAMPP for delivery and local workflow.',false,true,64),
  ('Figma','figma','Creative','Frequently Used','Figma supports visual production and storytelling.',true,true,80),
  ('Canva','canva','Creative','Frequently Used','Canva supports visual production and storytelling.',true,true,81),
  ('Photoshop','photoshop','Creative','Frequently Used','Photoshop supports visual production and storytelling.',true,true,82),
  ('Illustrator','illustrator','Creative','Frequently Used','Illustrator supports visual production and storytelling.',true,true,83),
  ('Premiere Pro','premierepro','Creative','Frequently Used','Premiere Pro supports visual production and storytelling.',true,true,84),
  ('After Effects','aftereffects','Creative','Familiar','After Effects supports visual production and storytelling.',false,true,85),
  ('Lightroom','lightroom','Creative','Familiar','Lightroom supports visual production and storytelling.',false,true,86),
  ('CapCut','capcut','Creative','Familiar','CapCut supports visual production and storytelling.',false,true,87),
  ('Blender','blender','Creative','Familiar','Blender supports visual production and storytelling.',false,true,88),
  ('OBS','obs','Creative','Familiar','OBS supports visual production and storytelling.',false,true,89)
)
insert into public.technologies (name, icon_key, category, level, description, featured, active, display_order)
select * from rows
on conflict (name) do update set
  icon_key = excluded.icon_key,
  category = excluded.category,
  level = excluded.level,
  description = excluded.description,
  featured = excluded.featured,
  active = excluded.active,
  display_order = excluded.display_order;

delete from public.project_technologies pt
using public.projects p
where pt.project_id = p.id
  and p.slug in ('sinden', 'so-harmony', 'sumut-cluster', 'sm-v-lab-ipa', 'marketing-crm', 'portfolio-website');
insert into public.project_technologies (project_id, technology_id, display_order)
select p.id, t.id, relation.display_order
from (
  values
  ('sinden','React',1),('sinden','Vite',2),('sinden','Supabase',3),('sinden','Tailwind CSS',4),
  ('so-harmony','Laravel',1),('so-harmony','MySQL',2),('so-harmony','Tailwind CSS',3),('so-harmony','JavaScript',4),
  ('sumut-cluster','Next.js',1),('sumut-cluster','Supabase',2),('sumut-cluster','Tailwind CSS',3),
  ('sm-v-lab-ipa','Laravel',1),('sm-v-lab-ipa','MySQL',2),('sm-v-lab-ipa','JavaScript',3),
  ('marketing-crm','React',1),('marketing-crm','Node.js',2),('marketing-crm','Express',3),
  ('sistem-cuti-skm','PHP',1),('sistem-cuti-skm','Bootstrap',2),('sistem-cuti-skm','MySQL',3)
) as relation(project_slug, tech_name, display_order)
join public.projects p on p.slug = relation.project_slug
join public.technologies t on t.name = relation.tech_name
on conflict (project_id, technology_id) do update set display_order = excluded.display_order;

insert into public.creative_works (slug, title, category, role, year, tools, description, brief, featured, status, display_order)
values
('product-interface-studies','Product Interface Studies','UI/UX Design','UI Designer','2024','["Figma","React"]','Interface explorations for dashboards and product workflows.','Create clear visual hierarchy for data-heavy screens.',true,'published',1),
('visual-brand-moments','Visual Brand Moments','Graphic Design','Visual Designer','2023','["Canva","Photoshop"]','Social and campaign visuals with consistent layout language.','Build reusable promotional layouts.',true,'published',2),
('light-place-people','Light, Place, and People','Photography','Photographer','2024','["Lightroom","Photoshop"]','Photography practice focused on atmosphere and human context.','Capture readable moments with restrained editing.',false,'published',3),
('frame-in-motion','A Frame in Motion','Videography','Video Editor','2023','["Premiere Pro","CapCut"]','Short-form visual sequences with clean rhythm and story structure.','Translate event footage into a concise narrative.',false,'published',4)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  role = excluded.role,
  year = excluded.year,
  tools = excluded.tools,
  description = excluded.description,
  brief = excluded.brief,
  featured = excluded.featured,
  status = excluded.status,
  display_order = excluded.display_order;

insert into public.experiences (role, organization, experience_type, period, location, description, responsibilities, technologies, related_project_id, published, display_order)
values
('Creative Web Developer','Independent & client collaborations','Freelance','2024 - Present','Indonesia','Building useful platforms, interfaces, and visual experiences with strong implementation focus.','["Plan interfaces","Build responsive frontends","Prepare project documentation"]','["React","Tailwind CSS","Figma"]',(select id from public.projects where slug = 'sumut-cluster'),true,1),
('Web Development Projects','Academic and client work','Project-based','2023 - 2024','Medan','Shipped dashboards, operational systems, and data-focused web applications.','["Develop dashboards","Integrate data models","Test workflows"]','["Laravel","MySQL","React"]',(select id from public.projects where slug = 'sinden'),true,2),
('Exploration & Foundation','Learning and organization activities','Learning','2022 - 2023','Indonesia','Strengthened cross-disciplinary practice across development, UI design, and visual production.','["Study web foundations","Create visual assets","Practice deployment"]','["PHP","Bootstrap","JavaScript"]',(select id from public.projects where slug = 'sm-v-lab-ipa'),true,3)
on conflict (role, organization, period) do update set
  experience_type = excluded.experience_type,
  location = excluded.location,
  description = excluded.description,
  responsibilities = excluded.responsibilities,
  technologies = excluded.technologies,
  related_project_id = excluded.related_project_id,
  published = excluded.published,
  display_order = excluded.display_order;

insert into public.certificates (title, issuer, category, issue_date, credential_id, credential_url, featured, published, display_order)
values
('Web Development Fundamentals','Dicoding','Development','2024-04-16','DCD-WEB-2024-FL','https://fazri.dev/certificates/web-development',true,true,1),
('UI/UX Design Essentials','Coursera','Design','2023-09-12','CRS-UIUX-FL','https://fazri.dev/certificates/uiux',false,true,2),
('JavaScript Intermediate','Codepolitan','Development','2023-06-20','CDP-JS-FL','https://fazri.dev/certificates/javascript',false,true,3)
on conflict (title, issuer) do update set
  category = excluded.category,
  issue_date = excluded.issue_date,
  credential_id = excluded.credential_id,
  credential_url = excluded.credential_url,
  featured = excluded.featured,
  published = excluded.published,
  display_order = excluded.display_order;

insert into public.visitor_comments (name, avatar, message, likes_count, admin_reply, pinned, status, created_at, approved_at)
values
('Aulia R.','AR','The portfolio feels clear and personal. The project previews help me understand the work quickly.',8,'Thank you for visiting and reading through the projects.',true,'approved','2026-07-10 00:00:00+00','2026-07-10 00:00:00+00'),
('Muhammad Rizky','MR','Mantap mas, project archive-nya rapi dan mudah dipelajari.',5,null,false,'approved','2026-07-05 00:00:00+00','2026-07-05 00:00:00+00'),
('Nadia S.','NS','The mix of development and creative work feels balanced without distracting from the web focus.',4,null,false,'approved','2026-06-28 00:00:00+00','2026-06-28 00:00:00+00')
on conflict (name, message, created_at) do update set
  likes_count = excluded.likes_count,
  admin_reply = excluded.admin_reply,
  pinned = excluded.pinned,
  status = excluded.status,
  approved_at = excluded.approved_at;



