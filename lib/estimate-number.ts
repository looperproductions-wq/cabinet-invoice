import { prisma } from "./prisma";

export async function nextEstimateNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EST-${year}-`;
  const rows = await prisma.estimate.findMany({
    where: { estimateNumber: { startsWith: prefix } },
    select: { estimateNumber: true },
  });
  let max = 0;
  for (const row of rows) {
    const suffix = row.estimateNumber.slice(prefix.length);
    const n = parseInt(suffix, 10);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}
