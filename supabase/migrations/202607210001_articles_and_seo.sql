alter table public.site_settings
  add column if not exists site_url text not null default 'https://fazrilukman.id',
  add column if not exists seo_image_path text,
  add column if not exists google_site_verification text;

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug public.citext unique not null check (length(trim(slug::text)) > 0),
  title text not null check (length(trim(title)) > 0),
  excerpt text not null default '',
  category text not null default 'Web Development',
  tags text[] not null default '{}',
  cover_path text,
  cover_alt text not null default '',
  author text not null default 'Fazri Lukman Nurrohman',
  status public.publish_status not null default 'draft',
  featured boolean not null default false,
  published_at timestamptz,
  reading_time integer not null default 1 check (reading_time > 0),
  seo_title text not null default '',
  seo_description text not null default '',
  content jsonb not null default '[]'::jsonb check (jsonb_typeof(content) = 'array'),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create index if not exists articles_status_published_idx on public.articles (status, published_at desc);
create index if not exists articles_featured_idx on public.articles (featured) where status = 'published';
create index if not exists articles_display_order_idx on public.articles (display_order);

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at before update on public.articles
for each row execute function public.set_updated_at();

alter table public.articles enable row level security;

drop policy if exists "public read published articles" on public.articles;
create policy "public read published articles" on public.articles
for select to anon, authenticated using (status = 'published' and coalesce(published_at, now()) <= now());

drop policy if exists "admin manage articles" on public.articles;
create policy "admin manage articles" on public.articles
for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
grant all privileges on public.articles to service_role;

do $$
begin
  alter publication supabase_realtime add table public.articles;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
