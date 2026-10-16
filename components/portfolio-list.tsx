"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LogOut, RefreshCw, Search } from "lucide-react";
import { useAuth } from "./auth-provider";
import { formatRelativeUpdated } from "@/lib/format";
import { stripRichTextToPlain } from "@/lib/rich-text";
import type { ViewerPortfolio } from "@/lib/types";

function counts(item: ViewerPortfolio) {
  return {
    projects: item.data.projects.length,
    experiences: item.data.experiences.length,
    skills: item.data.skills.length,
  };
}

export function PortfolioList() {
  const { portfolios, isPublished, warning, logout, reload } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [reloading, setReloading] = useState(false);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return portfolios.filter((item) => {
      if (filter === "published" && !item.isPublished) return false;
      if (filter === "draft" && item.isPublished) return false;
      if (!normalized) return true;
      const haystack = [
        item.data.portfolio.title,
        item.data.portfolio.headline,
        item.owner.name,
        item.owner.email,
        item.slug,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [portfolios, query, filter]);

  const publishedCount = portfolios.filter((item) => item.isPublished).length;
  const draftCount = portfolios.length - publishedCount;

  async function onReload() {
    setReloading(true);
    try {
      await reload();
    } finally {
      setReloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300">
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Local export</p>
            <h1 className="font-serif text-3xl italic text-slate-100">Portfolios</h1>
            <p className="mt-1 font-mono text-xs text-slate-500">
              isPublished: {String(isPublished)} · {publishedCount} published · {draftCount} draft ·{" "}
              {portfolios.length} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReload}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-slate-300 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${reloading ? "animate-spin" : ""}`} />
              Reload
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-slate-300 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {warning && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Published portfolios loaded, but drafts failed: {warning}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, owner, slug…"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pr-3 pl-10 font-sans text-sm text-white outline-none focus:border-white/30"
            />
          </label>
          <div className="flex gap-2">
            {(
              [
                ["all", "All"],
                ["published", "Published"],
                ["draft", "Draft"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-lg border px-3 py-2 font-mono text-xs ${
                  filter === value
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-5 py-12 text-center text-sm text-slate-500">
            No portfolios match this filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visible.map((item) => {
              const stats = counts(item);
              const title = stripRichTextToPlain(item.data.portfolio.title) || "Untitled portfolio";
              return (
                <Link
                  key={item.id}
                  href={`/portfolios/${item.id}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-bold text-white">{title}</h2>
                      {item.data.portfolio.headline && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                          {stripRichTextToPlain(item.data.portfolio.headline)}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
                        item.isPublished
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-4 font-mono text-xs text-slate-500">
                    {item.owner.name || "Unnamed"} · {item.owner.email}
                    {item.slug ? ` · /${item.slug}` : ""}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-slate-600">
                    {stats.experiences} exp · {stats.projects} projects · {stats.skills} skills
                    {item.updatedAt ? ` · updated ${formatRelativeUpdated(item.updatedAt)}` : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
