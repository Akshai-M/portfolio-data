import type { ExportResponse } from "./types";

const LIVEFOLIO_PROD = "https://livefolio.me";

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

function isLocalhostUrl(url: string): boolean {
  return /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

export function livefolioBaseUrl(): string {
  const configured = normalizeUrl(process.env.PORTFOLIO_API_BASE ?? "");
  if (isProductionRuntime()) {
    if (configured && !isLocalhostUrl(configured)) return configured;
    return LIVEFOLIO_PROD;
  }
  return configured || "http://localhost:3000";
}

export function livefolioOrigin(request: Request): string {
  const configured = normalizeUrl(process.env.PORTFOLIO_EXPORT_ORIGIN ?? "");
  const fromRequest = normalizeUrl(request.headers.get("origin") ?? "");
  if (isProductionRuntime()) {
    if (configured && !isLocalhostUrl(configured)) return configured;
    if (fromRequest && !isLocalhostUrl(fromRequest)) return fromRequest;
    return LIVEFOLIO_PROD;
  }
  return configured || fromRequest || "http://localhost:3000";
}

export type LivefolioResult =
  | { ok: true; data: ExportResponse }
  | { ok: false; status: number; error: string; retryAfter?: number };

export async function fetchLivefolioPortfolios(options: {
  username: string;
  password: string;
  isPublished: boolean;
  origin: string;
}): Promise<LivefolioResult> {
  const base = livefolioBaseUrl();
  let response: Response;

  try {
    response = await fetch(`${base}/api/admin/portfolio-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: options.origin,
      },
      body: JSON.stringify({
        username: options.username,
        password: options.password,
        isPublished: options.isPublished,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    return {
      ok: false,
      status: 502,
      error: `Could not reach Livefolio at ${base}.`,
    };
  }

  const retryAfterHeader = response.headers.get("Retry-After");
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  const errorFromBody =
    body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? body.error
      : "";

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: errorFromBody || defaultMessage(response.status, options.origin, base),
      retryAfter: Number.isFinite(retryAfter) ? retryAfter : undefined,
    };
  }

  if (!body || typeof body !== "object" || !Array.isArray((body as ExportResponse).portfolios)) {
    return { ok: false, status: 502, error: "Unexpected response from Livefolio export API." };
  }

  return { ok: true, data: body as ExportResponse };
}

function defaultMessage(status: number, origin: string, base: string): string {
  switch (status) {
    case 400:
      return "Invalid request. isPublished must be true or false.";
    case 401:
      return "Invalid username or password.";
    case 403:
      return `Livefolio rejected origin ${origin}. Add it to PORTFOLIO_EXPORT_ORIGINS.`;
    case 404:
      return `Livefolio export was not found at ${base}/api/admin/portfolio-data. Set PORTFOLIO_API_BASE to the Livefolio origin, not this app.`;
    case 429:
      return "Too many attempts. Try again later.";
    case 503:
      return "Portfolio export is not configured or temporarily unavailable on Livefolio.";
    default:
      return `Livefolio request failed (${status}).`;
  }
}
