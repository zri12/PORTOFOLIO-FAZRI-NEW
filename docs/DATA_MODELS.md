# Data Models

## Current Models

Current TypeScript models live in `src/app/types/portfolio.ts`.

| Model | Current purpose |
| --- | --- |
| `Profile` | Owner identity, headline, about copy, contact details, social links, and CV URL. |
| `Project` | Web project case-study data, route slug, status, feature flag, stack, narrative sections, URLs, and ordering. |
| `Technology` | Technology stack item with category, level, icon key, status flags, and ordering. |
| `CreativeWork` | Creative archive item with category, tools, cover, gallery, before/after, video, status, and ordering. |
| `Experience` | Experience timeline item with role, organization, responsibilities, technologies, and related project slug. |
| `Certificate` | Certificate metadata and image. |
| `VisitorComment` | Guestbook/comment item with moderation state, likes, pinning, and admin reply. |
| `ContactMessage` | Contact form submission stored locally. |
| `MediaItem` | Local media metadata and object URL. |
| `SiteSettings` | Site-level toggles, SEO values, default mode, and feature visibility settings. |
| `PortfolioData` | Root aggregate for all portfolio content. |

Current enum-like unions:

- `PublishStatus`: `draft`, `published`, `archived`
- `LevelLabel`: `Main Stack`, `Frequently Used`, `Familiar`, `Currently Learning`
- Creative work categories: `UI/UX Design`, `Graphic Design`, `Photography`, `Videography`, `Photo Editing`, `Video Editing`
- Comment status: `pending`, `approved`, `hidden`
- Message status: `New`, `Read`, `Replied`, `Archived`

## Current Storage Schema

| Key | Owner | Purpose |
| --- | --- | --- |
| `fazri-portfolio-demo-v3` | `portfolioRepository` | Versioned local portfolio data. |
| `fazri-admin-session` | `authRepository` | Demo admin session in local or session storage. |

`portfolioRepository` normalizes invalid or older stored shapes against the current seed data. It can export JSON, import JSON, and reset demo data.

## Target Models

The target model shape below is an approved direction for future frontend/backend alignment. It is not fully implemented yet.

```ts
export interface Profile {
  id: string;
  fullName: string;
  displayName: string;
  title: string;
  headline: string;
  shortBiography: string;
  about: string;
  email: string;
  phone?: string;
  whatsapp: string;
  location: string;
  availability: string;
  cvUrl: string;
  socialLinks: SocialLink[];
  profileImage?: MediaAsset;
  professionalCharacterImage?: MediaAsset;
  spiderCharacterImage?: MediaAsset;
}

export interface HeroContent {
  greeting: string;
  name: string;
  title: string;
  headline: string;
  description: string;
  ctas: HeroCTA[];
  metadata: string[];
  defaultMode: "professional" | "spider";
  animation: HeroAnimationSettings;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  fullTitle: string;
  category: string;
  type: string;
  year: string;
  role: string;
  client?: string;
  status: PublishStatus;
  featured: boolean;
  displayOrder: number;
  shortDescription: string;
  overview: string;
  background: string;
  problem?: string;
  objectives: string[];
  targetUsers: string[];
  solution: string;
  responsibilities: string[];
  features: ProjectFeature[];
  technologies: string[];
  process: ProjectProcess[];
  challenges: string[];
  technicalDecisions: string[];
  testing: string;
  deployment: string;
  result: string;
  coverVisual?: MediaAsset;
  heroVisual?: MediaAsset;
  gallery: MediaAsset[];
  mobileScreens?: MediaAsset[];
  videoUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  seo?: SeoFields;
}

export interface ProjectFeature {
  id: string;
  title: string;
  description: string;
  iconKey?: string;
  image?: MediaAsset;
}

export interface ProjectProcess {
  id: string;
  order: number;
  title: string;
  description: string;
  visual?: MediaAsset;
}

export interface Technology {
  id: string;
  name: string;
  iconKey: string;
  category: "Frontend" | "Backend" | "Database" | "Deployment" | "Creative";
  usageLevel: "Main Stack" | "Frequently Used" | "Familiar" | "Currently Learning";
  description: string;
  websiteUrl?: string;
  active: boolean;
  featured: boolean;
  displayOrder: number;
}

export interface CreativeWork {
  id: string;
  slug: string;
  title: string;
  category: "UI/UX Design" | "Graphic Design" | "Photography" | "Videography" | "Photo Editing" | "Video Editing";
  role: string;
  client?: string;
  year: string;
  tools: string[];
  description: string;
  creativeBrief: string;
  cover?: MediaAsset;
  gallery: MediaAsset[];
  beforeImage?: MediaAsset;
  afterImage?: MediaAsset;
  videoUrl?: string;
  duration?: string;
  featured: boolean;
  status: PublishStatus;
  displayOrder: number;
  seo?: SeoFields;
}

export interface Experience {
  id: string;
  role: string;
  organization: string;
  type: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  location: string;
  description: string;
  responsibilities: string[];
  technologyIds: string[];
  relatedProjectId?: string;
  published: boolean;
  displayOrder: number;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  category: string;
  issueDate: string;
  credentialId?: string;
  credentialUrl?: string;
  image?: MediaAsset;
  featured: boolean;
  published: boolean;
  displayOrder: number;
}

export interface VisitorComment {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  message: string;
  createdAt: string;
  likes: number;
  status: "pending" | "approved" | "hidden";
  pinned: boolean;
  visible: boolean;
  adminReply?: string;
}

export interface ContactMessage {
  id: string;
  sender: string;
  email: string;
  whatsapp?: string;
  projectType: string;
  budgetRange: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "New" | "Read" | "Replied" | "Archived";
}

export interface MediaAsset {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  alt?: string;
  note?: string;
  createdAt: string;
  storageProvider?: "local-object-url" | "remote";
}

export interface SiteSettings {
  general: Record<string, unknown>;
  navigation: Record<string, unknown>;
  sections: Record<string, unknown>;
  professionalMode: Record<string, unknown>;
  spiderMode: Record<string, unknown>;
  animation: Record<string, unknown>;
  contact: Record<string, unknown>;
  seo: SeoFields;
}
```

## Media Persistence

Current media records may store metadata and temporary object URLs. Object URLs are session-limited and are not permanent uploads. The UI must not claim that local uploads are safely stored on a server.

## Validation

The current project does not install Zod. Validation is currently implemented through form logic and repository normalization. If schema validation is added later, choose a library deliberately and document the migration in this file.
