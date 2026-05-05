"use strict";

/**
 * Runs `next` with a Node build whose N-API version matches better-sqlite3 + Next static workers.
 * On Windows, avoids `Program Files\\nodejs` v24 when workers expect Node 22 (MODULE_VERSION 127).
 */
const path = require("path");
const { spawnSync } = require("child_process");

const {
  moduleVersion,
  wantModules,
  resolveNodeForNextAndNative,
  prependPathForNodeExe,
} = require("./resolve-node-for-native.cjs");

const root = path.join(__dirname, "..");
const extraArgs = process.argv.slice(2);

/** NextAuth cookies + callbacks must match the browser origin (e.g. :3010 vs :3000). */
function devPortFromArgs(args) {
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "-p" || args[i] === "--port") && args[i + 1]) {
      const n = Number.parseInt(String(args[i + 1]), 10);
      return Number.isFinite(n) && n > 0 ? n : 3000;
    }
  }
  return 3000;
}

function syncNextAuthUrlForLocalDev(env, args) {
  const cmd = args[0];
  if (cmd !== "dev") return;
  const port = devPortFromArgs(args);
  const strict = env.NEXTAUTH_URL_STRICT === "1";
  if (strict) return;

  const current = (env.NEXTAUTH_URL || "").trim();
  let loopbackHost = "localhost";
  if (current) {
    try {
      const h = new URL(current).hostname.toLowerCase();
      if (h === "127.0.0.1") loopbackHost = "127.0.0.1";
    } catch {
      /* keep localhost */
    }
  }
  const proposed = `http://${loopbackHost}:${port}`;

  if (!current) {
    env.NEXTAUTH_URL = proposed;
    // eslint-disable-next-line no-console -- dev ergonomics
    console.warn(`[casa-kilice] NEXTAUTH_URL was unset → ${proposed} (NextAuth + port ${port}). Open the same host in the browser.`);
    return;
  }

  try {
    const u = new URL(current);
    const host = u.hostname.toLowerCase();
    if (host !== "localhost" && host !== "127.0.0.1") return;
    const urlPort = u.port ? Number.parseInt(u.port, 10) : u.protocol === "https:" ? 443 : 80;
    if (urlPort === port) return;
    env.NEXTAUTH_URL = proposed;
    // eslint-disable-next-line no-console -- dev ergonomics
    console.warn(
      `[casa-kilice] NEXTAUTH_URL was ${current} but dev listens on port ${port} → ${proposed} (sign-in/admin cookies). Set NEXTAUTH_URL_STRICT=1 to keep your .env value.`,
    );
  } catch {
    /* leave NEXTAUTH_URL */
  }
}

let nextBin;
try {
  nextBin = require.resolve("next/dist/bin/next");
} catch {
  // eslint-disable-next-line no-console -- CLI helper
  console.error("[casa-kilice] Could not resolve next. Run npm install from casa-kilice.");
  process.exit(1);
}

let nodeExe = process.execPath;
let env = { ...process.env };
syncNextAuthUrlForLocalDev(env, extraArgs);

if (process.platform === "win32") {
  nodeExe = resolveNodeForNextAndNative();
  env = prependPathForNodeExe(nodeExe, env);
  const mv = moduleVersion(nodeExe);
  const want = wantModules();
  if (mv !== want) {
    // eslint-disable-next-line no-console -- CLI helper
    console.error(
      `[casa-kilice] Cannot run Next: ${nodeExe} has MODULE_VERSION ${mv}; need ${want} (Node 22) for better-sqlite3 with this Next.js build. Install Node 22 or adjust PATH / CASA_EXPECT_NODE_MODULES.`,
    );
    process.exit(1);
  }
}

const r = spawnSync(nodeExe, [nextBin, ...extraArgs], {
  stdio: "inherit",
  cwd: root,
  env,
  shell: false,
});

process.exit(r.status ?? 1);
