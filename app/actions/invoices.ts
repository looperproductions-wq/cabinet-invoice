"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dollarsToCents, percentToBps } from "@/lib/money";
import { nextInvoiceNumber } from "@/lib/invoice-number";
import { getActionUser, SAVE_REQUIRES_ACCOUNT } from "@/lib/require-user";

export type LinePayload = {
  description: string;
  quantity: number;
  unitDollars: string;
};

export async function createInvoice(payload: {
  clientId: string;
  newClientName: string;
  newClientCompany: string;
  newClientEmail: string;
  newClientPhone: string;
  issueDate: string;
  dueDate: string;
  taxPercent: string;
  notes: string;
  lines: LinePayload[];
}) {
  const user = await getActionUser();
  if (!user) return { error: SAVE_REQUIRES_ACCOUNT };

  const resolved = await resolveClientForUser(user.id, {
    clientId: payload.clientId,
    newClientName: payload.newClientName,
    newClientCompany: payload.newClientCompany,
    newClientEmail: payload.newClientEmail,
    newClientPhone: payload.newClientPhone,
  });
  if ("error" in resolved) return { error: resolved.error };
  const clientId = resolved.clientId;

  const lines = normalizeLines(payload.lines);
  if (!lines.length) return { error: "Add at least one line item." };

  const issueDate = parseDate(payload.issueDate) ?? new Date();
  const dueDate = parseOptionalDate(payload.dueDate);
  const taxRateBps = percentToBps(payload.taxPercent);
  const notes = payload.notes?.trim() || null;

  const invoiceNumber = await nextInvoiceNumber(user.id);

  await prisma.invoice.create({
    data: {
      invoiceNumber,
      userId: user.id,
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
    newClientName: string;
    newClientCompany: string;
    newClientEmail: string;
    newClientPhone: string;
    issueDate: string;
    dueDate: string;
    taxPercent: string;
    notes: string;
    status: string;
    lines: LinePayload[];
  }
) {
  const user = await getActionUser();
  if (!user) return { error: SAVE_REQUIRES_ACCOUNT };

  const resolved = await resolveClientForUser(user.id, {
    clientId: payload.clientId,
    newClientName: payload.newClientName,
    newClientCompany: payload.newClientCompany,
    newClientEmail: payload.newClientEmail,
    newClientPhone: payload.newClientPhone,
  });
  if ("error" in resolved) return { error: resolved.error };
  const clientId = resolved.clientId;

  const existing = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId: user.id },
  });
  if (!existing) return { error: "Invoice not found." };

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
  const user = await getActionUser();
  if (!user) return;

  const s = normalizeStatus(status);
  await prisma.invoice.updateMany({
    where: { id: invoiceId, userId: user.id },
    data: { status: s },
  });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/");
}

export async function deleteInvoice(invoiceId: string) {
  const user = await getActionUser();
  if (!user) return;

  await prisma.invoice.deleteMany({
    where: { id: invoiceId, userId: user.id },
  });
  revalidatePath("/invoices");
  revalidatePath("/");
  redirect("/invoices");
}

async function resolveClientForUser(
  userId: string,
  payload: {
    clientId: string;
    newClientName: string;
    newClientCompany: string;
    newClientEmail: string;
    newClientPhone: string;
  }
): Promise<{ clientId: string } | { error: string }> {
  const cid = payload.clientId?.trim();
  if (cid) {
    const client = await prisma.client.findFirst({
      where: { id: cid, userId },
    });
    if (!client) return { error: "Invalid client." };
    return { clientId: cid };
  }
  const name = payload.newClientName?.trim() ?? "";
  if (!name) {
    return {
      error: "Select a client or enter a new client name under “Bill to.”",
    };
  }
  const client = await prisma.client.create({
    data: {
      userId,
      name,
      company: emptyToNull(payload.newClientCompany),
      email: emptyToNull(payload.newClientEmail),
      phone: emptyToNull(payload.newClientPhone),
    },
  });
  return { clientId: client.id };
}

function emptyToNull(s: string | undefined) {
  const t = s?.trim() ?? "";
  return t.length ? t : null;
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
