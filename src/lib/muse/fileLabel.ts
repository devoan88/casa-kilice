/** Human label for a stored relative path. */
export function labelFromFileUrl(fileUrl: string): string {
  const s = fileUrl.replace(/\\/g, "/");
  const i = s.lastIndexOf("/");
  return i >= 0 ? s.slice(i + 1) || s : s;
}
