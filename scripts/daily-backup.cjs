"use strict";

/**
 * Daily-style backup for Casa Kilicé:
 * - SQLite: consistent snapshot via better-sqlite3 .backup() when possible, else file copy.
 * - Copies local `storage/` (Muse uploads) when present.
 * - PostgreSQL: runs `pg_dump` if DATABASE_URL looks like Postgres and `pg_dump` is on PATH.
 *
 * Scheduling (pick one):
 * - Windows Task Scheduler: daily, Action = Program `node`, Arguments =
 *   `C:\path\to\casa-kilice\scripts\daily-backup.cjs`, Start in = repo root; set env or rely on .env.
 * - Linux/macOS cron: `0 3 * * * cd /path/to/casa-kilice && /usr/bin/node scripts/daily-backup.cjs`
 * - Vercel/hosted DB: use provider backups (Vercel Postgres, Neon, Supabase snapshots) + this script
 *   only on a machine that has DATABASE_URL and the DB file reachable.
 *
 * Env: DATABASE_URL, optional BACKUP_RETENTION_DAYS (default 14), optional BACKUPS_ROOT.
 *
 * Optional cloud sync (Rclone):
 * - Set RCLONE_REMOTE_NAME to the remote you created with `rclone config` (e.g. remote_backup).
 * - Optional RCLONE_REMOTE_PATH (default: casa-kilice-backups) — folder on that remote.
 * - After local backup + prune, runs: rclone copy <backupsRoot> <remote>:<path>/ --max-age 24h
 * - If rclone is missing or the copy fails, logs a warning only (backup still succeeds).
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotEnv(path.join(root, ".env"));

const retainDays = Math.max(1, Number(process.env.BACKUP_RETENTION_DAYS || "14") || 14);
const backupsRoot = process.env.BACKUPS_ROOT
  ? path.resolve(process.env.BACKUPS_ROOT)
  : path.join(root, "backups", "daily");

function isoStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function rmRecursive(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, name.name);
    const to = path.join(dest, name.name);
    if (name.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
  return true;
}

function resolveSqlitePath(url) {
  if (!url.startsWith("file:")) return null;
  let raw = url.replace(/^file:/, "");
  if (raw.startsWith("//")) raw = raw.slice(2);
  raw = raw.replace(/^\.\//, "");
  const q = raw.indexOf("?");
  if (q >= 0) raw = raw.slice(0, q);
  return path.isAbsolute(raw) ? raw : path.join(root, raw);
}

async function backupSqlite(dbPath, destFile) {
  fs.mkdirSync(path.dirname(destFile), { recursive: true });
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require -- project dependency
    const Database = require("better-sqlite3");
    const db = new Database(dbPath, { readonly: true, fileMustExist: true });
    await db.backup(destFile);
    db.close();
    console.log("[daily-backup] SQLite (better-sqlite3 backup):", path.relative(root, destFile));
    return true;
  } catch (e) {
    console.warn("[daily-backup] better-sqlite3 backup failed, using copy:", e.message);
    fs.copyFileSync(dbPath, destFile);
    const base = path.basename(dbPath);
    const dir = path.dirname(dbPath);
    for (const suf of ["-wal", "-shm"]) {
      const side = path.join(dir, base + suf);
      if (fs.existsSync(side)) {
        fs.copyFileSync(side, destFile + suf);
        console.log("[daily-backup] copied sidecar:", suf);
      }
    }
    console.log("[daily-backup] SQLite (file copy):", path.relative(root, destFile));
    return true;
  }
}

function backupPostgres(databaseUrl, destSql) {
  const pgDump = spawnSync("pg_dump", [databaseUrl, "--no-owner", "--format=plain", "-f", destSql], {
    encoding: "utf8",
    shell: false,
  });
  if (pgDump.error && pgDump.error.code === "ENOENT") {
    console.warn(
      "[daily-backup] Postgres URL detected but `pg_dump` not found. Install PostgreSQL client tools or use host snapshots.",
    );
    return false;
  }
  if (pgDump.status !== 0) {
    console.error("[daily-backup] pg_dump failed:", pgDump.stderr || pgDump.stdout);
    return false;
  }
  console.log("[daily-backup] Postgres dump:", path.relative(root, destSql));
  return true;
}

function pruneOldRuns() {
  if (!fs.existsSync(backupsRoot)) return;
  const cutoff = Date.now() - retainDays * 24 * 60 * 60 * 1000;
  for (const name of fs.readdirSync(backupsRoot)) {
    const full = path.join(backupsRoot, name);
    if (!fs.statSync(full).isDirectory()) continue;
    const stat = fs.statSync(full);
    if (stat.mtimeMs < cutoff) {
      rmRecursive(full);
      console.log("[daily-backup] pruned old run:", name);
    }
  }
}

/** Best-effort: upload recent files under backupsRoot to a configured rclone remote. */
function syncCloudWithRclone() {
  const remote = process.env.RCLONE_REMOTE_NAME?.trim();
  if (!remote) {
    return;
  }
  const destPath = (process.env.RCLONE_REMOTE_PATH || "casa-kilice-backups").trim().replace(/^\/+|\/+$/g, "");
  const remoteSpec = `${remote}:${destPath}/`;
  if (!fs.existsSync(backupsRoot)) {
    console.warn("[daily-backup] rclone skipped: local backups folder missing:", backupsRoot);
    return;
  }
  const localArg = backupsRoot.replace(/[/\\]$/, "") + path.sep;
  const args = ["copy", localArg, remoteSpec, "--max-age", "24h"];
  const r = spawnSync("rclone", args, {
    encoding: "utf8",
    shell: false,
    windowsHide: true,
  });
  if (r.error && r.error.code === "ENOENT") {
    console.warn(
      "[daily-backup] rclone not found on PATH; install rclone and run `rclone config`. Cloud upload skipped.",
    );
    return;
  }
  if (r.status !== 0) {
    console.warn(
      "[daily-backup] rclone copy failed (local backup is still OK).",
      r.stderr?.trim() || r.stdout?.trim() || `exit ${r.status}`,
    );
    return;
  }
  console.log("[daily-backup] rclone copy OK →", remoteSpec, "(files modified in last 24h)");
}

async function main() {
  const stamp = isoStamp();
  const runDir = path.join(backupsRoot, stamp);
  fs.mkdirSync(runDir, { recursive: true });

  const url = process.env.DATABASE_URL || "file:./dev.db";
  let ok = false;

  if (/^postgres(ql)?:\/\//i.test(url)) {
    const destSql = path.join(runDir, "database.sql");
    ok = backupPostgres(url, destSql);
  } else {
    const dbPath = resolveSqlitePath(url);
    if (!dbPath || !fs.existsSync(dbPath)) {
      console.error("[daily-backup] SQLite file not found for DATABASE_URL:", url);
      process.exit(1);
    }
    const ext = path.extname(dbPath) || ".db";
    ok = await backupSqlite(dbPath, path.join(runDir, `database${ext}`));
  }

  const storageSrc = path.join(root, "storage");
  const storageDest = path.join(runDir, "storage");
  if (copyDir(storageSrc, storageDest)) {
    console.log("[daily-backup] storage/ mirrored to", path.relative(root, storageDest));
  }

  pruneOldRuns();

  if (!ok) process.exit(1);
  console.log("[daily-backup] done. Run folder:", path.relative(root, runDir));

  syncCloudWithRclone();
}

main().catch((err) => {
  console.error("[daily-backup]", err);
  process.exit(1);
});
