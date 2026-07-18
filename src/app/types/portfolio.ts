export type PublishStatus = "draft" | "published" | "archived";
export type LevelLabel = "Main Stack" | "Frequently Used" | "Familiar" | "Currently Learning";

export interface Profile {
  fullName: string;
  displayName: string;
  title: string;
  greeting: string;
  headline: string;
  description: string;
  biography: string;
  aboutContent: string;
  email: string;
  whatsapp: string;
  location: string;
  availability: string;
  github: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  cvUrl: string;
  logoUrl: string;
  faviconUrl: string;
  aboutImageUrl: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  fullName: string;
  category: string;
  type: string;
  role: string;
  year: string;
  status: PublishStatus;
  featured: boolean;
  clientType: "Academic Project" | "Client Work" | "Personal Project";
  techStack: string[];
  shortDescription: string;
  fullDescription: string;
  overview: string;
  background: string;
  objectives: string[];
  targetUsers: string[];
  responsibilities: string[];
  solution: string;
  features: string[];
  architecture: string;
  dataStructure: string;
  process: string[];
  gallery: string[];
  challenges: string[];
  decisions: string[];
  testing: string;
  deployment: string;
  result: string;
  liveUrl: string;
  sourceUrl: string;
  coverImage: string;
  heroImage: string;
  mobilePreviewImage: string;
  relatedProjectSlug?: string;
  displayOrder: number;
}

export interface Technology {
  id: string;
  name: string;
  iconKey: string;
  logoUrl: string;
  category: "Frontend" | "Backend" | "Database" | "Deployment" | "Creative";
  level: LevelLabel;
  description: string;
  featured: boolean;
  active: boolean;
  displayOrder: number;
}

export interface CreativeWork {
  id: string;
  slug: string;
  title: string;
  category: "UI/UX Design" | "Graphic Design" | "Photography" | "Videography" | "Photo Editing" | "Video Editing";
  role: string;
  year: string;
  tools: string[];
  description: string;
  brief: string;
  cover: string;
  gallery: string[];
  beforeImage?: string;
  afterImage?: string;
  videoUrl?: string;
  duration?: string;
  featured: boolean;
  status: PublishStatus;
  displayOrder: number;
}

export interface Experience {
  id: string;
  role: string;
  organization: string;
  type: string;
  period: string;
  location: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  relatedProjectSlug?: string;
  published: boolean;
  displayOrder: number;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  category: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
  image: string;
  featured: boolean;
  published: boolean;
  displayOrder: number;
}

export interface VisitorComment {
  id: string;
  name: string;
  email: string;
  avatar: string;
  message: string;
  date: string;
  likes: number;
  reply?: string;
  adminReply?: string;
  pinned: boolean;
  status: "pending" | "approved" | "hidden";
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  projectType: string;
  budgetRange: string;
  subject: string;
  message: string;
  date: string;
  status: "New" | "Read" | "Replied" | "Archived";
}

export interface MediaItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  note: string;
  createdAt: string;
}

export interface SiteSettings {
  websiteName: string;
  description: string;
  language: string;
  copyright: string;
  defaultMode: "professional" | "spider";
  smoothScroll: boolean;
  splashEnabled: boolean;
  threeEnabled: boolean;
  commentsEnabled: boolean;
  contactEnabled: boolean;
  seoTitle: string;
  seoDescription: string;
  keywords: string;
}

export interface PortfolioData {
  profile: Profile;
  projects: Project[];
  techStack: Technology[];
  creativeWorks: CreativeWork[];
  experiences: Experience[];
  certificates: Certificate[];
  comments: VisitorComment[];
  messages: ContactMessage[];
  media: MediaItem[];
  settings: SiteSettings;
}
