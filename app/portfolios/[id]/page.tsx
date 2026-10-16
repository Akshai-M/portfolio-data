"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { RequireAuth } from "@/components/require-auth";
import { PulseTemplate } from "@/components/pulse/pulse-template";

function PortfolioDetail() {
  const params = useParams<{ id: string }>();
  const { portfolios, status } = useAuth();
  const item = portfolios.find((portfolio) => portfolio.id === params.id);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] font-mono text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a] px-4 text-center">
        <p className="font-sans text-sm text-slate-400">This portfolio is not in the current export.</p>
        <Link href="/portfolios" className="font-mono text-xs text-slate-300 underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a]">
      <div className="sticky top-0 z-[60] border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/portfolios"
            className="inline-flex items-center gap-2 font-mono text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All portfolios
          </Link>
          <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
            {item.owner.email}
          </span>
        </div>
      </div>
      <PulseTemplate data={item.data} isPublished={item.isPublished} />
    </div>
  );
}

export default function PortfolioDetailPage() {
  return (
    <RequireAuth>
      <PortfolioDetail />
    </RequireAuth>
  );
}
