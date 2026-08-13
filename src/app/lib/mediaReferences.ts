import type { MediaItem, PortfolioData } from "../types/portfolio";

function includesAsset(value: string | undefined, url: string) { return Boolean(value && (value === url || value.includes(url) || url.includes(value))); }

export function findMediaReferences(data: PortfolioData, media: MediaItem) {
  const references: string[] = [];
  const add = (label: string, value: string | undefined) => { if (includesAsset(value, media.url)) references.push(label); };
  add("Profile logo", data.profile.logoUrl); add("Profile favicon", data.profile.faviconUrl); add("Profile image", data.profile.aboutImageUrl); add("Profile CV", data.profile.cvUrl); add("SEO image", data.settings.seoImage);
  data.projects.forEach((item) => { add(`Project: ${item.title} cover`, item.coverImage); add(`Project: ${item.title} hero`, item.heroImage); add(`Project: ${item.title} mobile`, item.mobilePreviewImage); item.gallery.forEach((image) => add(`Project: ${item.title} gallery`, image)); });
  data.techStack.forEach((item) => add(`Technology: ${item.name}`, item.logoUrl));
  data.creativeWorks.forEach((item) => { add(`Creative: ${item.title} cover`, item.cover); add(`Creative: ${item.title} before`, item.beforeImage); add(`Creative: ${item.title} after`, item.afterImage); item.gallery.forEach((image) => add(`Creative: ${item.title} gallery`, image)); });
  data.certificates.forEach((item) => add(`Certificate: ${item.title}`, item.image));
  data.articles.forEach((item) => { add(`Article: ${item.title} cover`, item.coverImage); item.blocks.forEach((block) => { if (block.type === "image") add(`Article: ${item.title} block`, block.url); }); });
  return references;
}
