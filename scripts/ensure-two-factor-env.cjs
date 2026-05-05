"use strict";

/**
 * One-shot: append TWO_FACTOR_ENCRYPTION_KEY to .env if the variable is not set.
 * Run from repo root: node scripts/ensure-two-factor-env.cjs
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");
let text = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
if (/^TWO_FACTOR_ENCRYPTION_KEY\s*=/m.test(text)) {
  console.log("[ensure-two-factor-env] TWO_FACTOR_ENCRYPTION_KEY already in .env — skipping.");
  process.exit(0);
}
const key = crypto.randomBytes(32).toString("base64");
const block = `\n# TOTP 2FA (AES-256-GCM) — 32-byte key, base64\nTWO_FACTOR_ENCRYPTION_KEY="${key}"\n`;
const prefix = text && !text.endsWith("\n") ? "\n" : "";
fs.appendFileSync(envPath, prefix + block);
console.log("[ensure-two-factor-env] Appended TWO_FACTOR_ENCRYPTION_KEY to .env");
