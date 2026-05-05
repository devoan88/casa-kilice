const CK_RE = /^#?CK-(\d+)$/i;
const DIGITS_ONLY = /^(\d+)$/;

/** Parse numeric sequence from stored `CK-1001`, `#CK-1001`, or legacy `1001`. */
export function parsePublicOrderSequence(orderNumber: string | null | undefined): number | null {
  if (orderNumber == null) return null;
  const s = String(orderNumber).trim();
  if (!s) return null;
  let m = CK_RE.exec(s);
  if (m) return parseInt(m[1], 10);
  m = DIGITS_ONLY.exec(s);
  if (m) return parseInt(m[1], 10);
  return null;
}

/** Display label for customer-facing order numbers (e.g. #CK-1001). */
export function formatPublicOrderNumber(orderNumber: string | number | null | undefined): string | null {
  const seq =
    typeof orderNumber === "number" && Number.isFinite(orderNumber)
      ? orderNumber
      : parsePublicOrderSequence(typeof orderNumber === "number" ? String(orderNumber) : orderNumber);
  if (seq == null) return null;
  return `#CK-${seq}`;
}
