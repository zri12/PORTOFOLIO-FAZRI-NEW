import { localizedPath } from "./seo";

type PersonInput = { fullName: string; title: string; description: string; image?: string; socialUrls?: string[]; skills?: string[] };
type CertificateInput = { title: string; category?: string; issuer?: string; issueDate?: string; image?: string };

export function personStructuredData(siteUrl: string, person: PersonInput) {
  const base = siteUrl.replace(/\/$/, "");
  return { "@type": "Person", "@id": `${base}/#person`, name: person.fullName, url: base, jobTitle: person.title, description: person.description, image: person.image || undefined, sameAs: person.socialUrls?.filter(Boolean), knowsAbout: person.skills?.filter(Boolean) };
}

export function breadcrumbStructuredData(siteUrl: string, language: "en" | "id", items: Array<{ name: string; path?: string }>) {
  const base = siteUrl.replace(/\/$/, "");
  return { "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.path ? `${base}${localizedPath(item.path, language)}` : undefined })) };
}

export function certificateStructuredData(siteUrl: string, language: "en" | "id", canonicalPath: string, certificate: CertificateInput) {
  const base = siteUrl.replace(/\/$/, "");
  const canonicalUrl = `${base}${localizedPath(canonicalPath, language)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOccupationalCredential",
        "@id": `${canonicalUrl}#credential`,
        name: certificate.title,
        credentialCategory: certificate.category || undefined,
        recognizedBy: certificate.issuer ? { "@type": "Organization", name: certificate.issuer } : undefined,
        dateCreated: certificate.issueDate || undefined,
        url: canonicalUrl,
        image: certificate.image || undefined,
      },
      breadcrumbStructuredData(siteUrl, language, [
        { name: language === "id" ? "Beranda" : "Home", path: "/" },
        { name: language === "id" ? "Sertifikat" : "Certificates", path: "/certificates" },
        { name: certificate.title, path: canonicalPath },
      ]),
    ],
  };
}
