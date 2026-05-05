# Casa Kilicé — stability & safety

## Before risky changes (RSS, native modules, Prisma migrations)

1. **Commit** on a clean branch so you can revert (`git status` should be clean or intentional).
2. **Backup SQLite** (local): `npm run db:backup`
3. **Same Node** as `package.json` `engines`: run `node -p "process.versions.modules"` after any Node upgrade, then `npm rebuild better-sqlite3`.

## Commands

| Script | Purpose |
|--------|---------|
| `npm run db:backup` | Copy `dev.db` (from `DATABASE_URL`) into `backups/dev-<timestamp>.db` |
| `npm run check:env` | Print Node + N-API; fails only if `ENFORCE_NAPI_VERSION` is set and mismatched |
| `npm run rebuild:native` | Rebuild `better-sqlite3` for current Node |
| `npm ci` | CI / clean machine: install **exactly** from `package-lock.json` |

## Lockfile

This repo uses **`package-lock.json`** (not npm shrinkwrap). Do not delete it. Prefer `npm ci` on servers.

## Error handling

- **`app/error.tsx`** — Next.js route error UI with reset.
- **`MainSegmentErrorBoundary`** — wraps main content in the root layout to isolate **client** render crashes in page trees.

## Optional strict N-API

If everyone uses the same Node line, add to `.env.local`:

```bash
ENFORCE_NAPI_VERSION=137
```

(Use your machine’s value from `node -p "process.versions.modules"`.) Wrong value → dev/build stops with a clear message instead of a vague Prisma crash.
