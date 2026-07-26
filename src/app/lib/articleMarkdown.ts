import type { ArticleBlock } from "../types/portfolio";

type LegacyTextBlock = Exclude<ArticleBlock, { type: "image" | "markdown" }>;

const makeId = () => crypto.randomUUID();

function legacyBlockToMarkdown(block: LegacyTextBlock) {
  if (block.type === "heading") return `${block.level === 3 ? "###" : "##"} ${block.text}`.trimEnd();
  if (block.type === "quote") {
    const quote = block.text.split("\n").map((line) => `> ${line}`).join("\n");
    return block.attribution ? `${quote}\n> -- ${block.attribution}` : quote;
  }
  if (block.type === "list") {
    return block.items.map((item, index) => `${block.ordered ? `${index + 1}.` : "-"} ${item}`).join("\n");
  }
  return block.text;
}

export function normalizeArticleEditorBlocks(blocks: ArticleBlock[]): ArticleBlock[] {
  const normalized: ArticleBlock[] = [];
  let pendingId = "";
  let pendingSources: string[] = [];

  const flushText = () => {
    if (!pendingId) return;
    normalized.push({
      id: pendingId,
      type: "markdown",
      source: pendingSources.filter((source) => source.trim()).join("\n\n"),
    });
    pendingId = "";
    pendingSources = [];
  };

  blocks.forEach((block) => {
    if (block.type === "image") {
      flushText();
      normalized.push(block);
      return;
    }

    if (!pendingId) pendingId = block.id || makeId();
    pendingSources.push(block.type === "markdown" ? block.source : legacyBlockToMarkdown(block));
  });
  flushText();

  return normalized.length ? normalized : [{ id: makeId(), type: "markdown", source: "" }];
}

export function parseArticleMarkdown(source: string, idPrefix = "markdown"): ArticleBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ArticleBlock[] = [];
  let index = 0;
  let blockIndex = 0;
  const nextId = () => `${idPrefix}-${blockIndex++}`;
  const isBlockStart = (line: string) =>
    /^#{2,3}\s+/.test(line)
    || /^>\s?/.test(line)
    || /^[-*]\s+/.test(line)
    || /^\d+\.\s+/.test(line);

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      blocks.push({
        id: nextId(),
        type: "heading",
        level: heading[1].length === 3 ? 3 : 2,
        text: heading[2].trim(),
      });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^>\s?/, "").trim());
        index += 1;
      }
      const attributionLine = quoteLines.at(-1)?.match(/^(?:--|—)\s*(.+)$/);
      const attribution = attributionLine?.[1]?.trim() || "";
      if (attribution) quoteLines.pop();
      blocks.push({
        id: nextId(),
        type: "quote",
        text: quoteLines.join(" ").trim(),
        attribution,
      });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, "").trim());
        index += 1;
      }
      blocks.push({ id: nextId(), type: "list", items, ordered: false });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, "").trim());
        index += 1;
      }
      blocks.push({ id: nextId(), type: "list", items, ordered: true });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ id: nextId(), type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}
