import crypto from "crypto";

export function hashSaasApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey, "utf8").digest("hex");
}

/** Format: ck_saas_<48 hex> — show prefix only in admin after creation. */
export function generateSaasApiKey(): { rawKey: string; lookupHash: string; keyPrefix: string } {
  const secret = crypto.randomBytes(24).toString("hex");
  const rawKey = `ck_saas_${secret}`;
  return {
    rawKey,
    lookupHash: hashSaasApiKey(rawKey),
    keyPrefix: `${rawKey.slice(0, 14)}…`,
  };
}
