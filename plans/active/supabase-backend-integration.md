# Supabase Backend Integration

Status: Active

## Objective

Replace the frontend-only portfolio storage and demo authentication with a Supabase-backed data, auth, storage, and public form integration while preserving the approved UI.

## User-Visible Outcome

Public pages and admin pages continue looking the same, but content can be loaded from Supabase, admin login uses Supabase Auth, public forms submit through Edge Functions, media uploads persist to Supabase Storage, and the project can be pushed/deployed with documented environment setup.

## Current State

The app is a React 19 + TypeScript + Vite frontend. Data is currently stored in browser localStorage through `portfolioRepository`, and admin auth is simulated through `authRepository`.

## Scope

- Supabase migrations, RLS, storage policies, realtime publication.
- Production and demo seed SQL based on `portfolioSeed.ts`.
- Supabase client, mappers, storage helpers, repositories, and auth.
- Edge Functions for contact, comments, and likes.
- Admin provisioning, asset upload, verification, and import scripts.
- Documentation and environment examples.
- Validation through TypeScript, lint, and build.
- Best-effort GitHub push and Vercel/Supabase deployment when credentials are available.

## Non-Goals

- Redesigning public or admin UI.
- Committing passwords or service-role keys.
- Inventing new portfolio content.
- Replacing Supabase with another backend.

## Relevant Files

- `src/app/types/portfolio.ts`
- `src/app/data/seed/portfolioSeed.ts`
- `src/app/repositories/portfolioRepository.ts`
- `src/app/repositories/authRepository.ts`
- `src/app/context/AdminAuthContext.tsx`
- `src/app/pages/public/ContactPage.tsx`
- `src/app/pages/admin/*`
- `supabase/**`
- `scripts/**`
- `.env.example`
- `.env.admin.example`
- `.gitignore`
- `docs/BACKEND_INTEGRATION.md`

## Dependencies

- `@supabase/supabase-js`
- Supabase CLI for applying/deploying resources.
- A linked Supabase project and Vercel authentication for remote actions.

## Data-Model Changes

Add normalized Supabase tables for profile, settings, projects, technologies, project technologies, creative works, experiences, certificates, comments, comment contacts, likes, contact messages, media assets, submission rate limits, and activity logs.

## Implementation Stages

1. Add Supabase SQL, Edge Functions, scripts, and docs.
2. Add frontend Supabase client/mappers/storage/auth repositories.
3. Refactor the existing portfolio repository into a Supabase-first adapter with local seed fallback.
4. Update public contact/comment/like flows and admin media/project creation behavior.
5. Validate locally and attempt remote push/deploy when credentials exist.

## Progress Checklist

- [x] Read project documentation and seed data.
- [x] Install Supabase JavaScript client.
- [ ] Create Supabase files and scripts.
- [ ] Connect frontend repositories.
- [x] Validate.
- [x] Push/deploy or record credential blockers.

## Discoveries

- The current folder is not a Git repository yet.
- `.gitignore`, `.env.example`, and `.env.admin.example` are missing.
- Admin project form creates a project during initial render when opening `/admin/projects/new`.
- Supabase CLI exists, but local Supabase cannot run because Docker is not available/active.
- GitHub HTTPS push is blocked by missing non-interactive credentials.
- GitHub connector write access to `Fazrilukman/PORTOFOLIO-FAZRI-NEW` returns `403 Resource not accessible by integration`.
- Vercel CLI is available through `npx`, but deploy is blocked by missing `VERCEL_TOKEN` and project link.

## Decisions

- Keep current synchronous repository API for UI compatibility, with Supabase synchronization behind the repository.
- Keep `portfolioSeed.ts` as a legacy fallback/migration source, not authoritative when Supabase is enabled.

## Risks

- Full remote validation requires real Supabase and Vercel credentials.
- Existing admin pages save some fields on each input change; repository caching prevents UI breakage, but high-frequency backend writes should be improved later.
- A local Supabase stack may not be available on this machine.

## Validation

- `npm install`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Supabase CLI checks if installed and configured.

## Rollback Strategy

Disable Supabase with `VITE_ENABLE_SUPABASE=false` to use the legacy seed/local fallback while preserving UI routes.

## Final Result

Implemented Supabase integration files, frontend adapter, admin auth mapping, Edge Functions, seed SQL, scripts, docs, and local validation. Remote Supabase provisioning, Edge Function deployment, asset upload, admin provisioning, GitHub push, and Vercel deploy require credentials/project access that are not available in this session.
