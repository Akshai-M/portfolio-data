export interface PortfolioCustomization {
  navbar?: {
    enabled?: boolean;
    sections?: Partial<Record<"about" | "work" | "experience" | "profiles", boolean>>;
  };
  sectionLabels?: Partial<Record<string, string>>;
  heroTagline?: string;
  sectionLayout?: {
    order?: string[];
    hidden?: string[];
  };
  primaryColor?: string;
  hiddenIntegrations?: string[];
  [key: string]: unknown;
}

export interface PortfolioData {
  portfolio: {
    title: string;
    headline: string;
    summary: string;
    avatarUrl: string | null;
    profileImageUrl: string | null;
    contactEmail: string | null;
    phone: string | null;
    location: string | null;
    websiteUrl: string | null;
    customization: PortfolioCustomization;
  };
  experiences: Array<{
    id: string;
    company: string;
    role: string;
    description: string;
    startDate: string | null;
    endDate: string | null;
    location: string | null;
  }>;
  educations: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
    gpa: string | null;
  }>;
  skills: Array<{
    id: string;
    name: string;
    category: string;
    level: number | null;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    liveUrl: string | null;
    sourceUrl: string | null;
    techStack: string[];
    featured: boolean;
    githubStars: number | null;
    githubForks: number | null;
    language: string | null;
  }>;
  articles: Array<{
    id: string;
    title: string;
    description: string;
    url: string;
    tags: string[];
    publishedAt: string | null;
    readTime: number | null;
    source: string | null;
  }>;
  socialProfiles: Array<{
    platform: string;
    url: string;
    username: string | null;
    cachedStats: Record<string, unknown> | null;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string | null;
    url: string | null;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    date: string | null;
  }>;
  customSections: Array<{
    id: string;
    sectionType: string;
    label: string;
    items: Record<string, unknown>[];
  }>;
  livePreviewProjectIds: string[];
}

export interface ExportOwner {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

export interface ExportProfile {
  id: string;
  userId?: string;
  slug: string | null;
  title: string;
  headline: string;
  summary: string;
  avatarUrl: string | null;
  profileImageUrl: string | null;
  resumeUrl: string | null;
  templateId?: string;
  isPublished: boolean;
  openToWork?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  contactEmail: string | null;
  phone: string | null;
  location: string | null;
  websiteUrl: string | null;
  customization: PortfolioCustomization | Record<string, unknown>;
  livePreviewProjectIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ExportedPortfolio {
  owner: ExportOwner;
  profile: ExportProfile;
  experiences: unknown[];
  educations: unknown[];
  skills: unknown[];
  projects: unknown[];
  articles: unknown[];
  socialProfiles: unknown[];
  certifications: unknown[];
  achievements: unknown[];
  customSections: unknown[];
}

export interface ExportResponse {
  count: number;
  isPublished: boolean;
  portfolios: ExportedPortfolio[];
}

export interface ViewerPortfolio {
  id: string;
  isPublished: boolean;
  slug: string | null;
  owner: ExportOwner;
  updatedAt: string | null;
  createdAt: string | null;
  openToWork: boolean;
  data: PortfolioData;
}

export type AuthStatus = "loading" | "unauthenticated" | "authenticated";

export type PublishFilter = boolean;
