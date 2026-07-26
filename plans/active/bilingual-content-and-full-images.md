# Bilingual Project and Article Content with Full Images

Status: Validation and publication

## Objective

Display project and article images without cropping and make the EN/IND switch select genuinely separate localized project and article content across admin, listings, detail pages, search, and metadata.

## User-Visible Outcome

Project and article images retain their original aspect ratio and remain fully visible. Admin users can enter Indonesian and English versions of project and article content. Public pages, filtering, detail content, document metadata, and structured data follow the selected language. Older single-language records remain available only in their detected source language until the missing translation is authored.

## Current State

Project and article cards/details use fixed aspect wrappers with `object-cover`, which crops some uploaded images. The language context translates registered UI strings only; persisted Project and Article models contain one language, so the same content appears in both language modes.

## Scope

- Project and article card/detail image rendering.
- Localized Project and Article TypeScript models.
- Admin Project and Article bilingual fields.
- Repository normalization and Supabase mapper/storage compatibility.
- Public project/article listings, details, search, related navigation, metadata, and structured data.
- Relevant static UI copy on project/blog surfaces.
- Documentation, validation, GitHub publication, and Vercel production verification.

## Non-Goals

- Runtime machine translation.
- Automatic translation of user-authored text.
- Bilingualization of private messages, comments, or credential proper names.
- Rendering unsafe raw HTML.

## Relevant Files

- `src/app/types/portfolio.ts`
- `src/app/pages/admin/AdminProjectFormPage.tsx`
- `src/app/pages/admin/AdminArticleFormPage.tsx`
- `src/app/pages/public/ProjectsPage.tsx`
- `src/app/pages/public/ProjectDetailPage.tsx`
- `src/app/pages/public/BlogPage.tsx`
- `src/app/pages/public/ArticleDetailPage.tsx`
- `src/app/components/portfolio/ProjectPreview.tsx`
- `src/app/context/LanguageContext.tsx`
- `src/app/i18n/translations.ts`
- `src/app/lib/supabase/mappers.ts`
- `src/app/repositories/portfolioRepository.ts`
- Supabase migrations and project documentation.

## Dependencies

- Existing React language context.
- Existing Supabase JSON/content persistence and Storage URLs.
- No new package dependency planned.

## Data-Model Changes

Add optional localized content objects to Project and Article. Existing top-level fields remain the compatibility source. Indonesian and English localized objects are persisted in versioned envelopes inside existing Supabase JSONB fields and normalized when absent.

## Implementation Stages

1. Audit current language, images, models, repository, mapper, and database schema.
2. Add localized models, helpers, normalization, mapper support, and migration.
3. Update bilingual admin authoring for projects and articles.
4. Update public listing/detail/search/meta behavior and full-image rendering.
5. Validate parser, types, lint, build, local routes, and production assets.
6. Commit, push, merge, and verify Vercel Production.

## Progress Checklist

- [x] Read required documentation and inspect affected routes.
- [x] Complete data-model and persistence migration.
- [x] Complete bilingual admin forms.
- [x] Complete localized public project/article behavior.
- [x] Remove project/article image cropping.
- [x] Pass typecheck, lint, build, HTTP, and Supabase compatibility validation.
- [ ] Push and deploy production.

## Discoveries

- The current language switch only translates strings registered in the UI translation dictionary.
- Project and Article records currently store a single content language.
- Fixed aspect containers and `object-cover` are the direct cause of cropped uploaded images.
- Supabase exposes both `projects.decisions` and `articles.content` as JSONB, so versioned compatibility envelopes require no database schema change.
- All five current legacy articles are detected as Indonesian; all seven current legacy projects are detected as English.
- The in-app browser connection was unavailable; local runtime validation used the Vite HTTP server and build output instead.

## Decisions

- Use explicit author-entered translations; never invent or machine-translate persisted content.
- Keep legacy top-level content fields for backward compatibility.
- Do not fall back across languages. Hide unavailable listing entries and show a clear translation-unavailable state on direct detail routes.
- Store project translations in the existing `decisions` JSONB envelope and article translations in the existing `content` JSONB envelope while continuing to read legacy arrays.

## Risks

- Existing Supabase rows will not have localized JSON until edited; they are classified into one source language in memory.
- Empty English fields must not accidentally show labels from the wrong locale.
- Image cards may have varied heights after preserving original ratios.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- local route HTTP checks
- Git diff and migration review
- Vercel Production Ready and custom-domain asset verification

## Rollback Strategy

Revert the merge commit. Legacy top-level fields remain unchanged, so older application versions can continue reading project and article content.

## Final Result

Pending.
