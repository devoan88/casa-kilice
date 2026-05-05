const PHOTO = /^image\/(jpeg|jpg|png|webp|gif)$/i;
const VIDEO = /^video\/(mp4|quicktime|webm|mpeg)$/i;

export function museMediaType(mime: string): "photo" | "video" | null {
  if (PHOTO.test(mime)) return "photo";
  if (VIDEO.test(mime)) return "video";
  return null;
}

/** Values persisted on `ContentSubmission.type`. */
export function museSubmissionDbType(mime: string): "Photo" | "Video" | null {
  const t = museMediaType(mime);
  if (t === "photo") return "Photo";
  if (t === "video") return "Video";
  return null;
}

export const MUSE_UPLOAD_MAX_BYTES = 45 * 1024 * 1024;
