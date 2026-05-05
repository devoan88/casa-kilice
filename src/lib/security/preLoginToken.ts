import crypto from "crypto";

const TTL_SEC = 5 * 60;

export function createPreLoginToken(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for 2FA login tokens.");
  const payload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + TTL_SEC,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifyPreLoginToken(token: string): { sub: string } | null {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return null;
  const expectedSig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  const a = crypto.createHash("sha256").update(sig, "utf8").digest();
  const b = crypto.createHash("sha256").update(expectedSig, "utf8").digest();
  if (!crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      sub?: string;
      exp?: number;
    };
    if (!payload.sub || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
