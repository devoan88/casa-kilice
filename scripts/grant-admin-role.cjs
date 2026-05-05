/**
 * Grant or inspect admin role (SQLite dev.db by default).
 *
 * Usage:
 *   node scripts/grant-admin-role.cjs list
 *   node scripts/grant-admin-role.cjs grant you@example.com
 *
 * Requires migration that adds User.role (default USER).
 */
const path = require("path");
const Database = require("better-sqlite3");

function resolveDbPath() {
  const raw = process.env.DATABASE_URL || "file:./dev.db";
  const file = raw.replace(/^file:/, "").trim();
  return path.resolve(__dirname, "..", file);
}

function main() {
  const [, , cmd, emailArg] = process.argv;
  const dbPath = resolveDbPath();
  const db = new Database(dbPath, { readonly: false });

  try {
    const cols = db.prepare("PRAGMA table_info(User)").all();
    const hasRole = cols.some((c) => c.name === "role");
    if (!hasRole) {
      console.error("User.role column missing. Run: npx prisma migrate dev");
      process.exit(1);
    }

    if (cmd === "list") {
      const rows = db
        .prepare(
          `SELECT email, name, role, isMuse FROM User
           WHERE email IS NOT NULL
           ORDER BY createdAt DESC
           LIMIT 40`,
        )
        .all();
      console.log("Recent users (email, name, role, isMuse):\n");
      for (const r of rows) {
        console.log(`${r.email}\t${r.name ?? "—"}\t${r.role}\t${r.isMuse ? "muse" : ""}`);
      }
      return;
    }

    if (cmd === "grant") {
      const email = emailArg?.trim();
      if (!email) {
        console.error("Usage: node scripts/grant-admin-role.cjs grant <email>");
        process.exit(1);
      }
      const info = db.prepare(`UPDATE User SET role = 'ADMIN' WHERE lower(email) = lower(?)`).run(email);
      if (info.changes === 0) {
        console.error(`No user found with email: ${email}`);
        process.exit(1);
      }
      console.log(`OK — role set to ADMIN for ${email}`);
      return;
    }

    console.error("Usage:\n  node scripts/grant-admin-role.cjs list\n  node scripts/grant-admin-role.cjs grant <email>");
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
