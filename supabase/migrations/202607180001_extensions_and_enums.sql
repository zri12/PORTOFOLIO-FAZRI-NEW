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
