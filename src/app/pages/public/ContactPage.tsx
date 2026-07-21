import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import {
  ArrowUpRight,
  AtSign,
  CheckCircle,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageSquareReply,
  MessageSquareText,
  Send,
  Smartphone,
  Sparkles,
  ThumbsUp,
  X,
  Youtube,
} from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { useLanguage } from "../../context/LanguageContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { isSupabaseEnabled } from "../../lib/supabase/client";
import { portfolioRepository } from "../../repositories/portfolioRepository";
import { supabasePortfolioRepository } from "../../repositories/supabasePortfolioRepository";
import type { VisitorComment } from "../../types/portfolio";

const projectTypes = ["Website", "Web Application", "Dashboard", "UI Implementation", "Website Maintenance", "UI Design", "Graphic Design", "Photography", "Videography", "Editing", "Other"];
const budgets = ["Under Rp1 million", "Rp1-3 million", "Rp3-5 million", "Rp5-10 million", "More than Rp10 million", "Discuss first"];
const LIKED_COMMENTS_KEY = "fazri-portfolio-liked-comments-v3";
const PENDING_COMMENTS_KEY = "fazri-portfolio-pending-comments-v1";

type LocalVisitorComment = VisitorComment;

function readLikedCommentBases() {
  if (typeof window === "undefined") return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(LIKED_COMMENTS_KEY) || "{}") as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === "number"));
  } catch {
    window.localStorage.removeItem(LIKED_COMMENTS_KEY);
    return {};
  }
}

function writeLikedCommentBases(values: Record<string, number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LIKED_COMMENTS_KEY, JSON.stringify(values));
}

function readPendingComments() {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(PENDING_COMMENTS_KEY) || "[]") as unknown;
    return Array.isArray(value) ? value.filter((item): item is LocalVisitorComment => Boolean(item && typeof item === "object" && "id" in item && "message" in item)) : [];
  } catch {
    window.localStorage.removeItem(PENDING_COMMENTS_KEY);
    return [];
  }
}

function writePendingComments(comments: LocalVisitorComment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_COMMENTS_KEY, JSON.stringify(comments.slice(0, 20)));
}

function commentMatchKey(comment: Pick<VisitorComment, "name" | "message">) {
  return `${comment.name.trim().toLowerCase()}::${comment.message.trim().toLowerCase()}`;
}

