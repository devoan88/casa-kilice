"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const url = process.env.DATABASE_URL || "file:./dev.db";
let dbPath;
if (url.startsWith("file:")) {
  const rel = url.replace(/^file:\.?\//, "").replace(/^\.\//, "");
  dbPath = path.isAbsolute(rel) ? rel : path.join(root, rel);
} else {
  console.error("[backup-dev-db] DATABASE_URL is not a file: URL — skipping.");
  process.exit(0);
}

if (!fs.existsSync(dbPath)) {
  console.warn("[backup-dev-db] Database file not found:", dbPath);
  process.exit(0);
}

const backupsDir = path.join(root, "backups");
fs.mkdirSync(backupsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const dest = path.join(backupsDir, `dev-${stamp}.db`);
fs.copyFileSync(dbPath, dest);
console.log("[backup-dev-db] Copied to", path.relative(root, dest));
