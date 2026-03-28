import { prisma } from "./prisma";

export async function nextInvoiceNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const rows = await prisma.invoice.findMany({
    where: { userId, invoiceNumber: { startsWith: prefix } },
    select: { invoiceNumber: true },
  });
  let max = 0;
  for (const row of rows) {
    const suffix = row.invoiceNumber.slice(prefix.length);
    const n = parseInt(suffix, 10);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}
