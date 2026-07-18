select 'singleton records exist' as test,
  (select count(*) from public.site_profiles where singleton_key = 'main') = 1
  and (select count(*) from public.site_settings where singleton_key = 'main') = 1 as passed;

select 'expected seed counts' as test,
  (select count(*) from public.projects) >= 6
  and (select count(*) from public.technologies) >= 20
  and (select count(*) from public.project_technologies) >= 6
  and (select count(*) from public.creative_works) >= 4
  and (select count(*) from public.experiences) >= 3
  and (select count(*) from public.certificates) >= 3 as passed;

select 'storage buckets exist' as test,
  exists (select 1 from storage.buckets where id = 'portfolio-public')
  and exists (select 1 from storage.buckets where id = 'portfolio-private') as passed;
