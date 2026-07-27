import type { Technology } from "../types/portfolio";

export type TechnologyCatalogItem = Pick<Technology, "name" | "category">;

const catalogGroups: Array<{
  category: Technology["category"];
  names: string[];
}> = [
  {
    category: "Frontend",
    names: [
      "HTML5", "CSS3", "Sass", "JavaScript", "TypeScript", "React", "Vue.js", "Angular",
      "Svelte", "Next.js", "Nuxt.js", "Vite", "Tailwind CSS", "Bootstrap", "Material UI",
      "shadcn/ui", "Framer Motion", "GSAP",
    ],
  },
  {
    category: "Backend",
    names: [
      "Laravel", "PHP", "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI",
      "Ruby on Rails", "Java", "Spring Boot", ".NET",
    ],
  },
  {
    category: "Database",
    names: [
      "MySQL", "PostgreSQL", "Supabase", "Firebase", "MongoDB", "SQLite", "Redis",
      "Prisma", "MariaDB",
    ],
  },
  {
    category: "Deployment",
    names: [
      "Git", "GitHub", "GitLab", "Docker", "Vercel", "Netlify", "cPanel", "XAMPP",
      "Nginx", "Cloudflare", "AWS", "DigitalOcean",
    ],
  },
  {
    category: "Creative",
    names: [
      "Figma", "Adobe XD", "Framer", "Webflow", "Miro", "Canva", "Photoshop",
      "Illustrator", "InDesign", "Lightroom", "Premiere Pro", "After Effects", "Audition",
      "DaVinci Resolve", "CapCut", "Blender", "Cinema 4D", "OBS",
    ],
  },
];

export const technologyCatalog: TechnologyCatalogItem[] = catalogGroups.flatMap(({ category, names }) =>
  names.map((name) => ({ name, category })),
);

export function findCatalogTechnology(name: string) {
  const normalizedName = name.trim().toLocaleLowerCase();
  return technologyCatalog.find((item) => item.name.toLocaleLowerCase() === normalizedName);
}

export function inferTechnologyCategory(name: string): Technology["category"] {
  const catalogItem = findCatalogTechnology(name);
  if (catalogItem) return catalogItem.category;

  const normalizedName = name.toLocaleLowerCase();
  if (/(design|photo|video|creative|adobe|figma|canva|blender|cinema|davinci|capcut|obs)/.test(normalizedName)) return "Creative";
  if (/(sql|database|mongo|redis|firebase|supabase|prisma)/.test(normalizedName)) return "Database";
  if (/(docker|deploy|hosting|vercel|netlify|cpanel|cloud|git|nginx|xampp)/.test(normalizedName)) return "Deployment";
  if (/(php|laravel|node|express|nest|django|flask|fastapi|spring|backend|server|api)/.test(normalizedName)) return "Backend";
  return "Frontend";
}

export function technologyIconKey(name: string) {
  return name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "");
}
