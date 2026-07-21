# Full Project Audit

Status: Complete

## Objective

Audit and repair the portfolio so admin data persists through Supabase where implemented, public/admin screens stay consistent, two-language UI does not leak the wrong language, and scrolling/animation remains smooth on desktop and mobile.

## User-Visible Outcome

The site should keep approved guestbook replies/comments visible, avoid frontend-only data divergence, use the selected language consistently, and reduce scroll stutter from heavy public animation.

## Current State

The project has a Supabase adapter plus local fallback. Recent fixes added guestbook public fallback behavior, but the user still sees approved reply visibility issues and wants a wider audit.

## Scope

- Repository CRUD and Supabase adapter parity.
- SQL/migration coverage for current models.
- Public/admin guestbook behavior.
- Two-language UI hardcoded text audit.
- Smooth scroll, WebGL, and animation performance hotspots.
- Typecheck, lint, build, and route smoke validation where possible.

## Non-Goals

- Rebuilding the approved visual identity from scratch.
- Adding new large product features beyond fixes found during audit.
- Changing secrets or production Supabase data directly.

## Relevant Files

- `src/app/repositories/portfolioRepository.ts`
- `src/app/repositories/supabasePortfolioRepository.ts`
- `src/app/lib/supabase/mappers.ts`
- `src/app/context/LanguageContext.tsx`
- `src/app/pages/public`
- `src/app/pages/admin`
- `src/app/components/common/SmoothScrollProvider.tsx`
- `src/app/components/portfolio`
- `supabase/migrations`

## Dependencies

- Existing Vite/React/Supabase setup.
- Existing migration files and environment variables.

## Data-Model Changes

Record any required SQL changes here if the audit finds missing columns, policies, or RPCs.

## Implementation Stages

1. Inspect code and migrations for persistence parity.
2. Inspect i18n coverage and hardcoded public text.
3. Inspect animation/performance code.
4. Patch discovered issues.
5. Validate and push.

## Progress Checklist

- [x] Persistence audit complete.
- [x] I18n audit complete.
- [x] Performance audit complete.
- [x] Fixes implemented.
- [x] Validation passed.
- [x] Pushed to GitHub.

## Discoveries

- Admin/private data was always refreshed with public scope, so `contact_messages` could be missing from admin after refresh.
- The guestbook reply migration shared the same version prefix as the articles migration (`202607210001`), which prevented Supabase from recording it correctly.
- Remote Supabase was missing `visitor_comments.parent_comment_id`; this directly affected persisted guestbook replies.
- The homepage contact mini-form only set local UI state and did not persist anywhere.
- The seed/default article text still used Indonesian copy even though the public/admin baseline is English.
- Mobile scroll work can be reduced by avoiding redundant navbar state updates and lowering ambient WebGL render frequency on compact viewports.

## Decisions

- Keep public and admin Supabase caches separate so private message data is not stored in the public cache.
- Treat certificate row count as user-managed content in verification; require the table to be present and populated, not the original demo count.

## Risks

- Production Supabase schema may not have every migration applied, which cannot be fixed solely from frontend code.
- Full visual FPS verification requires a browser/device pass.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Route smoke checks for public/admin paths.

## Rollback Strategy

Revert the final audit commit if changes cause regressions.

## Final Result

Implemented fixes, applied the guestbook reply migration to remote Supabase, validated locally, and pushed to GitHub.
