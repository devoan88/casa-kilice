/** Max analyses per billing month for Basic subscription (env override). */
export function saasBasicMonthlyScanCap(): number {
  const n = Number(process.env.SAAS_BASIC_MONTHLY_SCANS ?? "100");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 100;
}

export type SubscriptionTierCode = "none" | "basic" | "premium";

export function isActiveSubscriptionStatus(status: string): boolean {
  return status === "active" || status === "trialing";
}

/** Requests per minute for authenticated B2B analyze calls, by tier. */
export function saasTierRequestsPerMinute(tier: string, subscriptionStatus: string): number {
  if (!isActiveSubscriptionStatus(subscriptionStatus)) {
    const n = Number(process.env.SAAS_RATE_CREDITS_RPM ?? "40");
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 40;
  }
  if (tier === "premium") {
    const n = Number(process.env.SAAS_RATE_PREMIUM_RPM ?? "300");
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 300;
  }
  if (tier === "basic") {
    const n = Number(process.env.SAAS_RATE_BASIC_RPM ?? "120");
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 120;
  }
  const n = Number(process.env.SAAS_RATE_CREDITS_RPM ?? "40");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 40;
}
