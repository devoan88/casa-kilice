"use strict";

/**
 * Windows: if something is LISTENING on the given port and the process image
 * is `node.exe`, stop it so `next dev -p <port>` can bind (typical stale Next).
 * Does not kill non-Node listeners (e.g. Docker on 3000).
 */
const { execSync } = require("child_process");

const port = process.argv[2] || "3000";

if (process.platform !== "win32") {
  process.exit(0);
}

let netstat;
try {
  netstat = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
} catch {
  process.exit(0);
}

const pids = new Set();
for (const line of netstat.split(/\r?\n/)) {
  if (!line.includes("LISTENING")) continue;
  const parts = line.trim().split(/\s+/);
  const pid = parts[parts.length - 1];
  if (/^\d+$/.test(pid)) pids.add(pid);
}

for (const pid of pids) {
  let csv;
  try {
    csv = execSync(`tasklist /FI "PID eq ${pid}" /NH /FO CSV`, { encoding: "utf8" });
  } catch {
    continue;
  }
  const first = csv.split(/\r?\n/).find(Boolean);
  if (!first) continue;
  const name = first.split(",")[0]?.replace(/^"|"$/g, "") ?? "";
  if (name.toLowerCase() !== "node.exe") continue;
  try {
    // eslint-disable-next-line no-console -- CLI helper
    console.warn(`[casa-kilice] Stopping node.exe PID ${pid} (was listening on port ${port})`);
    execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
  } catch {
    // ignore — user may lack rights or process already exited
  }
}
