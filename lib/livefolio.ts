import type { ExportResponse } from "./types";

export function livefolioBaseUrl(): string {
  return (
    process.env.PORTFOLIO_API_BASE ??
    "https://localhost:3000"
  ).replace(/\/$/, "");
}

export function livefolioOrigin(request: Request): string {
  return (
    process.env.PORTFOLIO_EXPORT_ORIGIN ??
    request.headers.get("origin")?.trim() ??
    "https://localhost:3000"
  ).replace(/\/$/, "");
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
