"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Terminal } from "lucide-react";
import { useAuth } from "./auth-provider";
import { PortfolioApiError } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const { login, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password, isPublished);
      router.replace("/portfolios");
    } catch (err) {
      const retry =
        err instanceof PortfolioApiError && err.retryAfter
          ? ` Retry after ${err.retryAfter}s.`
          : "";
      setLocalError((err instanceof Error ? err.message : "Sign-in failed.") + retry);
    } finally {
      setSubmitting(false);
    }
  }

  const message = localError || error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div
        className="pointer-events-none fixed top-0 left-1/4 h-[40vh] w-[50vw] rounded-full bg-sky-500/10 blur-[140px]"
        aria-hidden
      />
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sky-400">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Portfolio export</h1>
            <p className="font-mono text-[11px] tracking-wide text-slate-500 uppercase">Local viewer</p>
          </div>
        </div>
        <label className="block space-y-2">
          <span className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Username</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
            className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-white/30"
          />
        </label>
        <label className="block space-y-2">
          <span className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-white/30"
          />
        </label>
        <fieldset className="space-y-2">
          <legend className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">
            isPublished
          </legend>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsPublished(true)}
              aria-pressed={isPublished}
              className={`rounded-lg border px-3 py-1.5 font-mono text-xs ${
                isPublished
                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-200"
                  : "border-white/10 bg-white/5 text-slate-500 hover:text-slate-300"
              }`}
            >
              true
            </button>
            <button
              type="button"
              onClick={() => setIsPublished(false)}
              aria-pressed={!isPublished}
              className={`rounded-lg border px-3 py-1.5 font-mono text-xs ${
                !isPublished
                  ? "border-amber-500/50 bg-amber-500/20 text-amber-100"
                  : "border-white/10 bg-white/5 text-slate-500 hover:text-slate-300"
              }`}
            >
              false
            </button>
          </div>
        </fieldset>
        {message && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 font-sans text-sm text-red-200">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 font-mono text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {submitting ? "Loading portfolios…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
