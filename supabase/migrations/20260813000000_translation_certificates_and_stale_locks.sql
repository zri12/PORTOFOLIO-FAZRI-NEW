-- Align certificates with the durable translation metadata used by other CMS entities.
alter table public.certificates
  add column if not exists source_language public.content_language,
  add column if not exists translation_status public.translation_state not null default 'pending',
  add column if not exists translation_source_hash text,
  add column if not exists translation_version integer not null default 1,
  add column if not exists translation_updated_at timestamptz,
  add column if not exists translation_error text;

update public.certificates
set translation_status = case when coalesce(translations, '{}'::jsonb) = '{}'::jsonb then 'pending'::public.translation_state else 'ready'::public.translation_state end
;

-- Do this before the new triggers exist. It makes the first triggered UPDATE
-- advance legacy untranslated certificates from version 0 to version 1.
update public.certificates
set translation_version = 0,
    translation_status = 'pending',
    translation_error = null
where coalesce(translations, '{}'::jsonb) = '{}'::jsonb
  and translation_source_hash is null;

-- Preserve every existing entity branch and add only the certificate payload.
create or replace function public.portfolio_translation_payload(
  p_entity_type text,
  p_row jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  result jsonb;
begin
  case p_entity_type
    when 'site_profiles' then
      result := jsonb_strip_nulls(jsonb_build_object(
        'title', p_row -> 'title', 'greeting', p_row -> 'greeting', 'headline', p_row -> 'headline',
        'description', p_row -> 'description', 'biography', p_row -> 'biography',
        'aboutContent', p_row -> 'about_content', 'availability', p_row -> 'availability'
      ));
    when 'site_settings' then
      result := jsonb_strip_nulls(jsonb_build_object(
        'description', p_row -> 'description', 'copyright', p_row -> 'copyright',
        'seoTitle', p_row -> 'seo_title', 'seoDescription', p_row -> 'seo_description', 'keywords', p_row -> 'keywords'
      ));
    when 'projects' then
      result := jsonb_strip_nulls(jsonb_build_object(
        'role', p_row -> 'role', 'shortDescription', p_row -> 'short_description',
        'fullDescription', p_row -> 'full_description', 'overview', p_row -> 'overview',
        'background', p_row -> 'background', 'objectives', p_row -> 'objectives',
        'targetUsers', p_row -> 'target_users', 'responsibilities', p_row -> 'responsibilities',
        'solution', p_row -> 'solution', 'features', p_row -> 'features', 'architecture', p_row -> 'architecture',
        'dataStructure', p_row -> 'data_structure', 'process', p_row -> 'process',
        'challenges', p_row -> 'challenges', 'decisions', p_row -> 'decisions',
        'testing', p_row -> 'testing', 'deployment', p_row -> 'deployment', 'result', p_row -> 'result'
      ));
    when 'technologies' then
      result := jsonb_strip_nulls(jsonb_build_object('description', p_row -> 'description'));
    when 'creative_works' then
      result := jsonb_strip_nulls(jsonb_build_object(
        'role', p_row -> 'role', 'description', p_row -> 'description', 'brief', p_row -> 'brief'
      ));
    when 'experiences' then
      result := jsonb_strip_nulls(jsonb_build_object(
        'role', p_row -> 'role', 'type', p_row -> 'experience_type',
        'description', p_row -> 'description', 'responsibilities', p_row -> 'responsibilities'
      ));
    when 'certificates' then
      result := jsonb_strip_nulls(jsonb_build_object(
        'title', p_row -> 'title',
        'issuer', p_row -> 'issuer'
      ));
    when 'articles' then
      result := jsonb_strip_nulls(jsonb_build_object(
        'title', p_row -> 'title', 'excerpt', p_row -> 'excerpt', 'coverAlt', p_row -> 'cover_alt',
        'seoTitle', p_row -> 'seo_title', 'seoDescription', p_row -> 'seo_description', 'blocks', p_row -> 'content'
      ));
    else result := '{}'::jsonb;
  end case;
  return coalesce(result, '{}'::jsonb);
end;
$$;

drop trigger if exists certificates_translation_before on public.certificates;
create trigger certificates_translation_before
before insert or update on public.certificates
for each row execute function public.portfolio_mark_translation_pending('certificates');

drop trigger if exists certificates_translation_after on public.certificates;
create trigger certificates_translation_after
after insert or update on public.certificates
for each row execute function public.portfolio_enqueue_translation_job('certificates');

-- Allow the certificate trigger to enqueue its durable translation job.
alter table public.translation_jobs
  drop constraint if exists translation_jobs_entity_type_check;

alter table public.translation_jobs
  add constraint translation_jobs_entity_type_check
  check (
    entity_type = any (
      array[
        'site_profiles',
        'site_settings',
        'projects',
        'technologies',
        'creative_works',
        'experiences',
        'certificates',
        'articles'
      ]::text[]
    )
  );

-- Only untranslated legacy certificates are bootstrapped. This no-op source update
-- invokes the new triggers, creates hash/version 1, and upserts one queue row.
update public.certificates
set updated_at = updated_at
where coalesce(translations, '{}'::jsonb) = '{}'::jsonb
  and translation_source_hash is null;

-- A reclaimed lease is protected by SKIP LOCKED, so concurrent workers cannot claim it twice.
create or replace function public.claim_translation_jobs(p_limit integer default 5)
returns setof public.translation_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role'
     and not public.is_portfolio_admin() then
    raise exception 'Active portfolio admin or service role required';
  end if;

  return query
  with claimable as (
    select id
    from public.translation_jobs
    where attempts < 5
      and (
        (status = 'pending' and available_at <= now())
        or (status = 'failed' and available_at <= now())
        or (status = 'processing' and locked_at < now() - interval '10 minutes')
      )
    order by available_at, created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 5), 20))
  )
  update public.translation_jobs jobs
  set status = 'processing',
      attempts = jobs.attempts + 1,
      locked_at = now(),
      locked_by = coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''), 'translation-worker'),
      last_error = null,
      updated_at = now()
  from claimable
  where jobs.id = claimable.id
  returning jobs.*;
end;
$$;
