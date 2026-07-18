# Manual Supabase Setup

Use this when you prefer the Supabase Dashboard SQL Editor instead of the CLI.

Step 1:
Run `combined_setup.sql`.

Step 2:
Run `production_seed.sql`.

Step 3:
Create Edge Function secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Step 4:
Deploy:

- `submit-contact`
- `submit-comment`
- `like-comment`

Step 5:
Run the local admin creation script with:

- username `Fazrilukman`
- initial password supplied only through `ADMIN_PASSWORD`
- internal email alias `fazrilukman@portfolio-admin.example`

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

Use a real email instead of the internal alias later if password recovery by email is required.
