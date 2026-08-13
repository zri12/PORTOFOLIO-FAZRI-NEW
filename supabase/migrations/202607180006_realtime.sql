do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'projects',
    'technologies',
    'project_technologies',
    'creative_works',
    'experiences',
    'certificates',
    'visitor_comments',
    'contact_messages',
    'site_profiles',
    'site_settings'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    exception
      when duplicate_object then null;
      when undefined_object then null;
    end;
  end loop;
end $$;
