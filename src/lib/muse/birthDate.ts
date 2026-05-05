/** Minimum age for Muse registration (marketing consent / UGC). */
export const MUSE_MIN_AGE = 16;

export function parseBirthDateInput(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  const d = new Date(y, mo - 1, da);
  if (d.getFullYear() !== y || d.getMonth() !== mo - 1 || d.getDate() !== da) return null;
  return d;
}

export function validateMuseBirthDate(birth: Date): { ok: true } | { ok: false; error: string } {
  const now = new Date();
  if (birth.getTime() > now.getTime()) {
    return { ok: false, error: "Invalid date of birth." };
  }
  let age = now.getFullYear() - birth.getFullYear();
  const mm = now.getMonth() - birth.getMonth();
  if (mm < 0 || (mm === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  if (age < MUSE_MIN_AGE) {
    return { ok: false, error: `You must be at least ${MUSE_MIN_AGE} years old to join.` };
  }
  if (age > 120) {
    return { ok: false, error: "Please enter a valid date of birth." };
  }
  return { ok: true };
}
