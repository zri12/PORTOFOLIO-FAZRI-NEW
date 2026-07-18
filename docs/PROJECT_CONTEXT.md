# Project Context

## Owner

Fazri Lukman Nurrohman.

## Personal Branding

Primary identity: Creative Web Developer.

Primary focus: Web Development.

Supporting capabilities:

- UI Design
- Graphic Design
- Photography
- Videography
- Photo Editing
- Video Editing

## Main Objective

The project is a premium personal portfolio demonstrating web-development capability, interactive frontend design, visual storytelling, and full-stack thinking through a public portfolio and frontend CMS prototype.

## Target Audience

- recruiters
- companies
- freelance clients
- collaborators
- lecturers or academic reviewers
- potential creative clients

## Content Priority

| Area | Target balance | Rule |
| --- | --- | --- |
| Web Development | Approximately 70% | Must remain visually and structurally dominant. |
| Creative Work | Approximately 30% | Supports the developer identity without overtaking it. |

## Core Product Areas

- public portfolio
- project case studies
- creative works
- certificates
- contact and guestbook
- Professional Mode
- Spider Mode
- frontend admin CMS

## Visual Modes

### Professional Mode

Professional Mode is the default mode. It uses graphite and dark navy surfaces, restrained cyan, teal, and silver accents, calm motion, and a clean application/interface visual language. It should feel premium and recruiter-friendly.

### Spider Mode

Spider Mode is an original spider-inspired alternate identity. It uses black, crimson, red, and limited electric-blue accents, web geometry, connected nodes, stronger directional motion, and a more cinematic mood while remaining professional.

Spider Mode must not use official franchise branding and must not be a simple red recolor. It uses the same content and routes as Professional Mode.

## Current Frontend Scope

The current repository implements a Vite React frontend with:

- public routes for home, about, projects, project details, creative works, creative work details, certificates, contact, and not found
- admin routes under `/admin`
- demo admin login using browser storage
- typed seed data in `src/app/data/seed/portfolioSeed.ts`
- a repository abstraction in `src/app/repositories/portfolioRepository.ts`
- local persistence using the key `fazri-portfolio-demo-v3`
- simulated auth persistence using the key `fazri-admin-session`
- Professional and Spider visual modes
- layered character reveal in the hero
- a Three.js hero scene
- GSAP, Motion, and Lenis dependencies available for animation

## Planned Frontend Scope

Planned frontend improvements include:

- reducing oversized page components, especially the homepage, into smaller sections
- completing admin CRUD parity and validation for every content type
- improving technology logos and visual mockup details
- adding stronger reduced-motion and WebGL fallbacks where needed
- improving bundle splitting if production bundle size becomes a concern
- expanding visual QA across mobile breakpoints

## Future Backend Scope

Future backend work should add real authentication, authorization, database persistence, media storage, contact delivery, server-side validation, moderation tools, and audit history. See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md).

## Non-Goals

For the current frontend stage, the project does not include:

- production authentication
- server storage
- payment processing
- fake analytics
- fake business metrics
- copied franchise assets
