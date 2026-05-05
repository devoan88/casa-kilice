"use strict";

/**
 * Runs before `next dev` / `next build` (see package.json predev / prebuild).
 * If better-sqlite3 was built for another Node ABI, rebuild automatically — no manual terminal copy/paste.
 * Rebuild must use the same `node` as this script (`process.execPath`); plain `npm rebuild` on Windows
 * often picks `Program Files\\nodejs` and recompiles for the wrong NODE_MODULE_VERSION.
 */
const fs = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");

const { prependPathForNodeExe } = require("./resolve-node-for-native.cjs");

const root = path.join(__dirname, "..");
process.chdir(root);

function needsRebuild(msg) {
  return (
    msg.includes("NODE_MODULE_VERSION") ||
    msg.includes("compiled against a different Node.js") ||
    msg.includes("was compiled against a different Node.js")
  );
}

function resolveNpmCliJs() {
  const local = path.join(root, "node_modules", "npm", "bin", "npm-cli.js");
  if (fs.existsSync(local)) return local;
  if (process.platform === "win32") {
    const pf = process.env.ProgramFiles || "C:\\Program Files";
    const globalNpm = path.join(pf, "nodejs", "node_modules", "npm", "bin", "npm-cli.js");
    if (fs.existsSync(globalNpm)) return globalNpm;
  }
  return null;
}

function rebuild() {
  // eslint-disable-next-line no-console -- CLI helper
  console.warn("[casa-kilice] better-sqlite3: ABI mismatch or load error — rebuilding for this Node.js…");
  const env = prependPathForNodeExe(process.execPath, process.env);
  const npmCli = resolveNpmCliJs();
  if (!npmCli) {
    // eslint-disable-next-line no-console -- CLI helper
    console.error(
      "[casa-kilice] better-sqlite3: could not find npm-cli.js (local or under Program Files\\nodejs). Install Node.js / npm or run: npm rebuild better-sqlite3",
    );
    process.exit(1);
  }
  const r = spawnSync(process.execPath, [npmCli, "rebuild", "better-sqlite3"], {
    stdio: "inherit",
    cwd: root,
    env,
    shell: false,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  // eslint-disable-next-line no-console -- CLI helper
  console.warn("[casa-kilice] better-sqlite3: rebuild finished.");
}

function verifyLoad() {
  const r = spawnSync(
    process.execPath,
    [
      "-e",
      'const Database=require("better-sqlite3"); new Database(":memory:"); console.log("ok");',
    ],
    {
      encoding: "utf8",
      cwd: root,
      env: prependPathForNodeExe(process.execPath, process.env),
      shell: false,
    },
  );
  return r.status === 0;
}

function assertNativeLoads() {
  try {
    const Database = require("better-sqlite3");
    new Database(":memory:").close();
  } catch (err) {
    const msg = err && err.message ? String(err.message) : String(err);
    if (needsRebuild(msg)) {
      rebuild();
      if (!verifyLoad()) {
        // eslint-disable-next-line no-console -- CLI helper
        console.error(
          "[casa-kilice] better-sqlite3: rebuild ran but this Node still cannot load the native module. Ensure npm/node-gyp use the same Node as this script (PATH / CASA_EXPECT_NODE_MODULES).",
        );
        process.exit(1);
      }
      process.exit(0);
    }
    // eslint-disable-next-line no-console -- CLI helper
    console.error("[casa-kilice] better-sqlite3:", err);
    process.exit(1);
  }
}

assertNativeLoads();
