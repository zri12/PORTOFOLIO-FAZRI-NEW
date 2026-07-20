alter table public.site_profiles
  add column if not exists logo_path text,
  add column if not exists favicon_path text,
  add column if not exists profile_image_path text;

alter table public.projects
  add column if not exists related_project_slug text;

alter table public.technologies
  add column if not exists logo_path text;
