-- Normalize table-level privileges after RLS policies are already in place.
-- RLS remains the authorization layer for authenticated admin operations.

revoke all privileges on table public.visitor_comments from anon, authenticated;
revoke all privileges on table public.visitor_comment_contacts from anon, authenticated;
revoke all privileges on table public.contact_messages from anon, authenticated;
revoke all privileges on table public.comment_likes from anon, authenticated;

-- Anon visitors may only read comments admitted by the approved-only RLS policy.
grant select on table public.visitor_comments to anon;

-- Existing authenticated admin policies using is_portfolio_admin() govern these DML grants.
grant select, insert, update, delete on table public.visitor_comments to authenticated;
grant select, insert, update, delete on table public.visitor_comment_contacts to authenticated;
grant select, insert, update, delete on table public.contact_messages to authenticated;
grant select on table public.comment_likes to authenticated;

-- Trusted Edge Functions continue to use service_role for validated public submissions.
grant all privileges on table public.visitor_comments, public.visitor_comment_contacts, public.contact_messages, public.comment_likes to service_role;
