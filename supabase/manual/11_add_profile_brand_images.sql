-- Run this once if your site_profiles table was created before logo/favicon fields were added.

alter table public.site_profiles
  add column if not exists logo_path text,
  add column if not exists favicon_path text,
  add column if not exists profile_image_path text;
