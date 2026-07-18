# Routes

## Source of Truth

Routes are currently defined in `src/app/App.tsx`.

## Public Routes

| Route | Component | Status | Expected behavior |
| --- | --- | --- | --- |
| `/` | `HomePage` | Implemented | Public landing page with hero, portfolio sections, and shared layout. |
| `/about` | `AboutPage` | Implemented | About/profile page. |
| `/projects` | `ProjectsPage` | Implemented | Project listing and filters. |
| `/projects/:slug` | `ProjectDetailPage` | Implemented | Dedicated project detail page; unknown slugs should fall back gracefully. |
| `/creative-works` | `CreativeWorksPage` | Implemented | Creative work archive. |
| `/creative-works/:slug` | `CreativeWorkDetailPage` | Implemented | Dedicated creative work detail page; unknown slugs should fall back gracefully. |
| `/certificates` | `CertificatesPage` | Prototype | Certificate gallery/listing. |
| `/contact` | `ContactPage` | Prototype | Contact form and guestbook/comment area. |
| `*` | `NotFoundPage` | Implemented | Public not-found state. |

## Known Project Slugs

- `sinden`
- `so-harmony`
- `sumut-cluster`
- `sm-v-lab-ipa`
- `marketing-crm`
- `sistem-cuti-skm`

## Known Creative Work Slugs

- `product-interface-studies`
- `visual-brand-moments`
- `light-place-people`
- `frame-in-motion`

## Admin Routes

| Route | Component | Status | Expected behavior |
| --- | --- | --- | --- |
| `/admin/login` | `AdminLoginPage` | Prototype | Demo login form. |
| `/admin` | `Navigate` | Implemented | Redirects to `/admin/dashboard`. |
| `/admin/dashboard` | `AdminDashboardPage` | Prototype | Admin overview. |
| `/admin/profile` | `AdminProfilePage` | Prototype | Edit profile content. |
| `/admin/hero` | `AdminHeroPage` | Prototype | Edit hero-related content/settings. |
| `/admin/projects` | `AdminProjectsPage` | Prototype | Project list and actions. |
| `/admin/projects/new` | `AdminProjectFormPage` | Prototype | Create project. |
| `/admin/projects/:id/edit` | `AdminProjectFormPage` | Prototype | Edit project by ID. |
| `/admin/tech-stack` | `AdminTechStackPage` | Prototype | Manage technology items. |
| `/admin/creative-works` | `AdminCreativeWorksPage` | Prototype | Manage creative work items. |
| `/admin/experience` | `AdminExperiencePage` | Prototype | Manage experience entries. |
| `/admin/certificates` | `AdminCertificatesPage` | Prototype | Manage certificates. |
| `/admin/comments` | `AdminCommentsPage` | Prototype | Moderate comments. |
| `/admin/messages` | `AdminMessagesPage` | Prototype | Manage contact messages. |
| `/admin/media` | `AdminMediaPage` | Prototype | Local media library. |
| `/admin/settings` | `AdminSettingsPage` | Prototype | Site settings, import/export/reset. |
| `/admin/*` | `Navigate` | Implemented | Redirects to `/admin/dashboard`. |

## Navigation Rules

- `/admin` redirects to `/admin/dashboard`.
- Admin routes are protected by `AdminRoute`.
- Project details use dedicated `/projects/:slug` pages, not full detail modals.
- Creative work details use dedicated `/creative-works/:slug` pages.
- Public and admin layouts are separate.
- Public routes use route transitions and scroll restoration through shared common components.
- Mobile must not rely on hover-only navigation or reveal behavior.

## Metadata

Route metadata is expected to be controlled through `useDocumentMeta` where implemented. Target behavior is for each major route to set a meaningful page title and description.
