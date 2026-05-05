export type OrderLineLite = { name: string; qty: number; lineTotalCents: number };

export function summarizeOrderLineItems(
  productName: string,
  lineItemsJson: string | null,
): string {
  if (!lineItemsJson?.trim()) return productName;
  try {
    const lines = JSON.parse(lineItemsJson) as OrderLineLite[];
    if (!Array.isArray(lines) || lines.length === 0) return productName;
    return lines.map((l) => `${l.name} ×${l.qty}`).join(", ");
  } catch {
    return productName;
  }
}
