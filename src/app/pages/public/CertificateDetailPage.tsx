import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router";
import { EmptyState } from "../../components/common/EmptyState";
import { useLanguage } from "../../context/LanguageContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { localizeCertificate } from "../../lib/localizedContent";
import { localizedPath } from "../../lib/seo";
import { certificateStructuredData } from "../../lib/seoStructuredData";

export default function CertificateDetailPage() {
  const { slug = "" } = useParams();
  const { certificates, settings, profile } = usePortfolioData();
  const { language, t } = useLanguage();
  const source = certificates.find((item) => item.slug === slug && item.published);
  const certificate = source ? localizeCertificate(source, language) : undefined;
  const canonicalPath = `/certificates/${slug}`;
  const schema = certificate ? certificateStructuredData(settings.siteUrl, language, canonicalPath, certificate) : undefined;

  useDocumentMeta({
    title: certificate ? `${certificate.title} | ${profile.fullName}` : `Certificate not found | ${profile.fullName}`,
    description: certificate ? `${certificate.title}${certificate.issuer ? ` by ${certificate.issuer}` : ""}.` : "Certificate not found.",
    canonicalPath,
    siteUrl: settings.siteUrl,
    image: certificate?.image || settings.seoImage,
    imageAlt: certificate?.title,
    noIndex: !certificate,
    language,
    structuredData: schema,
  });

  if (!certificate) return <main className="min-h-[65vh] bg-[var(--color-bg-primary)] px-6 pt-32"><div className="mx-auto max-w-4xl"><EmptyState title={t("Certificate not found")} description={t("The selected certificate is unavailable.")} /><Link to={localizedPath("/certificates", language)} className="mt-6 inline-flex items-center gap-2 text-[var(--color-accent-main)]"><ArrowLeft size={16} /> {t("Back to Certificates")}</Link></div></main>;

  return <main className="min-h-screen bg-[var(--color-bg-primary)] px-5 pb-20 pt-28 text-[var(--color-text-main)] sm:px-6 sm:pt-32">
    <article className="mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap gap-2 text-sm text-[var(--color-text-muted)]"><Link to={localizedPath("/", language)}>{t("Home")}</Link><span>/</span><Link to={localizedPath("/certificates", language)}>{t("Certificates")}</Link><span>/</span><span>{certificate.title}</span></nav>
      <Link to={localizedPath("/certificates", language)} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-text-secondary)]"><ArrowLeft size={16} /> {t("Back to Certificates")}</Link>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
        <div className="flex min-h-[320px] items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">{certificate.image ? <img src={certificate.image} alt={certificate.title} className="h-auto max-h-[720px] w-full object-contain" /> : <span className="text-sm text-[var(--color-text-muted)]">{t("Certificate image unavailable")}</span>}</div>
        <div><p className="font-mono text-xs uppercase tracking-[.18em] text-[var(--color-accent-main)]">{certificate.category}</p><h1 className="mt-5 font-manrope text-4xl font-bold tracking-tight sm:text-5xl">{certificate.title}</h1><dl className="mt-9 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]"><Detail label={t("Issuer")} value={certificate.issuer} /><Detail label={t("Issue Date")} value={certificate.issueDate} />{certificate.credentialId && <Detail label={t("Credential ID")} value={certificate.credentialId} />}</dl>{certificate.credentialUrl && <a href={certificate.credentialUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 border-b border-[var(--color-accent-main)] pb-2 font-bold text-[var(--color-accent-main)]">{t("Open credential")} <ExternalLink size={16} /></a>}</div>
      </div>
    </article>
  </main>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="py-4"><dt className="text-xs text-[var(--color-text-muted)]">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>; }
