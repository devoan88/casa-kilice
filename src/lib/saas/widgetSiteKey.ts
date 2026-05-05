import { randomBytes } from "node:crypto";

export function newWidgetSiteKey(): string {
  return `ckw_${randomBytes(18).toString("base64url")}`;
}
