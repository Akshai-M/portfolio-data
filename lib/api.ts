import type { ExportResponse } from "./types";

export const PORTFOLIO_API_BASE = (
  process.env.NEXT_PUBLIC_PORTFOLIO_API_BASE ?? "http://localhost:3000"
).replace(/\/$/, "");

export class PortfolioApiError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = "PortfolioApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function messageForStatus(status: number, fallback: string): string {
  switch (status) {
    case 400:
      return fallback || "Invalid request. isPublished must be true or false.";
    case 401:
      return "Invalid username or password.";
    case 403:
      return `Origin not allowed. Add ${typeof window !== "undefined" ? window.location.origin : "http://localhost:3001"} to Livefolio PORTFOLIO_EXPORT_ORIGINS.`;
    case 429:
      return "Too many attempts. Try again later.";
    case 503:
      return "Portfolio export is not configured or temporarily unavailable on the local Livefolio server.";
    default:
      return fallback || `Request failed (${status}).`;
  }
}

export async function fetchPortfoliosByPublishState(
  username: string,
  password: string,
  isPublished: boolean,
): Promise<ExportResponse> {
  let response: Response;
  try {
    response = await fetch(`${PORTFOLIO_API_BASE}/api/admin/portfolio-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, isPublished }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
    throw new PortfolioApiError(
      `Could not call ${PORTFOLIO_API_BASE}. Confirm local Livefolio is running, export credentials are set, and ${origin} is listed in PORTFOLIO_EXPORT_ORIGINS (CORS).`,
      0,
    );
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
    throw new PortfolioApiError(
      messageForStatus(response.status, errorFromBody),
      response.status,
      Number.isFinite(retryAfter) ? retryAfter : undefined,
    );
  }

  if (!body || typeof body !== "object" || !Array.isArray((body as ExportResponse).portfolios)) {
    throw new PortfolioApiError("Unexpected response from portfolio export API.", 500);
  }

  return body as ExportResponse;
}

export async function fetchAllPortfolios(
  username: string,
  password: string,
  isPublished: boolean,
) {
  const result = await fetchPortfoliosByPublishState(username, password, isPublished);
  return {
    published: isPublished ? result.portfolios : [],
    drafts: isPublished ? [] : result.portfolios,
  };
}
