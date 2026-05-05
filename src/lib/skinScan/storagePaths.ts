import path from "node:path";

const SUBDIR = "skin-scans";

export function skinScanStorageRoot(): string {
  return path.join(process.cwd(), "storage", SUBDIR);
}

export function skinScanUserDir(userId: string): string {
  return path.join(skinScanStorageRoot(), userId);
}

/** DB value: join with `storage/` root when reading from disk. */
export function skinScanRelativePath(userId: string, fileName: string): string {
  return path.join(SUBDIR, userId, fileName).replace(/\\/g, "/");
}