export default function ContactPage() {
  const { profile, comments, settings } = usePortfolioData();
  const { t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");
  const [commentSort, setCommentSort] = useState("Newest");
  const [commentDraft, setCommentDraft] = useState({ name: "", email: "", message: "" });
  const [commentStatus, setCommentStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [pendingComments, setPendingComments] = useState<LocalVisitorComment[]>(readPendingComments);
  const [likedCommentBases, setLikedCommentBases] = useState<Record<string, number>>(readLikedCommentBases);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const commentMessageRef = useRef<HTMLTextAreaElement>(null);

  useDocumentMeta({ title: "Contact - Fazri Lukman Nurrohman", description: "Start a web development, interface, or creative collaboration with Fazri Lukman Nurrohman." });

  const visibleComments = useMemo(() => {
    const pendingKeys = new Set(pendingComments.map(commentMatchKey));
    const visible = comments.filter((comment) => comment.status === "approved" || (comment.status === "pending" && !pendingKeys.has(commentMatchKey(comment))));
    return [...visible].sort((a, b) => commentSort === "Most liked" ? b.likes - a.likes : b.date.localeCompare(a.date));
  }, [commentSort, comments, pendingComments]);
  const visibleTopLevelComments = useMemo(() => visibleComments.filter((comment) => !comment.replyToId), [visibleComments]);
  const visibleRepliesByParent = useMemo(() => visibleComments.reduce<Record<string, VisitorComment[]>>((grouped, comment) => {
    if (!comment.replyToId) return grouped;
    grouped[comment.replyToId] = [...(grouped[comment.replyToId] || []), comment];
    return grouped;
  }, {}), [visibleComments]);
  const standalonePendingComments = useMemo(() => pendingComments.filter((comment) => !comment.replyToId), [pendingComments]);
  const pendingRepliesByParent = useMemo(() => pendingComments.reduce<Record<string, LocalVisitorComment[]>>((grouped, comment) => {
    if (!comment.replyToId) return grouped;
    grouped[comment.replyToId] = [...(grouped[comment.replyToId] || []), comment];
    return grouped;
  }, {}), [pendingComments]);

  useEffect(() => {
    const backendKeys = new Set(comments.filter((comment) => comment.status === "approved").map(commentMatchKey));
    if (backendKeys.size === 0) return;
    setPendingComments((items) => {
      const next = items.filter((comment) => !backendKeys.has(commentMatchKey(comment)));
      if (next.length === items.length) return items;
      writePendingComments(next);
      return next;
    });
  }, [comments]);

  const contactChannels = [
    { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}`, meta: "Direct project inquiry" },
    { icon: Smartphone, label: "WhatsApp", value: t("Start Chat"), href: `https://wa.me/${(profile.whatsapp || "").replace(/\D/g, "")}`, meta: "Quick introduction" },
    { icon: Linkedin, label: "LinkedIn", value: "@fazrilukman", href: profile.linkedin, meta: "Professional profile" },
    { icon: Github, label: "GitHub", value: "@fazrilukman", href: profile.github, meta: "Code and repositories" },
    { icon: Instagram, label: "Instagram", value: "@fazrilukman", href: profile.instagram, meta: "Visual practice" },
    { icon: Youtube, label: "YouTube", value: "@fazrilukman", href: profile.youtube, meta: "Video archive" },
  ].filter((item) => item.href && !item.href.endsWith("wa.me/"));

  const submitContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const whatsapp = String(form.get("whatsapp") || "").trim();
    const subject = String(form.get("subject") || "Portfolio inquiry").trim() || "Portfolio inquiry";
    const projectType = String(form.get("projectType") || "Other");
    const budgetRange = String(form.get("budgetRange") || "Discuss first");
    const message = String(form.get("message") || "").trim();
    const ownerWhatsApp = (profile.whatsapp || "").replace(/\D/g, "");
    if (!name || (email && !email.includes("@")) || message.length < 10 || !ownerWhatsApp) {
      setContactError(!ownerWhatsApp ? "WhatsApp number is not configured in the admin profile." : "Please provide your name, a valid optional email, and a message with at least 10 characters.");
      setStatus("error");
      return;
    }
    setContactError("");
    setStatus("submitting");
    const payload = { name, email, whatsapp, projectType, budgetRange, subject, message };
    const template = [
      "Hello Fazri, I want to discuss a project.",
      "",
      `Name: ${name}`,
      `Email: ${email || "-"}`,
      `WhatsApp: ${whatsapp || "-"}`,
      `Subject: ${subject}`,
      `Project Type: ${projectType}`,
      `Budget Range: ${budgetRange}`,
      "",
      "Message:",
      message,
    ].join("\n");
    const whatsappUrl = `https://wa.me/${ownerWhatsApp}?text=${encodeURIComponent(template)}`;

    try {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if (isSupabaseEnabled) {
        void supabasePortfolioRepository.submitContact(payload)
          .then(() => portfolioRepository.refresh())
          .catch((error) => console.error("Contact archive failed", error));
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
    if (!commentDraft.name.trim() || !commentDraft.email.includes("@") || commentDraft.message.trim().length < 5) {
      setCommentStatus("error");
      return;
    }
    setCommentStatus("submitting");
    const payload = {
      name: commentDraft.name.trim(),
      email: commentDraft.email.trim(),
      message: commentDraft.message.trim(),
      avatar: commentDraft.name.trim().slice(0, 2).toUpperCase(),
      replyToId: replyTo?.id,
      replyToName: replyTo?.name,
    };
    const pendingComment: LocalVisitorComment = {
      ...payload,
      reply: replyTo ? `Reply to ${replyTo.name}` : undefined,
      replyToId: replyTo?.id,
      replyToName: replyTo?.name,
      id: `pending-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      likes: 0,
      pinned: false,
      status: "pending",
    };
    setPendingComments((items) => {
      const next = [pendingComment, ...items];
      writePendingComments(next);
      return next;
    });
    setCommentDraft({ name: "", email: "", message: "" });
    setReplyTo(null);
    setCommentStatus("success");
    try {
      portfolioRepository.createComment(payload);
    } catch (error) {
      console.error("Comment save failed", error);
    }
  };

  const likeComment = (comment: VisitorComment) => {
    if (comment.status !== "approved" || likedCommentBases[comment.id] !== undefined) return;
    setLikedCommentBases((items) => {
      const next = { ...items, [comment.id]: comment.likes };
      writeLikedCommentBases(next);
      return next;
    });
    portfolioRepository.likeComment(comment);
  };

  const displayedLikeCount = (comment: VisitorComment) => {
    const base = likedCommentBases[comment.id];
    return base === undefined ? comment.likes : Math.max(comment.likes, base + 1);
  };

  const renderComment = (comment: VisitorComment | LocalVisitorComment, nested = false) => {
    const liked = likedCommentBases[comment.id] !== undefined;
    return (
      <article key={comment.id} className={`${nested ? "border-l border-[var(--color-accent-main)]/35 pl-4" : "border-b border-[var(--color-border)] pb-5 last:border-0"}`}>
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-main)]/15 text-sm font-bold text-[var(--color-accent-main)]">{comment.avatar}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold">{comment.name}</h3>
              <span className="text-xs text-[var(--color-text-muted)]">{comment.date}</span>
              {comment.pinned && <span className="ml-auto border border-[var(--color-accent-main)]/30 px-2 py-0.5 text-[10px] text-[var(--color-accent-main)]">{t("Pinned")}</span>}
              {comment.status === "pending" && <span className="ml-auto border border-amber-300/30 px-2 py-0.5 text-[10px] text-amber-200">{t("Pending review")}</span>}
            </div>
            {comment.reply && <p className="mt-2 inline-flex border border-[var(--color-border)] px-2 py-1 text-[10px] font-semibold text-[var(--color-text-muted)]">{t(comment.reply)}</p>}
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{comment.message}</p>
            {comment.adminReply && <p className="mt-3 border-l border-[var(--color-accent-main)] pl-3 text-xs leading-5 text-[var(--color-text-muted)]">{t("Admin reply:")} {t(comment.adminReply)}</p>}
            {!nested && [...(visibleRepliesByParent[comment.id] || []), ...(pendingRepliesByParent[comment.id] || [])].map((reply) => (
              <div key={reply.id} className="mt-3 border-l border-[var(--color-accent-main)] pl-3 text-xs leading-5 text-[var(--color-text-muted)]">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-[var(--color-text-secondary)]">{reply.name}</strong>
                  <span>{reply.date}</span>
                  {reply.status === "pending" && <span className="border border-amber-300/30 px-2 py-0.5 text-[10px] text-amber-200">{t("Pending review")}</span>}
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{reply.message}</p>
              </div>
            ))}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => likeComment(comment)} disabled={comment.status !== "approved" || liked} className="inline-flex items-center gap-2 border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition-colors duration-200 hover:border-[var(--color-accent-main)] hover:text-[var(--color-text-main)] disabled:cursor-not-allowed disabled:opacity-60">
                <ThumbsUp size={13} /> {liked ? t("Liked") : t("Like")} <span className="text-[var(--color-accent-main)]">{displayedLikeCount(comment)}</span>
              </button>
              <button type="button" onClick={() => replyToComment(comment)} className="inline-flex items-center gap-2 border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition-colors duration-200 hover:border-[var(--color-accent-main)] hover:text-[var(--color-text-main)]">
                <MessageSquareReply size={13} /> {t("Reply")}
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  const replyToComment = (comment: VisitorComment) => {
    setReplyTo({ id: comment.id, name: comment.name });
    setCommentStatus("idle");
    window.setTimeout(() => commentMessageRef.current?.focus(), 0);
  };

  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--color-bg-primary)] pt-24 text-[var(--color-text-main)] sm:pt-28 lg:pt-32">
      <section className="px-5 pb-14 sm:px-6 sm:pb-16">
        <div className="mx-auto grid max-w-7xl gap-8 border-b border-[var(--color-border)] pb-12 lg:grid-cols-[1.08fr_.92fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[.22em] text-[var(--color-accent-main)]">Contact / Collaboration</p>
            <h1 className="mt-5 max-w-3xl font-manrope text-4xl font-bold leading-tight tracking-[-.025em] sm:text-6xl">{t("Let's build something meaningful.")}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)]">{t("Have a website, digital product, dashboard, or creative idea in mind? Share the context and the next step can start clearly.")}</p>
          </div>
          <div className="grid gap-px overflow-hidden border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3">
            <SignalTile icon={<MessageSquareText size={18} />} label="Response" value="Clear brief" />
            <SignalTile icon={<AtSign size={18} />} label="Focus" value="Web first" />
            <SignalTile icon={<Sparkles size={18} />} label="Support" value="Visual craft" />
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-6 sm:pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.04fr_.96fr]">
          <div className="min-w-0">
            <form onSubmit={submitContact} className="relative overflow-hidden border border-[var(--color-border)] bg-[linear-gradient(145deg,var(--color-surface-elevated),var(--color-bg-secondary))] p-5 shadow-[0_24px_80px_rgba(0,0,0,.18)] sm:p-6 md:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-accent-main),transparent)]" />
              <div className="mb-7 flex items-start justify-between gap-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[var(--color-accent-main)]">Project context</p>
                  <h2 className="mt-2 font-manrope text-2xl font-bold">{t("Send Message")}</h2>
                </div>
                <span className="hidden h-11 w-11 shrink-0 items-center justify-center border border-[var(--color-border)] text-[var(--color-accent-main)] sm:flex"><Send size={18} /></span>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label={t("Name")} name="name" required />
                <Field label={t("Email")} name="email" type="email" />
                <Field label="WhatsApp" name="whatsapp" />
                <Field label={t("Subject")} name="subject" required />
                <Select label={t("Project Type")} name="projectType" options={projectTypes} t={t} />
                <Select label={t("Budget Range")} name="budgetRange" options={budgets} t={t} />
              </div>
              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">{t("Message")}</span>
                <textarea name="message" required rows={6} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 leading-7 outline-none transition-colors duration-200 focus:border-[var(--color-accent-main)]" placeholder={t("Tell me about the goal, audience, timeline, and what already exists.")} />
              </label>
              {status === "error" && <p className="mt-4 text-sm text-red-300">{t(contactError || "Please provide your name, a valid optional email, and a message with at least 10 characters.")}</p>}
              {status === "success" && <p className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-300"><CheckCircle size={16} /> {t("WhatsApp is opening with your message template.")}</p>}
              <button disabled={status === "submitting"} className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[var(--color-text-main)] px-5 py-3 text-sm font-bold text-[var(--color-bg-primary)] transition-[opacity,transform] duration-200 hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto">{status === "submitting" ? t("Opening WhatsApp...") : t("Send Message")} <Send size={16} /></button>
            </form>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {contactChannels.map((channel, index) => <ContactCard key={channel.label} {...channel} index={index} />)}
              <div className="group relative overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 sm:col-span-2">
                <div className="absolute right-5 top-5 font-mono text-[10px] text-[var(--color-text-muted)]">GMT+7</div>
                <span className="flex h-12 w-12 items-center justify-center border border-[var(--color-accent-main)]/35 bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)]"><MapPin size={22} /></span>
                <p className="mt-5 font-manrope text-xl font-bold">{profile.location}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{t(profile.availability)}</p>
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
                  {replyTo && (
                    <div className="flex items-center justify-between gap-3 border border-[var(--color-accent-main)]/35 bg-[var(--color-accent-main)]/10 px-3 py-2 text-xs text-[var(--color-text-secondary)]">
                      <span>{t("Replying to")} <strong className="text-[var(--color-text-main)]">{replyTo.name}</strong></span>
                      <button type="button" onClick={() => setReplyTo(null)} className="inline-flex items-center gap-1 text-[var(--color-text-main)] hover:text-[var(--color-accent-main)]"><X size={13} /> {t("Cancel reply")}</button>
                    </div>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={commentDraft.name} onChange={(event) => { setCommentStatus("idle"); setCommentDraft({ ...commentDraft, name: event.target.value }); }} placeholder={t("Name")} className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-[var(--color-accent-main)]" />
                    <input value={commentDraft.email} onChange={(event) => { setCommentStatus("idle"); setCommentDraft({ ...commentDraft, email: event.target.value }); }} placeholder={t("Email (hidden)")} className="border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-[var(--color-accent-main)]" />
                  </div>
                  <textarea ref={commentMessageRef} value={commentDraft.message} onChange={(event) => { setCommentStatus("idle"); setCommentDraft({ ...commentDraft, message: event.target.value }); }} placeholder={replyTo ? t("Write your reply...") : t("Leave a comment...")} rows={3} maxLength={500} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-[var(--color-accent-main)]" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">{commentDraft.message.length}/500</span>
                    <button disabled={commentStatus === "submitting"} className="bg-[var(--color-text-main)] px-4 py-2 text-sm font-bold text-[var(--color-bg-primary)] disabled:opacity-60">{commentStatus === "submitting" ? t("Sending...") : t("Post")}</button>
                  </div>
                  {commentStatus === "success" && <p className="text-xs text-emerald-300">{t("Comment saved as pending for admin review.")}</p>}
                  {commentStatus === "error" && <p className="text-xs text-red-300">{t("Please provide a valid email and a message with at least 5 characters.")}</p>}
                </form>
                <div className="space-y-6">
                  {standalonePendingComments.length === 0 && visibleTopLevelComments.length === 0 ? <EmptyState title="No visible comments yet" description="Approved comments will appear here." /> : (
                    <>
                      {standalonePendingComments.map((comment) => renderComment(comment))}
                      {visibleTopLevelComments.map((comment) => (
                        <div key={comment.id} className="space-y-4">
                          {renderComment(comment)}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            ) : <EmptyState title="Comments are closed" description="The admin settings currently disable visitor comments." />}
          </aside>
        </div>
      </section>
    </main>
  );
}

function SignalTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[var(--color-bg-primary)] p-4">
      <span className="text-[var(--color-accent-main)]">{icon}</span>
      <p className="mt-5 font-mono text-[9px] uppercase tracking-[.16em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label><span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">{label}</span><input name={name} type={type} required={required} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3 outline-none transition-colors duration-200 focus:border-[var(--color-accent-main)]" /></label>;
}

function Select({ label, name, options, t }: { label: string; name: string; options: string[]; t: (value: string) => string }) {
  return <label><span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">{label}</span><select name={name} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3 outline-none transition-colors duration-200 focus:border-[var(--color-accent-main)]">{options.map((option) => <option key={option} value={option}>{t(option)}</option>)}</select></label>;
}

function ContactCard({ icon: Icon, label, value, href, meta, index }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string; href: string; meta: string; index: number }) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group relative min-h-[172px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[var(--color-accent-main)]/70 hover:bg-[var(--color-bg-secondary)]">
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px origin-left scale-x-0 bg-[var(--color-accent-main)] transition-transform duration-300 group-hover:scale-x-100" />
      <span className="absolute right-5 top-5 font-mono text-[10px] text-[var(--color-text-muted)]">{String(index + 1).padStart(2, "0")}</span>
      <span className="relative flex h-12 w-12 items-center justify-center border border-[var(--color-accent-main)]/35 bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)]">
        <Icon size={22} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
      </span>
      <p className="mt-7 font-mono text-[9px] uppercase tracking-[.16em] text-[var(--color-text-muted)]">{meta}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-manrope text-xl font-bold">{label}</p>
          <p className="mt-1 truncate text-sm text-[var(--color-text-secondary)]">{value}</p>
        </div>
        <ArrowUpRight className="shrink-0 text-[var(--color-text-muted)] transition-[transform,color] duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[var(--color-accent-main)]" size={18} />
      </div>
    </a>
  );
}
