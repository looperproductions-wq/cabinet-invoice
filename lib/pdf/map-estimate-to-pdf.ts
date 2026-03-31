import type { Client, Estimate, EstimateLineItem } from "@prisma/client";
import { APP_NAME } from "@/lib/branding";
import { centsToDollars, bpsToPercentLabel } from "@/lib/money";
import { invoiceTotalCents, lineSubtotalCents } from "@/lib/invoice-calcs";
import type { EstimatePdfData } from "./estimate-pdf";

export type EstimateForPdf = Estimate & {
  client: Client;
  lineItems: EstimateLineItem[];
};

export type CompanyForPdf = {
  name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

export function estimateToPdfData(
  estimate: EstimateForPdf,
  company: CompanyForPdf | null
): EstimatePdfData {
  const { subtotalCents, taxCents, totalCents } = invoiceTotalCents(
    estimate.lineItems,
    estimate.taxRateBps
  );

  const lines = estimate.lineItems.map((line) => ({
    description: line.description,
    qty: String(line.quantity),
    unit: centsToDollars(line.unitAmountCents),
    amount: centsToDollars(lineSubtotalCents(line)),
  }));

  return {
    estimateNumber: estimate.estimateNumber,
    issueDateLabel: estimate.issueDate.toLocaleDateString("en-US"),
    validUntilLabel: estimate.validUntil
      ? estimate.validUntil.toLocaleDateString("en-US")
      : null,
    status: estimate.status.toLowerCase(),
    fromName: company?.name ?? APP_NAME,
    fromAddress: company?.address ?? null,
    fromEmail: company?.email ?? null,
    fromPhone: company?.phone ?? null,
    fromNotes: company?.notes ?? null,
    clientName: estimate.client.name,
    clientCompany: estimate.client.company,
    clientAddress: estimate.client.address,
    clientEmail: estimate.client.email,
    clientPhone: estimate.client.phone,
    lines,
    subtotal: centsToDollars(subtotalCents),
    taxLabel: `Tax (${bpsToPercentLabel(estimate.taxRateBps)}%)`,
    tax: centsToDollars(taxCents),
    total: centsToDollars(totalCents),
    notes: estimate.notes,
  };
}
