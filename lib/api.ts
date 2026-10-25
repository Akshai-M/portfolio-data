import type { ExportResponse } from "./types";

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

export async function fetchPortfoliosByPublishState(
  username: string,
  password: string,
  isPublished: boolean,
): Promise<ExportResponse> {
  let response: Response;
  try {
    response = await fetch("/api/portfolios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, isPublished }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new PortfolioApiError("Could not reach this app's /api/portfolios route.", 0);
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
      errorFromBody || `Request failed (${response.status}).`,
      response.status,
      Number.isFinite(retryAfter) ? retryAfter : undefined,
    );
  }

  if (!body || typeof body !== "object" || !Array.isArray((body as ExportResponse).portfolios)) {
    throw new PortfolioApiError("Unexpected response from /api/portfolios.", 500);
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
