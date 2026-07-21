import type {
  Article,
  Certificate,
  ContactMessage,
  CreativeWork,
  Experience,
  MediaItem,
  PortfolioData,
  Project,
  SiteSettings,
  Technology,
  VisitorComment,
} from "../types/portfolio";

export interface PortfolioRepository {
  subscribe(callback: () => void): () => void;
  getSnapshot(): PortfolioData;
  refresh(): Promise<PortfolioData>;
  getProfile(): PortfolioData["profile"];
  updateProfile(profile: PortfolioData["profile"]): PortfolioData["profile"];
  getProjects(): Project[];
  getProjectById(id: string): Project | undefined;
  getProjectBySlug(slug: string): Project | undefined;
  createProject(project: Partial<Project>): Project;
  updateProject(project: Project): Project | undefined;
  deleteProject(id: string): void;
  duplicateProject(id: string): Project | undefined;
  getTechStack(): Technology[];
  createTechnology(item: Partial<Technology>): Technology;
  updateTechnology(item: Technology): void;
  deleteTechnology(id: string): void;
  getCreativeWorks(): CreativeWork[];
  getCreativeWorkBySlug(slug: string): CreativeWork | undefined;
  createCreativeWork(item: Partial<CreativeWork>): CreativeWork;
  updateCreativeWork(item: CreativeWork): void;
  deleteCreativeWork(id: string): void;
  getExperiences(): Experience[];
  createExperience(item: Partial<Experience>): Experience;
  updateExperience(item: Experience): void;
  deleteExperience(id: string): void;
  getCertificates(): Certificate[];
  createCertificate(item: Partial<Certificate>): Certificate;
  updateCertificate(item: Certificate): void;
  deleteCertificate(id: string): void;
  getArticles(): Article[];
  getArticleById(id: string): Article | undefined;
  getArticleBySlug(slug: string): Article | undefined;
  createArticle(item: Partial<Article>): Article;
  updateArticle(item: Article): void;
  deleteArticle(id: string): void;
  getComments(): VisitorComment[];
  createComment(item: Omit<VisitorComment, "id" | "date" | "likes" | "pinned" | "status">): VisitorComment;
  updateComment(item: VisitorComment): void;
  deleteComment(id: string): void;
  likeComment(comment: VisitorComment): void;
  getMessages(): ContactMessage[];
  createMessage(item: Omit<ContactMessage, "id" | "date" | "status">): ContactMessage;
  updateMessage(item: ContactMessage): void;
  deleteMessage(id: string): void;
  getMedia(): MediaItem[];
  createMedia(item: Omit<MediaItem, "id" | "createdAt">): MediaItem;
  deleteMedia(id: string): void;
  getSettings(): SiteSettings;
  updateSettings(settings: SiteSettings): SiteSettings;
  exportData(): string;
  importData(json: string): PortfolioData;
  resetDemoData(): PortfolioData;
}
