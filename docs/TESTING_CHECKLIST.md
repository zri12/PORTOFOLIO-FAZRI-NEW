# Testing Checklist

No task may be marked complete solely because the UI renders. Validation must match the feature scope.

## Installation and Build

- [ ] `npm install` completes without dependency conflicts.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes. Current script runs `tsc --noEmit`.
- [ ] `npm run build` passes.
- [ ] `npm run preview` serves the built output.
- [ ] Browser console has no relevant runtime errors.

## Public Routes

- [ ] `/`
- [ ] `/about`
- [ ] `/projects`
- [ ] `/projects/sinden`
- [ ] `/projects/so-harmony`
- [ ] `/projects/sumut-cluster`
- [ ] `/projects/sm-v-lab-ipa`
- [ ] `/projects/marketing-crm`
- [ ] `/projects/sistem-cuti-skm`
- [ ] `/creative-works`
- [ ] `/creative-works/product-interface-studies`
- [ ] `/creative-works/visual-brand-moments`
- [ ] `/creative-works/light-place-people`
- [ ] `/creative-works/frame-in-motion`
- [ ] `/certificates`
- [ ] `/contact`
- [ ] unknown public route shows not-found state.

## Admin Routes

- [ ] `/admin/login`
- [ ] `/admin` redirects to `/admin/dashboard` after auth.
- [ ] `/admin/dashboard`
- [ ] `/admin/profile`
- [ ] `/admin/hero`
- [ ] `/admin/projects`
- [ ] `/admin/projects/new`
- [ ] `/admin/projects/:id/edit`
- [ ] `/admin/tech-stack`
- [ ] `/admin/creative-works`
- [ ] `/admin/experience`
- [ ] `/admin/certificates`
- [ ] `/admin/comments`
- [ ] `/admin/messages`
- [ ] `/admin/media`
- [ ] `/admin/settings`
- [ ] unknown admin route redirects to dashboard.

## Authentication

- [ ] Unauthenticated admin access redirects to login.
- [ ] Demo login creates a session.
- [ ] Remember me persists in local storage.
- [ ] Non-remembered login persists in session storage.
- [ ] Logout clears both storage locations.
- [ ] Direct protected URL access behaves correctly.

## CRUD

Projects:

- [ ] list
- [ ] search/filter if available
- [ ] create
- [ ] edit
- [ ] duplicate
- [ ] delete confirmation
- [ ] publish/draft/archive handling
- [ ] refresh persistence

Tech stack, creative works, experience, certificates, comments, messages, media, and settings:

- [ ] loading state
- [ ] empty state
- [ ] error state
- [ ] validation
- [ ] create/update where relevant
- [ ] delete confirmation where relevant
- [ ] success/error feedback
- [ ] mobile layout

## Local Persistence

- [ ] Save data and refresh.
- [ ] Public and admin reflect the same data source.
- [ ] Corrupted data falls back safely.
- [ ] Reset demo data works.
- [ ] Export returns valid JSON.
- [ ] Import accepts valid JSON.
- [ ] Local media limitations are not misrepresented.

## Mode Testing

- [ ] Professional Mode is default.
- [ ] Spider switch works.
- [ ] Mode persistence works where intended.
- [ ] Character reveal works on desktop pointer.
- [ ] Mobile tap/toggle alternative works.
- [ ] Mode restoration does not cause layout jump.

## Animation

- [ ] Lenis initializes once and cleans up.
- [ ] Hero animation is readable.
- [ ] Project/section motion does not trap scrolling.
- [ ] Creative gallery motion is usable.
- [ ] Route transitions are short.
- [ ] Reduced motion fallback works.

## 3D

- [ ] Scene renders.
- [ ] Professional and Spider transformations are distinct.
- [ ] Pointer response works.
- [ ] Scroll response does not hurt readability.
- [ ] WebGL fallback exists or failure is graceful.
- [ ] Offscreen pause is considered.
- [ ] Mobile performance is acceptable.
- [ ] 3D does not block text, forms, navigation, or character interaction.

## Responsive Widths

- [ ] 1440px
- [ ] 1280px
- [ ] 1024px
- [ ] 768px
- [ ] 390px
- [ ] 360px

## Visual QA

- [ ] No horizontal overflow.
- [ ] No broken images.
- [ ] No visible placeholders.
- [ ] No dashboard over character face.
- [ ] No giant cursor.
- [ ] No red portal.
- [ ] No rotating F.
- [ ] No atom model.
- [ ] Readable contrast.
- [ ] No excessive clipping.
- [ ] No accidental scroll traps.

## Accessibility

- [ ] Heading order is logical.
- [ ] Landmarks are present.
- [ ] Keyboard navigation works.
- [ ] Focus visibility is clear.
- [ ] Forms have labels.
- [ ] Dialog focus trap works.
- [ ] Escape behavior works.
- [ ] Touch alternatives exist.
- [ ] Contrast is acceptable.
- [ ] Reduced motion is respected.
- [ ] Status is not color-only.

## Performance

- [ ] Lazy loading used where useful.
- [ ] Avoid unnecessary rerenders.
- [ ] WebGL resources are cleaned up.
- [ ] Object URLs are cleaned up.
- [ ] Image sizes are reasonable.
- [ ] Animation FPS is acceptable.
- [ ] Mobile fallback is acceptable.
