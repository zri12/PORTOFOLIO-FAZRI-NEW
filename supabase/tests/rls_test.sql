select 'rls enabled on application tables' as test,
  bool_and(relrowsecurity) as passed
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = any(array[
    'admin_users','site_profiles','site_settings','projects','technologies','project_technologies',
    'creative_works','experiences','certificates','visitor_comments','visitor_comment_contacts',
    'comment_likes','contact_messages','media_assets','submission_rate_limits','activity_logs'
  ]);

select 'public cannot read contact messages by policy name' as test,
  not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_messages'
      and roles::text like '%anon%'
      and cmd = 'SELECT'
  ) as passed;
