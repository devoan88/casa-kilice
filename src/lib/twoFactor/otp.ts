import { generateSecret, generateURI, verifySync } from "otplib";

const ISSUER = "Casa Kilicé";

/** Allow ±30s clock skew (RFC 6238 window). */
export function generateTotpSecret(): string {
  return generateSecret();
}

export function buildTotpKeyUri(email: string, secret: string): string {
  return generateURI({ issuer: ISSUER, label: email, secret });
}

export function verifyTotpToken(secret: string, token: string): boolean {
  const result = verifySync({
    secret,
    token,
    epochTolerance: 30,
  });
  return result.valid === true;
}
