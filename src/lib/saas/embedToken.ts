import { createHmac, timingSafeEqual } from "node:crypto";

type EmbedPayload = {
  kid: string;
  exp: number;
};

function secret(): string | null {
  return process.env.SAAS_EMBED_HMAC_SECRET?.trim() || process.env.SKIN_ENGINE_SECRET?.trim() || null;
}

export function signSaasEmbedToken(apiKeyId: string, ttlSeconds = 3600): string | null {
  const s = secret();
  if (!s) return null;
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload: EmbedPayload = { kid: apiKeyId, exp };
  const p = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", s).update(p).digest("base64url");
  return `ck_embed_${p}.${sig}`;
}

export function verifySaasEmbedToken(token: string): { apiKeyId: string } | null {
  const s = secret();
  if (!s || !token.startsWith("ck_embed_")) return null;
  const rest = token.slice("ck_embed_".length);
  const dot = rest.lastIndexOf(".");
  if (dot <= 0) return null;
  const p = rest.slice(0, dot);
  const sig = rest.slice(dot + 1);
  const expected = createHmac("sha256", s).update(p).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let parsed: EmbedPayload;
  try {
    parsed = JSON.parse(Buffer.from(p, "base64url").toString("utf8")) as EmbedPayload;
  } catch {
    return null;
  }
  if (!parsed.kid || typeof parsed.exp !== "number") return null;
  if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
  return { apiKeyId: parsed.kid };
}
