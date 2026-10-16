export type DescriptionNode =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function stripBulletPrefix(text: string): string {
  return text.replace(/^(\s*[-*•●]\s+|\s*\d+[.)]\s+)/, "").trim();
}

function headingLabel(text: string): string {
  return text.trim().replace(/:+$/, "").trim();
}

function isHeadingLine(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed.endsWith(":")) return false;
  const label = headingLabel(trimmed);
  if (label.length < 2 || label.length > 48) return false;
  if (/[.!?]/.test(label)) return false;
  if (/^https?:/i.test(label)) return false;
  const words = label.split(/\s+/);
  return words.length > 0 && words.length <= 6;
}

function classifyLine(raw: string): { type: "blank" } | { type: "heading"; text: string } | { type: "text"; text: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { type: "blank" };

  const markdownHeading = trimmed.match(/^#{1,3}\s+(.+)$/);
  if (markdownHeading) {
    const text = headingLabel(markdownHeading[1] ?? "");
    return text ? { type: "heading", text } : { type: "blank" };
  }

  const text = stripBulletPrefix(trimmed);
  if (!text) return { type: "blank" };
  if (isHeadingLine(text)) {
    const heading = headingLabel(text);
    return heading ? { type: "heading", text: heading } : { type: "blank" };
  }
  return { type: "text", text };
}

export function parseDescription(text: string): DescriptionNode[] {
  if (!text.trim()) return [];

  const nodes: DescriptionNode[] = [];
  const buffer: string[] = [];

  const flush = () => {
    if (buffer.length === 1) nodes.push({ type: "paragraph", text: buffer[0] });
    else if (buffer.length > 1) nodes.push({ type: "list", items: [...buffer] });
    buffer.length = 0;
  };

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = classifyLine(raw);
    if (line.type === "blank") {
      flush();
      continue;
    }
    if (line.type === "heading") {
      flush();
      nodes.push({ type: "heading", text: line.text });
      continue;
    }
    buffer.push(line.text);
  }
  flush();
  return nodes;
}
