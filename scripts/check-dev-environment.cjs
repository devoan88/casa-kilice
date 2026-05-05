"use strict";

/**
 * Optional strict N-API check before dev/build.
 * Set ENFORCE_NAPI_VERSION to your machine's `process.versions.modules` (see `node -p "process.versions.modules"`)
 * in `.env.local` if the whole team shares one Node major line.
 * Otherwise we only log — native modules are validated by ensure-better-sqlite3.cjs.
 */
const modules = Number(process.versions.modules);
const enforced = process.env.ENFORCE_NAPI_VERSION;

console.log(`[env] Node ${process.version} · NODE_MODULE_VERSION=${modules}`);

if (enforced && String(enforced).trim() !== "") {
  const want = Number(enforced);
  if (!Number.isFinite(want) || want !== modules) {
    console.error(
      `[env] ENFORCE_NAPI_VERSION=${enforced} does not match current ${modules}. ` +
        `Switch Node or unset ENFORCE_NAPI_VERSION, then run: npm rebuild better-sqlite3`,
    );
    process.exit(1);
  }
}
