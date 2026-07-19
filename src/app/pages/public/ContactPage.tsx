import { useMemo, useState } from "react";
import type React from "react";
import { CheckCircle, Github, Instagram, Linkedin, Mail, MapPin, MessageCircle, Send, Smartphone, Youtube } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionHeading } from "../../components/common/SectionHeading";
import { useLanguage } from "../../context/LanguageContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { isSupabaseEnabled } from "../../lib/supabase/client";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import { supabasePortfolioRepository } from "../../repositories/supabasePortfolioRepository";

const projectTypes = ["Website", "Web Application", "Dashboard", "UI Implementation", "Website Maintenance", "UI Design", "Graphic Design", "Photography", "Videography", "Editing", "Other"];
const budgets = ["Under Rp1 million", "Rp1-3 million", "Rp3-5 million", "Rp5-10 million", "More than Rp10 million", "Discuss first"];

export default function ContactPage() {
  const { profile, comments, settings } = usePortfolioData();
  const { t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [commentSort, setCommentSort] = useState("Newest");
  const [commentDraft, setCommentDraft] = useState({ name: "", email: "", message: "" });
  const [commentStatus, setCommentStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useDocumentMeta({ title: "Contact - Fazri Lukman Nurrohman", description: "Start a web development, interface, or creative collaboration with Fazri Lukman Nurrohman." });

  const visibleComments = useMemo(() => {
    const approved = comments.filter((comment) => comment.status === "approved");
    return [...approved].sort((a, b) => commentSort === "Most liked" ? b.likes - a.likes : b.date.localeCompare(a.date));
  }, [commentSort, comments]);

  const submitContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();
    if (!name || !email.includes("@") || message.length < 10) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const payload = {
        name,
        email,
        whatsapp: String(form.get("whatsapp") || ""),
        projectType: String(form.get("projectType") || "Other"),
        budgetRange: String(form.get("budgetRange") || "Discuss first"),
        subject: String(form.get("subject") || "Portfolio inquiry"),
        message,
      };
      if (isSupabaseEnabled) {
        await supabasePortfolioRepository.submitContact(payload);
        await portfolioRepository.refresh();
      } else {
        portfolioRepository.createMessage(payload);
      }
      formElement.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!commentDraft.name.trim() || !commentDraft.email.includes("@") || commentDraft.message.trim().length < 5) return;
    setCommentStatus("submitting");
    const payload = { ...commentDraft, avatar: commentDraft.name.slice(0, 2).toUpperCase() };
    try {
      if (isSupabaseEnabled) {
        await supabasePortfolioRepository.submitComment(payload);
        await portfolioRepository.refresh();
      } else {
        portfolioRepository.createComment(payload);
      }
      setCommentDraft({ name: "", email: "", message: "" });
      setCommentStatus("success");
    } catch {
      setCommentStatus("error");
    }
  };

  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--color-bg-primary)] pt-24 text-[var(--color-text-main)] sm:pt-28 lg:pt-32">
      <section className="px-5 pb-12 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Contact" title="Let's build something meaningful." description="Have a website, digital product, dashboard, or creative idea in mind? Share the context and the next step can start clearly." />
        </div>
      </section>
      <section className="px-5 pb-20 sm:px-6 sm:pb-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-8">
            <form onSubmit={submitContact} className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 sm:p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label={t("Name")} name="name" required />
                <Field label={t("Email")} name="email" type="email" required />
                <Field label="WhatsApp" name="whatsapp" />
                <Field label={t("Subject")} name="subject" required />
                <Select label={t("Project Type")} name="projectType" options={projectTypes} t={t} />
                <Select label={t("Budget Range")} name="budgetRange" options={budgets} t={t} />
              </div>
              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">{t("Message")}</span>
                <textarea name="message" required rows={6} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 outline-none focus:border-[var(--color-accent-main)]" placeholder={t("Tell me about the goal, audience, timeline, and what already exists.")} />
              </label>
              {status === "error" && <p className="mt-4 text-sm text-red-300">{t("Please provide a valid email and a message with at least 10 characters.")}</p>}
              {status === "success" && <p className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-300"><CheckCircle size={16} /> {t("Message sent successfully.")}</p>}
              <button disabled={status === "submitting"} className="mt-6 inline-flex items-center gap-2 bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)] disabled:opacity-60">{status === "submitting" ? t("Sending...") : t("Send Message")} <Send size={16} /></button>
            </form>

            <div className="grid gap-4 md:grid-cols-2">
              <ContactCard icon={<Mail />} label="Email" value={profile.email} href={`mailto:${profile.email}`} />
              <ContactCard icon={<Smartphone />} label="WhatsApp" value={t("Start Chat")} href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} />
              <ContactCard icon={<Linkedin />} label="LinkedIn" value="@fazrilukman" href={profile.linkedin} />
              <ContactCard icon={<Github />} label="GitHub" value="@fazrilukman" href={profile.github} />
              <ContactCard icon={<Instagram />} label="Instagram" value="@fazrilukman" href={profile.instagram} />
              <ContactCard icon={<Youtube />} label="YouTube" value="@fazrilukman" href={profile.youtube} />
              <div className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 md:col-span-2">
                <MapPin className="text-[var(--color-accent-main)]" />
                <p className="mt-4 font-bold">{profile.location}</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t(profile.availability)}</p>
              </div>
            </div>
          </div>

          <aside className="min-w-0 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 sm:p-6 md:p-8">
            <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[var(--color-accent-main)]">{t("Guestbook")}</p>
                <h2 className="mt-2 font-manrope text-2xl font-bold">{t("Visitor Comments")}</h2>
              </div>
              <select value={commentSort} onChange={(event) => setCommentSort(event.target.value)} className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm">
                <option value="Newest">{t("Newest")}</option>
                <option value="Most liked">{t("Most liked")}</option>
              </select>
            </div>
            {settings.commentsEnabled ? (
              <>
                <form onSubmit={submitComment} className="my-6 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={commentDraft.name} onChange={(event) => setCommentDraft({ ...commentDraft, name: event.target.value })} placeholder={t("Name")} className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent-main)]" />
                    <input value={commentDraft.email} onChange={(event) => setCommentDraft({ ...commentDraft, email: event.target.value })} placeholder={t("Email (hidden)")} className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent-main)]" />
                  </div>
                  <textarea value={commentDraft.message} onChange={(event) => setCommentDraft({ ...commentDraft, message: event.target.value })} placeholder={t("Leave a comment...")} rows={3} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent-main)]" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">{commentDraft.message.length}/500</span>
                    <button disabled={commentStatus === "submitting"} className="bg-[var(--color-text-main)] px-4 py-2 text-sm font-bold text-[var(--color-bg-primary)] disabled:opacity-60">{commentStatus === "submitting" ? t("Sending...") : t("Post")}</button>
                  </div>
                  {commentStatus === "success" && <p className="text-xs text-emerald-300">{t("Comment saved as pending for admin review.")}</p>}
                  {commentStatus === "error" && <p className="text-xs text-red-300">{t("Please provide a valid email and a message with at least 10 characters.")}</p>}
                </form>
                <div className="space-y-6">
                  {visibleComments.length === 0 ? <EmptyState title="No visible comments yet" description="Approved comments will appear here." /> : visibleComments.map((comment) => (
                    <article key={comment.id} className="border-b border-[var(--color-border)] pb-5 last:border-0">
                      <div className="flex gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-main)]/15 text-sm font-bold text-[var(--color-accent-main)]">{comment.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold">{comment.name}</h3>
                            <span className="text-xs text-[var(--color-text-muted)]">{comment.date}</span>
                            {comment.pinned && <span className="ml-auto border border-[var(--color-accent-main)]/30 px-2 py-0.5 text-[10px] text-[var(--color-accent-main)]">{t("Pinned")}</span>}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{comment.message}</p>
                          {comment.adminReply && <p className="mt-3 border-l border-[var(--color-accent-main)] pl-3 text-xs leading-5 text-[var(--color-text-muted)]">{t("Admin reply:")} {t(comment.adminReply)}</p>}
                          <button onClick={() => portfolioRepository.likeComment(comment)} className="mt-3 inline-flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"><MessageCircle size={13} /> {t("Like")} ({comment.likes})</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : <EmptyState title="Comments are closed" description="The admin settings currently disable visitor comments." />}
          </aside>
        </div>
      </section>
    </main>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label><span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">{label}</span><input name={name} type={type} required={required} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3 outline-none focus:border-[var(--color-accent-main)]" /></label>;
}

function Select({ label, name, options, t }: { label: string; name: string; options: string[]; t: (value: string) => string }) {
  return <label><span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">{label}</span><select name={name} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3 outline-none focus:border-[var(--color-accent-main)]">{options.map((option) => <option key={option} value={option}>{t(option)}</option>)}</select></label>;
}

function ContactCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 transition hover:-translate-y-1 hover:border-[var(--color-accent-main)]"><span className="text-[var(--color-accent-main)]">{icon}</span><p className="mt-4 font-bold">{label}</p><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{value}</p></a>;
}
