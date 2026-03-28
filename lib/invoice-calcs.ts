export type LineLike = { quantity: number; unitAmountCents: number };

export function lineSubtotalCents(line: LineLike): number {
  return Math.round(line.quantity * line.unitAmountCents);
}

export function invoiceSubtotalCents(lines: LineLike[]): number {
  return lines.reduce((sum, line) => sum + lineSubtotalCents(line), 0);
}

export function taxFromSubtotalCents(
  subtotalCents: number,
  taxRateBps: number
): number {
  return Math.round((subtotalCents * taxRateBps) / 10_000);
}

export function invoiceTotalCents(
  lines: LineLike[],
  taxRateBps: number
): { subtotalCents: number; taxCents: number; totalCents: number } {
  const subtotalCents = invoiceSubtotalCents(lines);
  const taxCents = taxFromSubtotalCents(subtotalCents, taxRateBps);
  return {
    subtotalCents,
    taxCents,
    totalCents: subtotalCents + taxCents,
  };
}
