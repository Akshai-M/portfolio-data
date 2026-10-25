import { NextResponse } from "next/server";
import { fetchLivefolioPortfolios, livefolioOrigin } from "@/lib/livefolio";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const username =
    body && typeof body === "object" && "username" in body && typeof body.username === "string"
      ? body.username.trim()
      : "";
  const password =
    body && typeof body === "object" && "password" in body && typeof body.password === "string"
      ? body.password
      : "";
  const isPublished =
    body &&
    typeof body === "object" &&
    "isPublished" in body &&
    typeof body.isPublished === "boolean"
      ? body.isPublished
      : null;

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  if (isPublished === null) {
    return NextResponse.json({ error: "isPublished must be true or false." }, { status: 400 });
  }

  const result = await fetchLivefolioPortfolios({
    username,
    password,
    isPublished,
    origin: livefolioOrigin(request),
  });

  if (!result.ok) {
    const headers = new Headers();
    if (result.retryAfter) headers.set("Retry-After", String(result.retryAfter));
    return NextResponse.json({ error: result.error }, { status: result.status, headers });
  }

  return NextResponse.json(result.data, { status: 200 });
}
