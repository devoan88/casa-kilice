import path from "node:path";

export const MUSE_PENDING_SUBDIR = "muse-pending";

export function musePendingRootDir(): string {
  return path.join(process.cwd(), "storage", MUSE_PENDING_SUBDIR);
}

export function musePendingUserDir(userId: string): string {
  return path.join(musePendingRootDir(), userId);
}
