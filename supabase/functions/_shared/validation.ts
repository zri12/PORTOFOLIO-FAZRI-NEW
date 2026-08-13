export function cleanText(value: unknown, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function normalizeWhatsApp(value: unknown) {
  const whatsapp = cleanText(value, 40).replace(/[\s().-]/g, "");
  if (!/^\+?[0-9]{7,20}$/.test(whatsapp)) throw new Error("Please provide a valid WhatsApp number.");
  return whatsapp;
}

export function validateContact(body: Record<string, unknown>) {
  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 254).toLowerCase();
  const whatsapp = normalizeWhatsApp(body.whatsapp);
  const projectType = cleanText(body.projectType, 120) || "Other";
  const budgetRange = cleanText(body.budgetRange, 120) || "Discuss first";
  const subject = cleanText(body.subject, 180) || "Portfolio inquiry";
  const message = cleanText(body.message, 3000);
  if (!name || (email && !isEmail(email)) || message.length < 10) throw new Error("Please provide a name, WhatsApp number, optional valid email, and a message of at least 10 characters.");
  return { name, email, whatsapp, projectType, budgetRange, subject, message };
}

export function validateComment(body: Record<string, unknown>) {
  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 254).toLowerCase();
  const avatar = cleanText(body.avatar, 8) || name.slice(0, 2).toUpperCase();
  const message = cleanText(body.message, 500);
  const replyToId = cleanText(body.replyToId, 80);
  if (!name || !isEmail(email) || message.length < 5) throw new Error("Please provide a valid name, email, and comment.");
  return { name, email, avatar, message, replyToId };
}
