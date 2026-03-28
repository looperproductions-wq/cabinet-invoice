"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dollarsToCents, percentToBps } from "@/lib/money";
import { nextInvoiceNumber } from "@/lib/invoice-number";

export type LinePayload = {
  description: string;
  quantity: number;
  unitDollars: string;
};

export async function createInvoice(payload: {
  clientId: string;
  issueDate: string;
  dueDate: string;
  taxPercent: string;
  notes: string;
  lines: LinePayload[];
}) {
  const clientId = payload.clientId?.trim();
  if (!clientId) return { error: "Choose a client." };

  const lines = normalizeLines(payload.lines);
  if (!lines.length) return { error: "Add at least one line item." };

  const issueDate = parseDate(payload.issueDate) ?? new Date();
  const dueDate = parseOptionalDate(payload.dueDate);
  const taxRateBps = percentToBps(payload.taxPercent);
  const notes = payload.notes?.trim() || null;

  const invoiceNumber = await nextInvoiceNumber();

  await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId,
      issueDate,
      dueDate,
      taxRateBps,
      notes,
      status: "DRAFT",
      lineItems: {
        create: lines.map((line, i) => ({
          description: line.description,
          quantity: line.quantity,
          unitAmountCents: line.unitAmountCents,
          sortOrder: i,
        })),
      },
    },
  });

  revalidatePath("/invoices");
  revalidatePath("/");
  redirect("/invoices");
}

export async function updateInvoice(
  invoiceId: string,
  payload: {
    clientId: string;
    issueDate: string;
    dueDate: string;
    taxPercent: string;
    notes: string;
    status: string;
    lines: LinePayload[];
  }
) {
  const clientId = payload.clientId?.trim();
  if (!clientId) return { error: "Choose a client." };

  const lines = normalizeLines(payload.lines);
  if (!lines.length) return { error: "Add at least one line item." };

  const issueDate = parseDate(payload.issueDate) ?? new Date();
  const dueDate = parseOptionalDate(payload.dueDate);
  const taxRateBps = percentToBps(payload.taxPercent);
  const notes = payload.notes?.trim() || null;
  const status = normalizeStatus(payload.status);

  await prisma.$transaction([
    prisma.invoiceLineItem.deleteMany({ where: { invoiceId } }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        clientId,
        issueDate,
        dueDate,
        taxRateBps,
        notes,
        status,
        lineItems: {
          create: lines.map((line, i) => ({
            description: line.description,
            quantity: line.quantity,
            unitAmountCents: line.unitAmountCents,
            sortOrder: i,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/");
  redirect(`/invoices/${invoiceId}`);
}

export async function setInvoiceStatus(invoiceId: string, status: string) {
  const s = normalizeStatus(status);
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: s },
  });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/");
}

export async function deleteInvoice(invoiceId: string) {
  await prisma.invoice.delete({ where: { id: invoiceId } });
  revalidatePath("/invoices");
  revalidatePath("/");
  redirect("/invoices");
}

function normalizeLines(lines: LinePayload[]) {
  const out: { description: string; quantity: number; unitAmountCents: number }[] =
    [];
  for (const row of lines) {
    const description = row.description?.trim() ?? "";
    if (!description) continue;
    const qty = Number(row.quantity);
    const quantity = Number.isFinite(qty) && qty > 0 ? qty : 1;
    const unitAmountCents = dollarsToCents(String(row.unitDollars ?? "0"));
    if (unitAmountCents <= 0) continue;
    out.push({ description, quantity, unitAmountCents });
  }
  return out;
}

function parseDate(s: string | undefined): Date | null {
  if (!s?.trim()) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseOptionalDate(s: string | undefined): Date | null {
  const d = parseDate(s);
  return d;
}

function normalizeStatus(s: string): string {
  const u = (s ?? "").toUpperCase();
  if (u === "SENT" || u === "PAID") return u;
  return "DRAFT";
}
