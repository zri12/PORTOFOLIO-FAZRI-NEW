-- Run this in Supabase SQL Editor if admin provisioning fails with:
-- permission denied for table admin_users

grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

grant execute on all functions in schema public to service_role;
