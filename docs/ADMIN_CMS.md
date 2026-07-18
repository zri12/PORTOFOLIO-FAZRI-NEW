# Admin CMS

The admin is currently a frontend prototype. It does not provide production security, server storage, or permanent uploads.

## Authentication Scope

Current authentication is simulated through `authRepository` and stored in `localStorage` or `sessionStorage` under `fazri-admin-session`. Protected admin routes use `AdminRoute`. Logout clears the simulated session.

Future backend work must replace this with real authentication and authorization. Do not describe the current demo login as production security.

## Admin Layout

Target admin layout:

- collapsible sidebar
- mobile drawer
- header
- breadcrumbs
- search
- notifications
- preview portfolio action
- profile menu
- logout

Admin UI should prioritize clarity and speed over cinematic motion.

## Dashboard

Required dashboard metrics and widgets:

- total projects
- published projects
- drafts
- creative works
- technologies
- certificates
- comments
- unread messages
- category chart
- activity chart
- recent items
- quick actions

## Shared CRUD Rules

Every CRUD module must support, where relevant:

- list
- search
- filters
- sorting
- pagination or load more
- add
- edit
- duplicate
- publish/unpublish
- delete confirmation
- validation
- loading state
- empty state
- error state
- success feedback
- local persistence

## Profile Management

Required fields:

- full name
- display name
- title
- greeting
- headline
- description
- biography
- about content
- email
- WhatsApp
- location
- availability
- GitHub
- LinkedIn
- Instagram
- YouTube
- TikTok
- CV URL

## Hero Management

Target tabs:

- Shared Content
- Professional Mode
- Spider Mode
- Animation
- Splash and 3D

## Project CRUD

Project forms should include:

- identity and slug
- category, type, role, year, status, featured flag, and order
- tech stack
- short and full descriptions
- overview, background, objectives, target users, responsibilities, solution
- features, architecture, data structure, process, gallery
- challenges, decisions, testing, deployment, result
- live URL and source URL

## Tech Stack CRUD

Tech stack management should include icon selection, category, usage level, description, featured flag, active flag, and ordering. Do not require raw SVG editing from the admin user.

## Creative Work CRUD

Creative work management should include title, slug, category, role, year, tools, description, brief, cover, gallery, before/after images, video URL, duration, status, featured flag, and ordering.

## Experience CRUD

Experience management should include role, organization, type, period or dates, location, description, responsibilities, technologies, related project, published flag, and order.

## Certificate CRUD

Certificate management should include title, issuer, category, issue date, credential ID, credential URL, image, featured flag, published flag, and order.

## Comments

Comment moderation should support:

- approve
- hide
- pin
- reply
- delete
- bulk selection

## Messages

Message handling should support statuses `New`, `Read`, `Replied`, and `Archived`, plus reply actions where a real backend/email service exists.

## Media Library

Current media behavior is frontend-only:

- object URLs are temporary
- metadata may persist locally
- actual binary files are not permanently stored

The UI must communicate these limitations honestly.

## Site Settings

Target settings areas:

- General
- Navigation
- Sections
- Professional Mode
- Spider Mode
- Animation
- Contact
- SEO
- Data import/export/reset

## Mobile Admin

- Sidebar becomes a drawer.
- Tables become cards.
- Touch targets must be comfortable.
- Forms stack vertically.
- Actions remain reachable without hover.

## Future Backend Replacement

See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md).
