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
