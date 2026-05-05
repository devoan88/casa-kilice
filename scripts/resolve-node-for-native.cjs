"use strict";

/**
 * Next.js 16 static page workers on Windows load native addons with NODE_MODULE_VERSION 127
 * (Node 22). better-sqlite3 must be compiled for that same ABI. A typical global install is
 * Node 24 (137) under Program Files — mismatched. Prefer any Node 22 on PATH / Cursor helpers.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function samePath(a, b) {
  return path.normalize(a).toLowerCase() === path.normalize(b).toLowerCase();
}

function moduleVersion(nodeExe) {
  const r = spawnSync(nodeExe, ["-p", "process.versions.modules"], {
    encoding: "utf8",
    shell: false,
  });
  if (r.status !== 0) return null;
  const n = Number(String(r.stdout).trim());
  return Number.isFinite(n) ? n : null;
}

function systemNodeExe() {
  if (process.platform !== "win32") return null;
  const base = process.env.ProgramFiles || "C:\\Program Files";
  const exe = path.join(base, "nodejs", "node.exe");
  return fs.existsSync(exe) ? exe : null;
}

function wantModules() {
  const n = Number(process.env.CASA_EXPECT_NODE_MODULES || "127");
  return Number.isFinite(n) && n > 0 ? n : 127;
}

/** @returns {string | null} */
function findNodeExeWithModules(target) {
  const seen = new Set();
  /** @type {string[]} */
  const candidates = [];

  const push = (p) => {
    if (!p) return;
    try {
      if (!fs.existsSync(p)) return;
    } catch {
      return;
    }
    const k = path.normalize(p).toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    candidates.push(p);
  };

  push(process.execPath);
  const sys = systemNodeExe();
  if (sys) push(sys);

  const local = process.env.LOCALAPPDATA;
  if (local) {
    push(path.join(local, "Programs", "cursor", "resources", "app", "resources", "helpers", "node.exe"));
  }

  if (process.env.PATH) {
    for (const dir of process.env.PATH.split(path.delimiter)) {
      const t = dir && String(dir).trim();
      if (t) push(path.join(t, "node.exe"));
    }
  }

  for (const exe of candidates) {
    const m = moduleVersion(exe);
    if (m === target) return exe;
  }
  return null;
}

function prependPathForNodeExe(nodeExe, env) {
  const e = { ...(env || process.env) };
  const dir = path.dirname(nodeExe);
  e.PATH = `${dir}${path.delimiter}${e.PATH || ""}`;
  return e;
}

/**
 * Node executable for Next + Prisma + better-sqlite3. On Windows, requires MODULE_VERSION match.
 */
function resolveNodeForNextAndNative() {
  if (process.platform !== "win32") {
    return process.execPath;
  }
  const want = wantModules();
  const cur = moduleVersion(process.execPath);
  if (cur === want) return process.execPath;
  return findNodeExeWithModules(want) || process.execPath;
}

module.exports = {
  samePath,
  moduleVersion,
  wantModules,
  findNodeExeWithModules,
  resolveNodeForNextAndNative,
  prependPathForNodeExe,
};
