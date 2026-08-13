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

Copy `.env.example` to `.env.local` for local development. In Vercel, configure the server and client groups separately.

```env
# Server-only Vercel Function variables (never use VITE_ for these)
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_PUBLIC_BUCKET=
SITE_URL=

# Public Vite variables; these are browser configuration, not secrets
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PUBLIC_BUCKET=
VITE_ENABLE_SUPABASE=
VITE_ENABLE_REALTIME=
VITE_SITE_URL=

# Optional public Admin username aliases
VITE_ADMIN_USERNAME=
VITE_ADMIN_AUTH_EMAIL=
VITE_ADMIN_AUTH_DOMAIN=

# Server-only Edge Function translation secrets
TRANSLATION_PROVIDER=
TRANSLATION_API_KEY=
TRANSLATION_MODEL=
TRANSLATION_WORKER_SECRET=
```

`VITE_*` variables are public browser configuration. Keep service-role credentials and all translation credentials only in local shells, CI secrets, Vercel/Supabase secrets, or `.env.admin.local`. Never expose `SUPABASE_SERVICE_ROLE_KEY`, `TRANSLATION_API_KEY`, `TRANSLATION_WORKER_SECRET`, Gemini credentials, a Supabase PAT, or a database password through `VITE_*`.

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

The translation worker and Gemini provider are configured only with Supabase Edge Function secrets (`TRANSLATION_PROVIDER`, `TRANSLATION_API_KEY`, `TRANSLATION_MODEL`, and `TRANSLATION_WORKER_SECRET`). They do not use a browser translation API URL.

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
