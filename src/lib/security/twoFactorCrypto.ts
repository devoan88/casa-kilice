import crypto from "crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const b64 = process.env.TWO_FACTOR_ENCRYPTION_KEY?.trim();
  if (!b64) {
    throw new Error("TWO_FACTOR_ENCRYPTION_KEY is not set (must be 32 bytes, base64-encoded).");
  }
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new Error("TWO_FACTOR_ENCRYPTION_KEY must decode to exactly 32 bytes.");
  }
  return key;
}

/** Store in DB: iv(12) + authTag(16) + ciphertext */
export function encryptTwoFactorSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv, { authTagLength: 16 });
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptTwoFactorSecret(blob: string): string {
  const raw = Buffer.from(blob, "base64");
  if (raw.length < 12 + 16 + 1) throw new Error("Invalid ciphertext");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv, { authTagLength: 16 });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
