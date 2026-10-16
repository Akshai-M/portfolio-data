"use client";

import { PortfolioList } from "@/components/portfolio-list";
import { RequireAuth } from "@/components/require-auth";

export default function PortfoliosPage() {
  return (
    <RequireAuth>
      <PortfolioList />
    </RequireAuth>
  );
}
