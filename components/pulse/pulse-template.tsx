"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Award,
  Calendar,
  Cpu,
  ExternalLink,
  GitFork,
  MapPin,
  Menu,
  Star,
  Terminal,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  formatDate,
  formatDateRange,
  getDuration,
  groupSkillsByCategory,
  sortExperiencesNewestFirst,
} from "@/lib/format";
import { RichText, stripRichTextToPlain } from "@/lib/rich-text";
import type { PortfolioData, PortfolioCustomization } from "@/lib/types";
import {
  ArticleSourceLabel,
  CollapsibleList,
  ContactChips,
  CustomSectionItems,
  DescriptionBlock,
  GitHubContributionHeatmap,
  hasContactOrSocialProfiles,
  hasNonHeroSocialProfiles,
  HeroProfileButtons,
  parseContributionCalendar,
  ProfileLinksSection,
  ProjectActions,
  ProjectPreview,
  SocialPills,
  TechChip,
} from "./ui";
import styles from "./pulse-template.module.css";

const DEFAULT_SECTION_ORDER = [
  "experience",
  "education",
  "skills",
  "projects",
  "github",
  "certifications",
  "articles",
  "achievements",
  "profiles",
] as const;

const DEFAULT_LABELS: Record<string, string> = {
  about: "About",
  projects: "Projects",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  achievements: "Achievements",
  articles: "Articles",
  profiles: "Profiles",
  github: "GitHub Activity",
};

function sectionLabels(customization: PortfolioCustomization) {
  const stored = customization.sectionLabels ?? {};
  return Object.fromEntries(
    Object.keys(DEFAULT_LABELS).map((key) => [key, stored[key]?.trim() || DEFAULT_LABELS[key]]),
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="w-full border-b border-white/10 pb-4 text-left font-serif text-3xl font-normal italic tracking-tight text-slate-200 @sm:text-4xl">
      {children}
    </h2>
  );
}

