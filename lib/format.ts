export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  if (date.getUTCMonth() === 0 && date.getUTCDate() === 1) {
    return date.getUTCFullYear().toString();
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return "";
  const startFormatted = start ? formatDate(start) : "";
  const endFormatted = end ? formatDate(end) : "Present";
  if (!startFormatted && !end) return "";
  if (!startFormatted) return endFormatted;
  return `${startFormatted} - ${endFormatted}`;
}

export function formatRelativeUpdated(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function experienceSortTime(date: string | null, fallback: number): number {
  if (!date) return fallback;
  const parsed = new Date(date).getTime();
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function sortExperiencesNewestFirst<
  T extends { startDate: string | null; endDate: string | null },
>(experiences: T[]): T[] {
  const now = Date.now();
  return [...experiences].sort((a, b) => {
    const endDiff = experienceSortTime(b.endDate, now) - experienceSortTime(a.endDate, now);
    if (endDiff !== 0) return endDiff;
    return experienceSortTime(b.startDate, 0) - experienceSortTime(a.startDate, 0);
  });
}

export function groupSkillsByCategory(
  skills: Array<{ name: string; category: string }>,
): Record<string, string[]> {
  return skills.reduce(
    (acc, skill) => {
      const cat = skill.category || "general";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill.name);
      return acc;
    },
    {} as Record<string, string[]>,
  );
}

export function getDuration(start: string | null, end: string | null): string {
  if (!start) return "";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  if (Number.isNaN(startDate.getTime())) return "";

  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  let totalMonths = years * 12 + months;
  if (totalMonths <= 0) totalMonths = 1;

  const displayYears = Math.floor(totalMonths / 12);
  const displayMonths = totalMonths % 12;
  const parts: string[] = [];
  if (displayYears > 0) parts.push(`${displayYears} yr${displayYears > 1 ? "s" : ""}`);
  if (displayMonths > 0) parts.push(`${displayMonths} mo${displayMonths > 1 ? "s" : ""}`);
  return parts.join(" ");
}

export function platformLabel(platform: string): string {
  const icons: Record<string, string> = {
    github: "GitHub",
    linkedin: "LinkedIn",
    leetcode: "LeetCode",
    devto: "Dev.to",
    hashnode: "Hashnode",
    stackoverflow: "Stack Overflow",
    codeforces: "Codeforces",
    twitter: "Twitter",
    x: "X",
    dribbble: "Dribbble",
    medium: "Medium",
    website: "Website",
    instagram: "Instagram",
  };
  return icons[platform.toLowerCase()] ?? platform;
}
