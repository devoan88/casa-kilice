"use strict";

/**
 * Windows: Next.js static workers use NODE_MODULE_VERSION 127 (Node 22); better-sqlite3 must match.
 * npm often runs scripts with `C:\\Program Files\\nodejs\\node.exe` (e.g. v24 / 137) while Cursor
 * ships Node 22 on PATH — pick the correct binary before check + ensure-better-sqlite3.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const {
  samePath,
  moduleVersion,
  wantModules,
  resolveNodeForNextAndNative,
  prependPathForNodeExe,
} = require("./resolve-node-for-native.cjs");

const root = path.join(__dirname, "..");

if (process.platform === "win32") {
  const want = wantModules();
  const resolved = resolveNodeForNextAndNative();
  if (!samePath(process.execPath, resolved)) {
    // eslint-disable-next-line no-console -- CLI helper
    console.warn(`[casa-kilice] Re-exec predev chain with Node for native ABI: ${resolved}`);
    const forward = [__filename, ...process.argv.slice(2)];
    const r = spawnSync(resolved, forward, {
      stdio: "inherit",
      cwd: root,
      env: prependPathForNodeExe(resolved, process.env),
    });
    process.exit(r.status ?? 1);
  }
  const mv = moduleVersion(process.execPath);
  if (mv !== want) {
    // eslint-disable-next-line no-console -- CLI helper
    console.error(
      `[casa-kilice] This Node (${process.execPath}) has MODULE_VERSION ${mv}; Next static workers need ${want} (Node 22). Install Node 22 LTS or add it to PATH ahead of Node 24. Override with CASA_EXPECT_NODE_MODULES only if you know your Next build matches another ABI.`,
    );
    process.exit(1);
  }
}

const run = (name) => {
  const r = spawnSync(process.execPath, [path.join(__dirname, name)], {
    stdio: "inherit",
    cwd: root,
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run("check-dev-environment.cjs");
run("ensure-better-sqlite3.cjs");
