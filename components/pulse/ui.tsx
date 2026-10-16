"use client";

import { Children, useState, type ReactNode } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { cn } from "@/lib/cn";
import { parseDescription } from "@/lib/description";
import { platformLabel } from "@/lib/format";
import { RichText } from "@/lib/rich-text";
import type { PortfolioData } from "@/lib/types";

export const HERO_PROFILE_PLATFORMS = [
  "github",
  "linkedin",
  "medium",
  "devto",
  "hashnode",
  "leetcode",
  "codeforces",
  "stackoverflow",
] as const;

const HERO_SET = new Set<string>(HERO_PROFILE_PLATFORMS);

export function isHeroProfilePlatform(platform: string) {
  return HERO_SET.has(platform.toLowerCase());
}

export function visibleSocialProfiles(
  profiles: PortfolioData["socialProfiles"],
  options?: { excludeHeroPlatforms?: boolean },
) {
  return profiles.filter((profile) => {
    const platform = profile.platform.toLowerCase();
    if (platform === "unknown") return false;
    if (options?.excludeHeroPlatforms && isHeroProfilePlatform(platform)) return false;
    return true;
  });
}

export function hasNonHeroSocialProfiles(profiles: PortfolioData["socialProfiles"]) {
  return visibleSocialProfiles(profiles, { excludeHeroPlatforms: true }).length > 0;
}

export function hasContactOrSocialProfiles(
  portfolio: PortfolioData["portfolio"],
  profiles: PortfolioData["socialProfiles"],
  options?: { excludeHeroPlatforms?: boolean },
) {
  return (
    visibleSocialProfiles(profiles, options).length > 0 ||
    Boolean(portfolio.contactEmail || portfolio.phone || portfolio.websiteUrl || portfolio.location)
  );
}

export function PlatformGlyph({ className }: { platform: string; className?: string }) {
  return <Globe className={className} />;
}

export function CollapsibleList({
  children,
  initial = 4,
  wrapperClassName,
  buttonClassName,
}: {
  children: ReactNode;
  initial?: number;
  wrapperClassName?: string;
  buttonClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = Children.toArray(children);
  const hidden = Math.max(0, items.length - initial);
  const visible = expanded ? items : items.slice(0, initial);

  return (
    <div className={wrapperClassName}>
      {visible}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={cn("inline-flex cursor-pointer items-center justify-center", buttonClassName)}
        >
          {expanded ? "Show less" : `Show ${hidden} more`}
        </button>
      )}
    </div>
  );
}

