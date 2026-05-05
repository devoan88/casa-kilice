/** `.env` values are sometimes wrapped in quotes; normalize for comparisons and bcrypt. */
export function stripEnvQuotes(s: string): string {
  const t = s.trim();
  if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

export function normalizedAdminEmail(): string {
  return stripEnvQuotes(process.env.ADMIN_EMAIL ?? "").toLowerCase();
}

export function normalizedAdminPasswordHash(): string {
  return stripEnvQuotes(process.env.ADMIN_PASSWORD_HASH ?? "");
}

export function normalizedAdminPasswordPlain(): string {
  return stripEnvQuotes(process.env.ADMIN_PASSWORD ?? "");
}
