import path from "node:path";

const SUBDIR = "creator-ugc";

export function creatorUgcRootDir(): string {
  return path.join(process.cwd(), "storage", SUBDIR);
}

export function creatorUgcCreatorDir(creatorId: string): string {
  return path.join(creatorUgcRootDir(), creatorId);
}
