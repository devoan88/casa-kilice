/**
 * Server-side helpers to reduce XSS and log-injection risk when persisting or echoing user text.
 * Prisma parameterised queries already mitigate SQL injection; these focus on normalising text.
 */

const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Remove ASCII control characters (incl. NUL) that can break logs or parsers. */
export function stripControlChars(input: string): string {
  return input.replace(CTRL, "");
}

/** Collapse whitespace, strip controls, enforce max length (UTF-16 code units). */
export function sanitizePlainText(input: string, maxLen: number): string {
  const t = stripControlChars(input).trim().replace(/\s+/g, " ");
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen);
}

/** Normalise email: trim, lower-case ASCII, strip controls. */
export function sanitizeEmail(input: string): string {
  return stripControlChars(input).trim().toLowerCase();
}

/** For path/referrer-style fields: strip controls, single line, max length. */
export function sanitizeSingleLine(input: string | undefined, maxLen: number): string | undefined {
  if (input == null) return undefined;
  const t = stripControlChars(input).trim().replace(/[\r\n]+/g, " ");
  if (t.length === 0) return undefined;
  return t.length <= maxLen ? t : t.slice(0, maxLen);
}
