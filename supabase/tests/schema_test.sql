select 'required tables exist' as test,
  count(*) = 16 as passed
from information_schema.tables
where table_schema = 'public'
  and table_name = any(array[
    'admin_users','site_profiles','site_settings','projects','technologies','project_technologies',
    'creative_works','experiences','certificates','visitor_comments','visitor_comment_contacts',
    'comment_likes','contact_messages','media_assets','submission_rate_limits','activity_logs'
  ]);

select 'required functions exist' as test,
  count(*) >= 3 as passed
from information_schema.routines
where routine_schema = 'public'
  and routine_name = any(array['set_updated_at','is_active_admin','public_approved_comments']);
