# Supabase Backend Integration

The portfolio uses Supabase as the production backend for public content, admin-managed data, storage URLs, contact messages, guestbook comments, replies, and likes.

## Current Repository Boundary

SQL setup, seed, migration, and local SQL test files have already been applied to the live Supabase project and are no longer kept in this repository. This keeps the deploy package lean and avoids accidentally re-running old setup files.

The repository still keeps the runtime pieces that are required by the web app:

- `src/app/lib/supabase/client.ts`
- `src/app/lib/supabase/database.types.ts`
- Supabase repository adapters under `src/app/repositories`
- Edge Functions under `supabase/functions`
- admin and verification scripts under `scripts`

If a fresh Supabase project is needed later, export the current schema from the live project or regenerate migrations from the live database before applying it to the new project.

## Environment Files

Copy `.env.example` to `.env.local` and fill:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PUBLIC_BUCKET=portfolio-public
VITE_ADMIN_AUTH_DOMAIN=portfolio-admin.example
VITE_ENABLE_SUPABASE=true
VITE_ENABLE_REALTIME=true
```

Keep service-role credentials only in the local shell, CI secrets, hosting secrets, or `.env.admin.local`. Never expose service-role credentials through `VITE_*`.

## Admin and Service Secrets

The publishable key is safe for browser use and is limited by Row Level Security.

The service-role key bypasses RLS and is only for trusted scripts, CI, and Edge Functions.

PowerShell example:

```powershell
$env:SUPABASE_URL="YOUR_PROJECT_URL"
$env:SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
$env:ADMIN_USERNAME="Fazrilukman"
$env:ADMIN_PASSWORD="YOUR_INITIAL_ADMIN_PASSWORD"
$env:ADMIN_AUTH_EMAIL="fazrilukman@portfolio-admin.example"
npm run supabase:create-admin
```

Bash example:

```bash
SUPABASE_URL="YOUR_PROJECT_URL" \
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
ADMIN_USERNAME="Fazrilukman" \
ADMIN_PASSWORD="YOUR_INITIAL_ADMIN_PASSWORD" \
ADMIN_AUTH_EMAIL="fazrilukman@portfolio-admin.example" \
npm run supabase:create-admin
```

Use a real email later if password recovery by email is required.

## Edge Functions

Deploy the public Edge Functions separately from the static frontend build:

```bash
supabase functions deploy submit-contact
supabase functions deploy submit-comment
supabase functions deploy like-comment
```

Then set secrets:

```bash
supabase secrets set SUPABASE_URL="YOUR_PROJECT_URL"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

## Verification

After changing Supabase settings or hosting environment variables, run:

```bash
npm run supabase:verify
```

Regenerate types after database schema changes:

```bash
npm run supabase:types
```

Upload static/seed assets when needed:

```bash
npm run supabase:upload-assets
```

## Public Forms

The contact form calls `submit-contact`.

The guestbook form calls `submit-comment`, stores visitor email privately, and leaves comments pending until admin approval.

Likes call `like-comment`; the server controls one-like-per-device behavior and recalculates `likes_count`.

## Realtime

Realtime subscriptions are centralized in the repository layer and can be disabled with:

```env
VITE_ENABLE_REALTIME=false
```

Public subscriptions must not expose private visitor email records or rate-limit tables.
