-- Run this after the base schema when an existing Supabase project
-- needs the newer admin image fields.

alter table public.projects
  add column if not exists related_project_slug text;

alter table public.technologies
  add column if not exists logo_path text;