function Header({
  portfolioTitle,
  navItems,
  activeSection,
  setActiveSection,
  primaryColor,
  isPublished,
}: {
  portfolioTitle: string;
  navItems: Array<{ id: string; label: string }>;
  activeSection: string;
  setActiveSection: (section: string) => void;
  primaryColor: string;
  isPublished: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 @sm:px-6 @lg:px-8">
        <div
          onClick={() => handleScroll(navItems[0]?.id ?? "about")}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 font-display font-bold tracking-tight text-white"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5"
            style={{ color: primaryColor }}
          >
            <Terminal className="h-4 w-4" />
          </div>
          <span className="min-w-0 text-sm leading-snug break-words @sm:text-base @md:text-lg">
            {portfolioTitle}
          </span>
        </div>

        <span
          className={cn(
            "hidden shrink-0 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-widest @md:inline-flex",
            isPublished
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-200",
          )}
        >
          {isPublished ? "Published" : "Draft"}
        </span>

        <nav className="hidden shrink-0 items-center gap-1 @md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleScroll(item.id)}
              className={`relative rounded-md px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeSection === item.id ? "bg-white/5 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <span
                  className="absolute bottom-1 right-4 left-4 h-0.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </button>
          ))}
        </nav>

        {navItems.length > 0 && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 @md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        )}
      </div>

      {mobileMenuOpen && navItems.length > 0 && (
        <nav className="border-t border-white/10 bg-[#0a0a0a]/95 px-4 py-3 @md:hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleScroll(item.id)}
                className={`rounded-lg px-3 py-2.5 text-left font-mono text-xs font-semibold uppercase tracking-wider ${
                  activeSection === item.id ? "bg-white/10 text-white" : "text-slate-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export function PulseTemplate({
  data,
  isPublished,
}: {
  data: PortfolioData;
  isPublished: boolean;
}) {
  const {
    portfolio,
    experiences,
    educations,
    skills,
    projects,
    articles,
    socialProfiles,
    certifications,
    achievements,
    customSections,
  } = data;

  const customization = portfolio.customization ?? {};
  const primaryColor =
    typeof customization.primaryColor === "string" && customization.primaryColor
      ? customization.primaryColor
      : "#60a5fa";
  const labels = sectionLabels(customization);
  const hidden = new Set(customization.sectionLayout?.hidden ?? []);
  const storedOrder = customization.sectionLayout?.order ?? [];
  const order = [
    ...storedOrder.filter((key) => DEFAULT_SECTION_ORDER.includes(key as (typeof DEFAULT_SECTION_ORDER)[number])),
    ...DEFAULT_SECTION_ORDER.filter((key) => !storedOrder.includes(key)),
  ].filter((key) => !hidden.has(key));

  const [activeSection, setActiveSection] = useState("about");
  const githubProfile = socialProfiles.find((profile) => profile.platform.toLowerCase() === "github");
  const contributionCalendar = parseContributionCalendar(githubProfile?.cachedStats?.contributionCalendar);
  const hasProfiles = hasContactOrSocialProfiles(portfolio, socialProfiles, { excludeHeroPlatforms: true });
  const featuredProjects = projects.filter((project) => project.featured);
  const visibleProjects =
    featuredProjects.length > 0
      ? [...featuredProjects, ...projects.filter((project) => !project.featured)]
      : projects;

  const navItems = [
    { id: "about", label: labels.about },
    experiences.length > 0 ? { id: "experience", label: labels.experience } : null,
    visibleProjects.length > 0 ? { id: "work", label: labels.projects } : null,
    hasProfiles ? { id: "profiles", label: labels.profiles } : null,
  ].filter((item): item is { id: string; label: string } => Boolean(item));

  const navIds = navItems.map((item) => item.id).join(",");
  const navIdsRef = useRef(navIds);
  navIdsRef.current = navIds;

  useEffect(() => {
    const ids = navIdsRef.current.split(",").filter(Boolean);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]?.target;
        if (top?.id) setActiveSection(top.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [navIds]);

  const groupedSkills = useMemo(() => groupSkillsByCategory(skills), [skills]);
  const orderedExperiences = sortExperiencesNewestFirst(experiences);
  const showSummary = !hidden.has("about");

  const blocks: Record<string, ReactNode> = {
    experience:
      experiences.length > 0 ? (
        <section key="experience" className="scroll-mt-20 bg-transparent py-12" id="experience">
          <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">
            <div className="mb-8">
              <SectionHeading>{labels.experience}</SectionHeading>
            </div>
            <div className="relative ml-3 border-l border-white/10 pl-5 @sm:ml-5 @sm:pl-6">
              <CollapsibleList
                initial={4}
                wrapperClassName="space-y-8"
                buttonClassName="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono text-slate-400 hover:bg-white/10 hover:text-white"
              >
                {orderedExperiences.map((exp) => {
                  const duration = getDuration(exp.startDate, exp.endDate);
                  const dateRange = formatDateRange(exp.startDate, exp.endDate);
                  return (
                    <div key={exp.id} className="group relative">
                      <div
                        className="absolute top-1 -left-[27px] flex h-4 w-4 items-center justify-center rounded-full border-2 bg-[#0a0a0a] @sm:-left-[31px]"
                        style={{ borderColor: primaryColor, boxShadow: `0 0 10px ${primaryColor}40` }}
                      />
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="min-w-0 flex-1 font-display text-base font-bold break-words text-white @sm:text-lg">
                              <RichText text={exp.role} />
                            </h4>
                            {(dateRange || duration) && (
                              <div className="inline-flex shrink-0 items-start gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-xs text-slate-500">
                                <Calendar className="mt-0.5 h-3 w-3 shrink-0" />
                                <div className="flex flex-col gap-0.5">
                                  {dateRange && <span className="whitespace-nowrap text-slate-400">{dateRange}</span>}
                                  {duration && <span className="whitespace-nowrap text-slate-400">{duration}</span>}
                                </div>
                              </div>
                            )}
                          </div>
                          <span className="block font-sans text-sm font-semibold" style={{ color: primaryColor }}>
                            <RichText text={exp.company} />
                          </span>
                        </div>
                        {exp.location && (
                          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
                            <MapPin className="h-3 w-3" />
                            <span>
                              <RichText text={exp.location} />
                            </span>
                          </div>
                        )}
                        {exp.description && (
                          <DescriptionBlock
                            text={exp.description}
                            paragraphClassName="font-sans text-sm text-slate-400 leading-relaxed"
                            listClassName="space-y-2 pl-5 font-sans text-sm text-slate-400 leading-relaxed marker:text-slate-600"
                            headingClassName="font-sans text-sm font-semibold text-slate-300"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </CollapsibleList>
            </div>
          </div>
        </section>
      ) : null,
    education:
      educations.length > 0 ? (
        <section key="education" className="scroll-mt-20 py-12" id="education">
          <div className="mx-auto max-w-7xl space-y-6 px-4 @sm:px-6 @lg:px-8">
            <SectionHeading>{labels.education}</SectionHeading>
            <CollapsibleList
              initial={4}
              wrapperClassName="grid grid-cols-1 @md:grid-cols-2 gap-4"
              buttonClassName="@md:col-span-2 mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono text-slate-400 hover:text-white"
            >
              {educations.map((edu) => {
                const year = formatDate(edu.endDate || edu.startDate);
                return (
                  <div key={edu.id} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-display text-base font-bold text-white">
                        <RichText text={edu.degree} />
                      </h4>
                      {year && (
                        <div className="flex items-center gap-1.5 rounded border border-white/10 bg-[#0a0a0a]/80 px-2 py-0.5 font-mono text-[11px] text-slate-500">
                          <Calendar className="h-3 w-3" />
                          <span>{year}</span>
                        </div>
                      )}
                    </div>
                    {edu.field && (
                      <p className="font-sans text-sm font-medium text-slate-400">
                        <RichText text={edu.field} />
                      </p>
                    )}
                    <p className="font-display text-xs font-semibold" style={{ color: primaryColor }}>
                      <RichText text={edu.institution} />
                    </p>
                    {edu.gpa && (
                      <div className="flex items-center justify-between border-t border-white/10 pt-2 font-mono text-xs">
                        <span className="text-slate-500">GPA / %</span>
                        <div className="flex h-6 items-center gap-1 rounded border border-white/10 bg-[#0a0a0a]/85 px-2.5 font-bold text-white">
                          <Award className="h-3.5 w-3.5 text-amber-500" />
                          <span>{edu.gpa}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CollapsibleList>
          </div>
        </section>
      ) : null,
    skills:
      skills.length > 0 ? (
        <section key="skills" className="border-y border-white/10 py-12" id="skills">
          <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">
            <div className="mb-12">
              <SectionHeading>{labels.skills}</SectionHeading>
            </div>
            <div className="space-y-12">
              {Object.entries(groupedSkills).map(([category, names]) => (
                <div key={category} className="space-y-5">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primaryColor }} />
                    <h3 className="font-mono text-xs font-bold tracking-widest text-slate-400 uppercase">
                      {category}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4">
                    {names.map((name) => (
                      <div
                        key={`${category}-${name}`}
                        className="flex min-h-auto flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
                      >
                        <h4 className="font-display text-base font-bold break-words text-white">{name}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null,
    projects:
      visibleProjects.length > 0 ? (
        <section key="projects" className="scroll-mt-20 py-12" id="work">
          <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">
            <div className="mb-8 @sm:mb-16">
              <SectionHeading>{labels.projects}</SectionHeading>
            </div>
            <CollapsibleList
              initial={4}
              wrapperClassName="grid min-w-0 grid-cols-1 gap-4 @md:grid-cols-2 @sm:gap-8 mb-8"
              buttonClassName="@md:col-span-2 mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono text-slate-400"
            >
              {visibleProjects.map((project) => (
                <div
                  key={project.id}
                  className={cn(
                    "group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border bg-white/5 @sm:rounded-3xl",
                    project.featured ? "border-white/20 ring-1 ring-white/10" : "border-white/10",
                  )}
                >
                  <div className="relative">
                    <ProjectPreview
                      imageUrl={project.imageUrl}
                      title={stripRichTextToPlain(project.title)}
                      liveUrl={project.liveUrl}
                    />
                    {project.language && (
                      <div className="absolute top-4 left-4 z-10 max-w-[45%] truncate rounded-lg border border-white/10 bg-[#0a0a0a]/95 px-2.5 py-1 font-mono text-[11px] text-slate-300">
                        {project.language}
                      </div>
                    )}
                    {project.featured && (
                      <div className="absolute top-4 right-4 z-10 max-w-[45%] truncate rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-right font-mono text-[11px] font-semibold text-white">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 space-y-6 p-5 @sm:p-6">
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-bold text-white @sm:text-2xl">
                        <RichText text={project.title} />
                      </h3>
                      {project.description && (
                        <DescriptionBlock
                          text={project.description}
                          paragraphClassName="font-sans text-sm text-slate-400 leading-relaxed"
                          listClassName="space-y-2 pl-5 font-sans text-sm text-slate-400"
                        />
                      )}
                    </div>
                    {project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.techStack.map((tech) => (
                          <TechChip
                            key={tech}
                            name={tech}
                            className="rounded-lg border border-white/10 bg-[#0a0a0a] px-2.5 py-1 font-mono text-xs text-slate-300"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-stretch justify-between gap-3 border-t border-white/10 bg-white/[0.02] px-4 py-4 @sm:flex-row @sm:items-center @sm:px-6">
                    {(project.githubStars !== null || project.githubForks !== null) && (
                      <div className="flex items-center gap-4 font-mono text-xs text-slate-500">
                        {project.githubStars !== null && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5" />
                            <span>{project.githubStars}</span>
                          </div>
                        )}
                        {project.githubForks !== null && (
                          <div className="flex items-center gap-1">
                            <GitFork className="h-3.5 w-3.5" />
                            <span>{project.githubForks}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <ProjectActions
                      liveUrl={project.liveUrl}
                      sourceUrl={project.sourceUrl}
                      liveClassName="flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold font-mono text-slate-950"
                      sourceClassName="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs font-semibold font-mono text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </CollapsibleList>
          </div>
        </section>
      ) : null,
    github: contributionCalendar ? (
      <section key="github" className="py-12" id="github-activity">
        <div className="mx-auto max-w-7xl space-y-6 px-4 @sm:px-6 @lg:px-8">
          <SectionHeading>{labels.github}</SectionHeading>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-5">
            <GitHubContributionHeatmap
              calendar={contributionCalendar}
              profileUrl={githubProfile?.url}
              username={githubProfile?.username}
            />
          </div>
        </div>
      </section>
    ) : null,
    certifications:
      certifications.length > 0 ? (
        <section key="certifications" className="py-12" id="certifications">
          <div className="mx-auto max-w-7xl space-y-6 px-4 @sm:px-6 @lg:px-8">
            <SectionHeading>{labels.certifications}</SectionHeading>
            <CollapsibleList
              initial={4}
              wrapperClassName="space-y-4"
              buttonClassName="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono text-slate-400"
            >
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 @sm:flex-row @sm:items-center"
                >
                  <div className="space-y-1">
                    <h4 className="font-display text-base font-bold text-white">{cert.name}</h4>
                    <p className="font-sans text-xs text-slate-400">
                      Issued by <span className="font-semibold text-slate-300">{cert.issuer}</span>
                      {cert.issueDate && <> · {formatDate(cert.issueDate)}</>}
                    </p>
                  </div>
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 font-mono text-xs font-semibold text-slate-400 @sm:self-center"
                    >
                      View credential
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </CollapsibleList>
          </div>
        </section>
      ) : null,
    articles:
      articles.length > 0 ? (
        <section key="articles" className="py-12" id="articles">
          <div className="mx-auto max-w-7xl space-y-6 px-4 @sm:px-6 @lg:px-8">
            <SectionHeading>{labels.articles}</SectionHeading>
            <CollapsibleList
              initial={4}
              wrapperClassName="space-y-4"
              buttonClassName="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono text-slate-400"
            >
              {articles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10"
                >
                  <ArticleSourceLabel source={article.source} className="mb-1" />
                  {article.publishedAt && (
                    <span className="rounded border border-white/10 bg-[#0a0a0a] px-2 py-0.5 font-mono text-[10px] text-slate-500">
                      {formatDate(article.publishedAt)}
                    </span>
                  )}
                  <h4 className="font-display text-base font-bold text-white">{article.title}</h4>
                  {article.description && (
                    <p className="line-clamp-2 font-sans text-xs leading-relaxed text-slate-400">
                      {article.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 font-mono text-xs text-slate-500">
                    <span>Read entire publication{article.readTime ? ` · ${article.readTime} min` : ""}</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </a>
              ))}
            </CollapsibleList>
          </div>
        </section>
      ) : null,
    achievements:
      achievements.length > 0 ? (
        <section key="achievements" className="py-12" id="achievements">
          <div className="mx-auto max-w-7xl space-y-6 px-4 @sm:px-6 @lg:px-8">
            <SectionHeading>{labels.achievements}</SectionHeading>
            <CollapsibleList
              initial={4}
              wrapperClassName="relative space-y-8 pl-4"
              buttonClassName="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono text-slate-400"
            >
              {achievements.map((achievement) => (
                <div key={achievement.id} className="relative space-y-2 border-l border-white/10 pl-6">
                  <div
                    className="absolute top-1 -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border bg-slate-800"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    <Trophy className="h-2.5 w-2.5" />
                  </div>
                  {achievement.date && (
                    <span className="block font-mono text-[10px] text-slate-500">{formatDate(achievement.date)}</span>
                  )}
                  <h4 className="font-display text-sm font-bold text-white">
                    <RichText text={achievement.title} />
                  </h4>
                </div>
              ))}
            </CollapsibleList>
          </div>
        </section>
      ) : null,
    profiles:
      hasProfiles || socialProfiles.length > 0 ? (
        <section key="profiles" className="scroll-mt-20 py-12" id="profiles">
          <div className="mx-auto max-w-7xl space-y-6 px-4 @sm:px-6 @lg:px-8">
            <SectionHeading>{labels.profiles}</SectionHeading>
            <ProfileLinksSection
              portfolio={portfolio}
              socialProfiles={socialProfiles}
              chipClassName="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-slate-300"
              pillClassName="rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs font-mono text-slate-300 hover:bg-white/10"
              titleClassName="font-display text-sm font-bold text-white"
              textClassName="font-sans text-xs text-slate-400"
            />
          </div>
        </section>
      ) : null,
  };

  return (
    <div
      className={cn(
        styles.root,
        "@container flex min-w-0 flex-col overflow-x-hidden font-sans selection:bg-slate-800 selection:text-white",
      )}
      style={{ ["--lf-accent" as string]: primaryColor }}
    >
      <div
        className="pointer-events-none fixed top-0 left-1/4 h-[40vh] w-[50vw] rounded-full opacity-10 blur-[140px]"
        style={{ backgroundColor: primaryColor }}
      />
      <Header
        portfolioTitle={stripRichTextToPlain(portfolio.title) || "Untitled portfolio"}
        navItems={navItems}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        primaryColor={primaryColor}
        isPublished={isPublished}
      />
      <main className="flex-1">
        <section className="relative overflow-hidden px-0 pt-8 pb-10 scroll-mt-20 @sm:pt-10 @sm:pb-12 @md:py-16" id="about">
          <div
            className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full opacity-20 blur-[120px]"
            style={{ backgroundColor: primaryColor }}
          />
          <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">
            <div className="min-w-0 space-y-4">
              <h1 className="min-w-0 font-serif text-2xl font-normal italic tracking-tight text-white @sm:text-4xl @md:text-5xl @lg:text-7xl">
                <span className="relative inline-block bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text font-sans font-bold text-transparent not-italic">
                  <RichText text={portfolio.title || "Untitled"} />
                </span>
              </h1>
              {portfolio.headline && (
                <h2
                  className="font-display text-base font-medium tracking-tight @md:text-lg @lg:text-xl"
                  style={{ color: primaryColor }}
                >
                  <RichText text={portfolio.headline} />
                </h2>
              )}
              {showSummary && portfolio.summary && (
                <DescriptionBlock
                  text={portfolio.summary}
                  paragraphClassName="font-sans text-base @sm:text-lg text-slate-400 leading-relaxed max-w-2xl"
                  listClassName="space-y-2 pl-5 font-sans text-base @sm:text-lg text-slate-400 leading-relaxed max-w-2xl"
                />
              )}
              <ContactChips
                portfolio={portfolio}
                chipClassName="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-slate-300"
              />
              <div className="space-y-3">
                <HeroProfileButtons
                  profiles={socialProfiles}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                />
                {hasNonHeroSocialProfiles(socialProfiles) && (
                  <SocialPills
                    profiles={socialProfiles}
                    showUsername
                    excludeHeroPlatforms
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {order.map((key) => blocks[key])}

        {customSections.length > 0 && (
          <section className="py-12">
            <div className="mx-auto max-w-7xl space-y-12 px-4 @sm:px-6 @lg:px-8">
              {customSections.map((section) => (
                <div key={section.id} className="space-y-6">
                  <SectionHeading>{section.label}</SectionHeading>
                  <CustomSectionItems
                    items={section.items}
                    titleClassName="font-display text-base font-bold text-white"
                    textClassName="font-sans text-sm text-slate-400 leading-relaxed"
                    chipClassName="rounded-lg border border-white/10 bg-[#0a0a0a] px-2 py-0.5 font-mono text-[10px] text-slate-400"
                    buttonClassName="mt-2 font-mono text-xs text-slate-400 hover:text-white"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <footer className="mx-auto mt-10 w-full max-w-7xl border-t border-white/10 px-4 py-8 @sm:px-6 @lg:px-8">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-slate-500">
          <Cpu className="h-4 w-4" style={{ color: primaryColor }} />
          <span>{stripRichTextToPlain(portfolio.title).toUpperCase()}</span>
        </div>
      </footer>
    </div>
  );
}
