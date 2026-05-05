import { randomBytes } from "crypto";

export function makeProductSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = randomBytes(3).toString("hex");
  return `${base || "product"}-${suffix}`;
}
