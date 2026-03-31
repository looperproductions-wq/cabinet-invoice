import type { Client, Invoice, InvoiceLineItem } from "@prisma/client";
import { APP_NAME, APP_TAGLINE } from "@/lib/branding";
import { centsToDollars, bpsToPercentLabel } from "@/lib/money";
import { invoiceTotalCents, lineSubtotalCents } from "@/lib/invoice-calcs";
import type { InvoicePdfData } from "./invoice-pdf";

export type InvoiceForPdf = Invoice & {
  client: Client;
  lineItems: InvoiceLineItem[];
};

export function invoiceToPdfData(invoice: InvoiceForPdf): InvoicePdfData {
  const { subtotalCents, taxCents, totalCents } = invoiceTotalCents(
    invoice.lineItems,
    invoice.taxRateBps
  );

  const lines = invoice.lineItems.map((line) => ({
    description: line.description,
    qty: String(line.quantity),
    unit: centsToDollars(line.unitAmountCents),
    amount: centsToDollars(lineSubtotalCents(line)),
  }));

  return {
    invoiceNumber: invoice.invoiceNumber,
    issueDateLabel: invoice.issueDate.toLocaleDateString("en-US"),
    dueDateLabel: invoice.dueDate
      ? invoice.dueDate.toLocaleDateString("en-US")
      : null,
    status: invoice.status.toLowerCase(),
    fromName: APP_NAME,
    fromTagline: APP_TAGLINE,
    clientName: invoice.client.name,
    clientCompany: invoice.client.company,
    clientAddress: invoice.client.address,
    clientEmail: invoice.client.email,
    clientPhone: invoice.client.phone,
    lines,
    subtotal: centsToDollars(subtotalCents),
    taxLabel: `Tax (${bpsToPercentLabel(invoice.taxRateBps)}%)`,
    tax: centsToDollars(taxCents),
    total: centsToDollars(totalCents),
    notes: invoice.notes,
  };
}