export function DescriptionBlock({
  text,
  paragraphClassName,
  listClassName,
  headingClassName,
}: {
  text: string;
  paragraphClassName?: string;
  listClassName?: string;
  headingClassName?: string;
}) {
  const nodes = parseDescription(text);
  if (nodes.length === 0) return null;

  return (
    <div className="space-y-2">
      {nodes.map((node, index) => {
        if (node.type === "heading") {
          return (
            <p key={`h-${index}`} className={headingClassName ?? paragraphClassName}>
              <RichText text={node.text} />
            </p>
          );
        }
        if (node.type === "paragraph") {
          return (
            <p key={`p-${index}`} className={paragraphClassName}>
              <RichText text={node.text} />
            </p>
          );
        }
        return (
          <ul key={`l-${index}`} className={cn("list-disc list-outside", listClassName)}>
            {node.items.map((item, itemIndex) => (
              <li key={`${itemIndex}-${item}`}>
                <RichText text={item} />
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}

export function ContactChips({
  portfolio,
  chipClassName,
}: {
  portfolio: PortfolioData["portfolio"];
  chipClassName?: string;
}) {
  const items = [
    portfolio.location,
    portfolio.contactEmail,
    portfolio.phone,
    portfolio.websiteUrl?.replace(/^https?:\/\//, ""),
  ].filter(Boolean) as string[];

  if (items.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-col gap-2 @sm:flex-row @sm:flex-wrap">
      {items.map((item) => (
        <span key={item} className={cn(chipClassName, "max-w-full min-w-0 [overflow-wrap:anywhere]")}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function SocialPills({
  profiles,
  className,
  showUsername = false,
  excludeHeroPlatforms = false,
}: {
  profiles: PortfolioData["socialProfiles"];
  className?: string;
  showUsername?: boolean;
  excludeHeroPlatforms?: boolean;
}) {
  const visible = visibleSocialProfiles(profiles, { excludeHeroPlatforms });
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((profile) => {
        const username = profile.username?.replace(/^@+/, "").trim();
        return (
          <a
            key={`${profile.platform}-${profile.url}`}
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            <span className="inline-flex items-center gap-1.5">
              <PlatformGlyph platform={profile.platform} className="h-3.5 w-3.5" />
              <span>{platformLabel(profile.platform)}</span>
              {showUsername && username ? <span>· @{username}</span> : null}
            </span>
          </a>
        );
      })}
    </div>
  );
}

export function HeroProfileButtons({
  profiles,
  className,
}: {
  profiles: PortfolioData["socialProfiles"];
  className?: string;
}) {
  const preferred = HERO_PROFILE_PLATFORMS.map((platform) =>
    profiles.find((profile) => profile.platform.toLowerCase() === platform),
  ).filter(
    (profile): profile is PortfolioData["socialProfiles"][number] =>
      Boolean(profile) && profile!.platform.toLowerCase() !== "unknown",
  );

  if (preferred.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {preferred.map((profile) => (
        <a
          key={`${profile.platform}-${profile.url}`}
          href={profile.url}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          <span className="inline-flex items-center gap-1.5">
            <PlatformGlyph platform={profile.platform} className="h-3.5 w-3.5" />
            <span>{platformLabel(profile.platform)}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

export function ProjectActions({
  liveUrl,
  sourceUrl,
  liveClassName,
  sourceClassName,
}: {
  liveUrl: string | null;
  sourceUrl: string | null;
  liveClassName?: string;
  sourceClassName?: string;
}) {
  if (!liveUrl && !sourceUrl) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {liveUrl && (
        <a href={liveUrl} target="_blank" rel="noopener noreferrer" className={liveClassName}>
          Live Demo
        </a>
      )}
      {sourceUrl && (
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className={sourceClassName}>
          Source
        </a>
      )}
    </div>
  );
}

export function TechChip({ name, className }: { name: string; className?: string }) {
  return <span className={className}>{name}</span>;
}

export function CustomSectionItems({
  items,
  titleClassName,
  textClassName,
  chipClassName,
  buttonClassName,
}: {
  items: Record<string, unknown>[];
  titleClassName?: string;
  textClassName?: string;
  chipClassName?: string;
  buttonClassName?: string;
}) {
  if (items.length === 0) return null;
  const hidden = new Set(["id", "sortOrder"]);

  return (
    <CollapsibleList initial={4} wrapperClassName="space-y-3" buttonClassName={buttonClassName}>
      {items.map((item, index) => {
        const title = item.title ?? item.name ?? item.label;
        const description = item.description ?? item.details ?? item.summary;
        const descriptionText =
          typeof description === "string" ? description : description ? JSON.stringify(description) : "";
        const date = item.date ?? item.startDate ?? item.year;
        const url = item.url ?? item.link;
        const otherKeys = Object.keys(item).filter(
          (key) =>
            !hidden.has(key) &&
            !["title", "name", "label", "description", "details", "summary", "date", "startDate", "year", "url", "link"].includes(
              key,
            ),
        );

        return (
          <div key={index} className="space-y-1">
            {title != null && (
              <p className={titleClassName}>
                {url ? (
                  <a
                    href={String(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dotted hover:decoration-solid"
                  >
                    {String(title)}
                  </a>
                ) : (
                  String(title)
                )}
                {date != null && <span className={textClassName}> ({String(date)})</span>}
              </p>
            )}
            {descriptionText ? (
              <DescriptionBlock
                text={descriptionText}
                paragraphClassName={textClassName}
                listClassName={cn(textClassName, "list-disc space-y-1 pl-4")}
              />
            ) : null}
            {otherKeys.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {otherKeys.map((key) => {
                  const value = item[key];
                  if (value == null || value === "") return null;
                  return (
                    <span key={key} className={chipClassName}>
                      {key}: {Array.isArray(value) ? value.map(String).join(", ") : String(value)}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </CollapsibleList>
  );
}

export function ProfileLinksSection({
  portfolio,
  socialProfiles,
  chipClassName,
  pillClassName,
  titleClassName,
  textClassName,
}: {
  portfolio: PortfolioData["portfolio"];
  socialProfiles: PortfolioData["socialProfiles"];
  chipClassName?: string;
  pillClassName?: string;
  titleClassName?: string;
  textClassName?: string;
}) {
  if (!hasContactOrSocialProfiles(portfolio, socialProfiles, { excludeHeroPlatforms: true })) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div>
        <p className={cn("text-sm font-medium", titleClassName)}>Reach out</p>
        <p className={cn("mt-2 text-sm", textClassName)}>
          Use these links to connect, collaborate, or explore more work.
        </p>
      </div>
      <ContactChips portfolio={portfolio} chipClassName={chipClassName} />
      <SocialPills
        profiles={socialProfiles}
        showUsername
        excludeHeroPlatforms
        className={pillClassName}
      />
    </div>
  );
}

export function ArticleSourceLabel({ source, className }: { source?: string | null; className?: string }) {
  if (!source) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider opacity-80",
        className,
      )}
    >
      <PlatformGlyph platform={source} className="h-3 w-3" />
      <span>{platformLabel(source)}</span>
    </span>
  );
}

const DARK_CELLS = [
  "bg-zinc-900 ring-1 ring-inset ring-white/5",
  "bg-[color-mix(in_srgb,var(--lf-accent)_22%,#0a0a0a)]",
  "bg-[color-mix(in_srgb,var(--lf-accent)_42%,#0a0a0a)]",
  "bg-[color-mix(in_srgb,var(--lf-accent)_65%,#0a0a0a)]",
  "bg-[var(--lf-accent)]",
];

export type ContributionCalendar = {
  totalContributions: number;
  weeks: Array<{ contributionDays: Array<{ date: string; contributionCount: number }> }>;
};

export function parseContributionCalendar(raw: unknown): ContributionCalendar | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.weeks) || typeof record.totalContributions !== "number") return null;
  const weeks: ContributionCalendar["weeks"] = [];
  for (const week of record.weeks) {
    if (!week || typeof week !== "object") continue;
    const days = (week as Record<string, unknown>).contributionDays;
    if (!Array.isArray(days)) continue;
    const contributionDays: ContributionCalendar["weeks"][number]["contributionDays"] = [];
    for (const day of days) {
      if (!day || typeof day !== "object") continue;
      const rec = day as Record<string, unknown>;
      if (typeof rec.date !== "string") continue;
      const count =
        typeof rec.contributionCount === "number"
          ? rec.contributionCount
          : typeof rec.contributionCount === "string"
            ? Number(rec.contributionCount) || 0
            : 0;
      contributionDays.push({ date: rec.date, contributionCount: count });
    }
    weeks.push({ contributionDays });
  }
  if (weeks.length === 0) return null;
  return { totalContributions: record.totalContributions, weeks };
}

export function GitHubContributionHeatmap({
  calendar,
  profileUrl,
  username,
}: {
  calendar: ContributionCalendar;
  profileUrl?: string | null;
  username?: string | null;
}) {
  const cellClass = (count: number) => {
    if (count === 0) return DARK_CELLS[0];
    if (count <= 2) return DARK_CELLS[1];
    if (count <= 5) return DARK_CELLS[2];
    if (count <= 9) return DARK_CELLS[3];
    return DARK_CELLS[4];
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
        <p>
          <span className="font-semibold text-white">{calendar.totalContributions}</span> contributions
          in the last year
        </p>
        {profileUrl && username ? (
          <p>
            ·{" "}
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--lf-accent)] underline underline-offset-2"
            >
              @{username}
            </a>
          </p>
        ) : null}
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="flex w-max gap-[3px]">
          {calendar.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.contributionDays.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.contributionCount}`}
                  className={`h-3 w-3 rounded-[3px] ${cellClass(day.contributionCount)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectPreview({
  imageUrl,
  title,
  liveUrl,
}: {
  imageUrl: string | null;
  title: string;
  liveUrl: string | null;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={title} className="h-48 w-full object-cover opacity-75" />
    );
  }
  return (
    <div className="flex h-48 w-full items-center justify-center bg-[#0a0a0a] text-slate-600">
      {liveUrl ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-mono">
          <ExternalLink className="h-3.5 w-3.5" />
          Preview
        </span>
      ) : (
        <span className="font-mono text-xs">No preview</span>
      )}
    </div>
  );
}
