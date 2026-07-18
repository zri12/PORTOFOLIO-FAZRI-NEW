# Supabase Backend Integration

The portfolio now supports Supabase as the authoritative production backend while keeping the approved frontend UI intact.

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

Keep service-role credentials only in your shell or `.env.admin.local`. Never expose them through `VITE_*`.

## Key Difference

The publishable key is safe for browser use and is limited by Row Level Security.

The service-role key bypasses RLS and is only for trusted local scripts, CI secrets, and Edge Functions.

## CLI Setup

1. Create a Supabase project.
2. Copy the Project URL and Publishable key into `.env.local`.
3. Link the CLI project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. Apply migrations:

```bash
npm run supabase:push
```

5. Seed production content:

```bash
supabase db execute --file supabase/seed/production_seed.sql
```

6. Deploy Edge Functions:

```bash
supabase functions deploy submit-contact
supabase functions deploy submit-comment
supabase functions deploy like-comment
```

7. Set Edge Function secrets:

```bash
supabase secrets set SUPABASE_URL="YOUR_PROJECT_URL"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

8. Create the initial admin user.

PowerShell:

```powershell
$env:SUPABASE_URL="YOUR_PROJECT_URL"
$env:SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
$env:ADMIN_USERNAME="Fazrilukman"
$env:ADMIN_PASSWORD="YOUR_INITIAL_ADMIN_PASSWORD"
$env:ADMIN_AUTH_EMAIL="fazrilukman@portfolio-admin.example"
npm run supabase:create-admin
```

Bash:

```bash
SUPABASE_URL="YOUR_PROJECT_URL" \
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
ADMIN_USERNAME="Fazrilukman" \
ADMIN_PASSWORD="YOUR_INITIAL_ADMIN_PASSWORD" \
ADMIN_AUTH_EMAIL="fazrilukman@portfolio-admin.example" \
npm run supabase:create-admin
```

Use a real email later if password recovery by email is required.

9. Upload seed assets:

```bash
npm run supabase:upload-assets
```

10. Generate database types:

```bash
npm run supabase:types
```

11. Verify setup:

```bash
npm run supabase:verify
```

## Manual SQL Editor Setup

Use files under `supabase/manual` in this order:

Step 1:
Run `combined_setup.sql`.

Step 2:
Run `production_seed.sql`.

Step 3:
Create Edge Function secrets.

Step 4:
Deploy:

- `submit-contact`
- `submit-comment`
- `like-comment`

Step 5:
Run the local admin creation script with username `Fazrilukman`, the initial password supplied through `ADMIN_PASSWORD`, and internal email alias `fazrilukman@portfolio-admin.example`.

Step 6:
Run the asset upload script.

Step 7:
Regenerate database types.

Step 8:
Configure frontend `.env.local`.

Step 9:
Run verification script.

Step 10:
Log in and change the initial password when practical.

## Backend Pieces

- Migrations: `supabase/migrations`
- Production seed: `supabase/seed/production_seed.sql`
- Demo seed: `supabase/seed/demo_seed.sql`
- Edge Functions: `supabase/functions`
- Admin provisioning: `scripts/create-supabase-admin.mjs`
- Asset upload: `scripts/upload-supabase-assets.mjs`
- Verification: `scripts/verify-supabase-setup.mjs`

## Auth

The login form accepts `Fazrilukman` and maps it to:

```text
fazrilukman@portfolio-admin.example
```

The password is never committed. It is supplied only when running the one-time provisioning script.

## Public Forms

The Contact form calls `submit-contact`.

The Guestbook form calls `submit-comment`, stores the visitor email in `visitor_comment_contacts`, and leaves the comment pending until admin approval.

Likes call `like-comment`; the server controls unique likes and recalculates `likes_count`.

## Realtime

Realtime subscriptions are centralized in the repository layer and can be disabled with:

```env
VITE_ENABLE_REALTIME=false
```

Public subscriptions do not include private visitor email records or rate-limit tables.
