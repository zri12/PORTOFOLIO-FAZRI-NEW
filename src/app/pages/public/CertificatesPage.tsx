import { useState } from "react";
import { Award, Search, X } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionHeading } from "../../components/common/SectionHeading";
import { useLanguage } from "../../context/LanguageContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { usePortfolioData } from "../../hooks/usePortfolioData";

export default function CertificatesPage() {
  const { certificates } = usePortfolioData();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState<string | null>(null);
  useDocumentMeta({ title: "Certificates - Fazri", description: "Selected certificates and achievements from Fazri Lukman Nurrohman's learning journey." });

  const categories = ["All", ...Array.from(new Set(certificates.map((item) => item.category)))];
  const filtered = certificates.filter((item) => (category === "All" || item.category === category) && `${item.title} ${item.issuer}`.toLowerCase().includes(query.toLowerCase()));
  const featured = certificates.find((item) => item.featured) || certificates[0];
  const modal = certificates.find((item) => item.id === active);

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] pt-24 text-[var(--color-text-main)] sm:pt-28 lg:pt-32">
      <section className="px-5 pb-12 sm:px-6 sm:pb-14">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow={t("Recognition")} title={t("Certificates and learning milestones.")} description={t("A concise archive of learning credentials that support the web development and design practice.")} />
          {featured && (
            <button onClick={() => setActive(featured.id)} className="mt-12 grid w-full overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-left lg:grid-cols-[1fr_.8fr]">
              <div className="p-6 sm:p-8">
                <Award className="text-[var(--color-accent-main)]" />
                <p className="mt-10 font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-accent-main)] sm:mt-16">{t("Featured certificate")}</p>
                <h2 className="mt-3 font-manrope text-2xl font-bold sm:text-3xl">{t(featured.title)}</h2>
                <p className="mt-3 text-[var(--color-text-secondary)]">{featured.issuer} / {featured.issueDate}</p>
              </div>
              <div className="flex min-h-[280px] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,rgba(78,187,232,.22),transparent_48%),var(--color-bg-primary)] p-4">
                <img
                  src={featured.image}
                  alt=""
                  aria-hidden="true"
                  className="h-auto max-h-[520px] w-full object-contain"
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                />
              </div>
            </button>
          )}
        </div>
      </section>
      <section className="px-5 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 border-y border-[var(--color-border)] py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`border px-4 py-2 text-sm font-semibold ${category === item ? "border-[var(--color-text-main)] bg-[var(--color-text-main)] text-[var(--color-bg-primary)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)]"}`}>{t(item)}</button>)}
            </div>
            <label className="relative lg:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search certificates...")} className="w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-accent-main)]" />
            </label>
          </div>
          {filtered.length === 0 ? <EmptyState title={t("No certificates found")} description={t("Try a different search or category.")} /> : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <button key={item.id} onClick={() => setActive(item.id)} className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-left transition hover:-translate-y-1 hover:border-[var(--color-accent-main)]">
                  <div className="flex min-h-[180px] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,rgba(78,187,232,.2),transparent_48%),var(--color-bg-primary)] p-3">
                    <img
                      src={item.image}
                      alt=""
                      aria-hidden="true"
                      className="h-auto max-h-[360px] w-full object-contain"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.hidden = true;
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-accent-main)]">{t(item.category)}</p>
                    <h2 className="mt-3 font-manrope text-xl font-bold">{t(item.title)}</h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{item.issuer} / {item.issueDate}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5">
              <h2 className="font-manrope text-2xl font-bold">{t(modal.title)}</h2>
              <button onClick={() => setActive(null)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]" aria-label={t("Close certificate preview")}><X size={20} /></button>
            </div>
            <img src={modal.image} alt={modal.title} className="h-auto w-full object-contain" />
            <div className="grid gap-4 p-5 text-sm text-[var(--color-text-secondary)] md:grid-cols-3">
              <p><span className="block text-[var(--color-text-muted)]">{t("Issuer")}</span>{modal.issuer}</p>
              <p><span className="block text-[var(--color-text-muted)]">{t("Credential ID")}</span>{modal.credentialId}</p>
              <a href={modal.credentialUrl} target="_blank" rel="noreferrer" className="text-[var(--color-accent-main)]">{t("Open credential")}</a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
