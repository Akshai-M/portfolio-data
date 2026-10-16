import type {
  ExportedPortfolio,
  ExportOwner,
  ExportProfile,
  PortfolioCustomization,
  PortfolioData,
  ViewerPortfolio,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function asNullableString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean);
}

function asItems(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function asCustomization(value: unknown): PortfolioCustomization {
  return isRecord(value) ? (value as PortfolioCustomization) : {};
}

function asOwner(value: unknown): ExportOwner {
  const record = isRecord(value) ? value : {};
  return {
    id: asString(record.id),
    name: asNullableString(record.name),
    email: asString(record.email),
    avatar: asNullableString(record.avatar),
  };
}

function asProfile(value: unknown): ExportProfile {
  const record = isRecord(value) ? value : {};
  return {
    ...(record as ExportProfile),
    id: asString(record.id),
    slug: asNullableString(record.slug),
    title: asString(record.title),
    headline: asString(record.headline),
    summary: asString(record.summary),
    avatarUrl: asNullableString(record.avatarUrl),
    profileImageUrl: asNullableString(record.profileImageUrl),
    resumeUrl: asNullableString(record.resumeUrl),
    isPublished: asBoolean(record.isPublished),
    contactEmail: asNullableString(record.contactEmail),
    phone: asNullableString(record.phone),
    location: asNullableString(record.location),
    websiteUrl: asNullableString(record.websiteUrl),
    customization: asCustomization(record.customization),
    livePreviewProjectIds: asStringArray(record.livePreviewProjectIds),
    createdAt: asNullableString(record.createdAt) ?? undefined,
    updatedAt: asNullableString(record.updatedAt) ?? undefined,
    openToWork: asBoolean(record.openToWork),
  };
}

function withId(record: Record<string, unknown>, index: number, prefix: string): string {
  return asString(record.id, `${prefix}-${index}`);
}

function mapExperience(value: unknown, index: number): PortfolioData["experiences"][number] {
  const record = isRecord(value) ? value : {};
  return {
    id: withId(record, index, "experience"),
    company: asString(record.company),
    role: asString(record.role),
    description: asString(record.description),
    startDate: asNullableString(record.startDate),
    endDate: asNullableString(record.endDate),
    location: asNullableString(record.location),
  };
}

function mapEducation(value: unknown, index: number): PortfolioData["educations"][number] {
  const record = isRecord(value) ? value : {};
  return {
    id: withId(record, index, "education"),
    institution: asString(record.institution),
    degree: asString(record.degree),
    field: asNullableString(record.field),
    startDate: asNullableString(record.startDate),
    endDate: asNullableString(record.endDate),
    gpa: asNullableString(record.gpa),
  };
}

function mapSkill(value: unknown, index: number): PortfolioData["skills"][number] {
  const record = isRecord(value) ? value : {};
  return {
    id: withId(record, index, "skill"),
    name: asString(record.name),
    category: asString(record.category, "general"),
    level: asNumber(record.level),
  };
}

function mapProject(value: unknown, index: number): PortfolioData["projects"][number] {
  const record = isRecord(value) ? value : {};
  return {
    id: withId(record, index, "project"),
    title: asString(record.title),
    description: asString(record.description),
    imageUrl: asNullableString(record.imageUrl),
    liveUrl: asNullableString(record.liveUrl),
    sourceUrl: asNullableString(record.sourceUrl),
    techStack: asStringArray(record.techStack),
    featured: asBoolean(record.featured),
    githubStars: asNumber(record.githubStars),
    githubForks: asNumber(record.githubForks),
    language: asNullableString(record.language),
  };
}

function mapArticle(value: unknown, index: number): PortfolioData["articles"][number] {
  const record = isRecord(value) ? value : {};
  return {
    id: withId(record, index, "article"),
    title: asString(record.title),
    description: asString(record.description),
    url: asString(record.url),
    tags: asStringArray(record.tags),
    publishedAt: asNullableString(record.publishedAt),
    readTime: asNumber(record.readTime),
    source: asNullableString(record.source),
  };
}

function mapSocial(value: unknown): PortfolioData["socialProfiles"][number] {
  const record = isRecord(value) ? value : {};
  return {
    platform: asString(record.platform, "unknown"),
    url: asString(record.url),
    username: asNullableString(record.username),
    cachedStats: isRecord(record.cachedStats) ? record.cachedStats : null,
  };
}

function mapCertification(value: unknown, index: number): PortfolioData["certifications"][number] {
  const record = isRecord(value) ? value : {};
  return {
    id: withId(record, index, "certification"),
    name: asString(record.name),
    issuer: asString(record.issuer),
    issueDate: asNullableString(record.issueDate),
    url: asNullableString(record.url),
  };
}

function mapAchievement(value: unknown, index: number): PortfolioData["achievements"][number] {
  const record = isRecord(value) ? value : {};
  return {
    id: withId(record, index, "achievement"),
    title: asString(record.title),
    date: asNullableString(record.date),
  };
}

function mapCustomSection(value: unknown, index: number): PortfolioData["customSections"][number] {
  const record = isRecord(value) ? value : {};
  return {
    id: withId(record, index, "custom"),
    sectionType: asString(record.sectionType),
    label: asString(record.label, "Section"),
    items: asItems(record.items),
  };
}

export function mapExportedPortfolio(item: ExportedPortfolio): ViewerPortfolio {
  const owner = asOwner(item.owner);
  const profile = asProfile(item.profile);
  const data: PortfolioData = {
    portfolio: {
      title: profile.title,
      headline: profile.headline,
      summary: profile.summary,
      avatarUrl: profile.avatarUrl,
      profileImageUrl: profile.profileImageUrl,
      contactEmail: profile.contactEmail,
      phone: profile.phone,
      location: profile.location,
      websiteUrl: profile.websiteUrl,
      customization: asCustomization(profile.customization),
    },
    experiences: (item.experiences ?? []).map(mapExperience),
    educations: (item.educations ?? []).map(mapEducation),
    skills: (item.skills ?? []).map(mapSkill),
    projects: (item.projects ?? []).map(mapProject),
    articles: (item.articles ?? []).map(mapArticle),
    socialProfiles: (item.socialProfiles ?? []).map(mapSocial),
    certifications: (item.certifications ?? []).map(mapCertification),
    achievements: (item.achievements ?? []).map(mapAchievement),
    customSections: (item.customSections ?? []).map(mapCustomSection),
    livePreviewProjectIds: profile.livePreviewProjectIds ?? [],
  };

  return {
    id: profile.id || owner.id,
    isPublished: profile.isPublished,
    slug: profile.slug,
    owner,
    updatedAt: profile.updatedAt ?? null,
    createdAt: profile.createdAt ?? null,
    openToWork: Boolean(profile.openToWork),
    data,
  };
}

export function mergeExportedPortfolios(
  published: ExportedPortfolio[],
  drafts: ExportedPortfolio[],
): ViewerPortfolio[] {
  const merged = new Map<string, ViewerPortfolio>();
  for (const item of [...published, ...drafts]) {
    const mapped = mapExportedPortfolio(item);
    if (!mapped.id) continue;
    merged.set(mapped.id, mapped);
  }
  return [...merged.values()].sort((a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bTime - aTime;
  });
}
