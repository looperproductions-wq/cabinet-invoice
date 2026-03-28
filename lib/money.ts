export function dollarsToCents(input: string): number {
  const cleaned = input.replace(/[^0-9.-]/g, "");
  const n = parseFloat(cleaned);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

export function centsToDollars(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function percentToBps(percent: string): number {
  const n = parseFloat(percent.replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(Math.round(n * 100), 999_900);
}

export function bpsToPercentLabel(bps: number): string {
  return (bps / 100).toFixed(2);
}
