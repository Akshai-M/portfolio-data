import type { PublishFilter } from "./types";

const USERNAME_KEY = "portfolio-export-username";
const PASSWORD_KEY = "portfolio-export-password";
const PUBLISHED_KEY = "portfolio-export-is-published";

export function readStoredCredentials(): {
  username: string;
  password: string;
  isPublished: PublishFilter;
} | null {
  if (typeof window === "undefined") return null;
  const username = sessionStorage.getItem(USERNAME_KEY)?.trim() ?? "";
  const password = sessionStorage.getItem(PASSWORD_KEY) ?? "";
  if (!username || !password) return null;
  return { username, password, isPublished: readStoredPublishFilter() };
}

export function writeStoredCredentials(
  username: string,
  password: string,
  isPublished: PublishFilter,
) {
  sessionStorage.setItem(USERNAME_KEY, username);
  sessionStorage.setItem(PASSWORD_KEY, password);
  sessionStorage.setItem(PUBLISHED_KEY, String(isPublished));
}

export function readStoredPublishFilter(): PublishFilter {
  return sessionStorage.getItem(PUBLISHED_KEY) !== "false";
}

export function clearStoredCredentials() {
  sessionStorage.removeItem(USERNAME_KEY);
  sessionStorage.removeItem(PASSWORD_KEY);
  sessionStorage.removeItem(PUBLISHED_KEY);
}
