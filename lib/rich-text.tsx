import { cn } from "./cn";

const ALLOWED_TAGS = new Set(["strong", "em", "b", "i", "u", "s", "del", "code", "br", "a", "span"]);

export function stripRichTextToPlain(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeHref(href: string): string | null {
  const trimmed = href.trim();
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return null;
}

export function inlineRichTextToSafeHtml(text: string): string {
  if (!text) return "";
  const parts = text.split(/(<\/?[a-zA-Z][^>]*>)/g);
  return parts
    .map((part) => {
      const match = part.match(/^<\/?([a-zA-Z]+)([^>]*)\/?>$/);
      if (!match) return escapeText(part);

      const tag = match[1].toLowerCase();
      const closing = part.startsWith("</");
      const selfClosing = part.endsWith("/>") || tag === "br";
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (closing) return `</${tag}>`;
      if (tag === "br") return "<br />";
      if (tag === "a") {
        const hrefMatch = match[2].match(/href\s*=\s*("([^"]*)"|'([^']*)')/i);
        const rawHref = hrefMatch?.[2] ?? hrefMatch?.[3] ?? "";
        const href = sanitizeHref(rawHref);
        if (!href) return "";
        return `<a href="${escapeText(href)}" target="_blank" rel="noopener noreferrer">`;
      }
      return selfClosing ? `<${tag} />` : `<${tag}>`;
    })
    .join("");
}

export function RichText({
  text,
  className,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4";
}) {
  if (!text) return null;
  const html = inlineRichTextToSafeHtml(text);
  if (!html) return null;
  return (
    <Tag
      className={cn(
        "[&_a]:underline [&_u]:underline [&_s]:line-through [&_del]:line-through [&_code]:font-mono",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
