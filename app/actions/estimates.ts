"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dollarsToCents, percentToBps } from "@/lib/money";
import { nextEstimateNumber } from "@/lib/estimate-number";

export type EstimateLinePayload = {
  description: string;
  quantity: number;
  unitDollars: string;
};

export async function createEstimate(payload: {
  clientId: string;
  issueDate: string;
  validUntil: string;
  taxPercent: string;
  notes: string;
  lines: EstimateLinePayload[];
}) {
  const clientId = payload.clientId?.trim();
  if (!clientId) return { error: "Choose a client." };

  const lines = normalizeLines(payload.lines);
  if (!lines.length) return { error: "Add at least one line item." };

  const issueDate = parseDate(payload.issueDate) ?? new Date();
  const validUntil = parseOptionalDate(payload.validUntil);
  const taxRateBps = percentToBps(payload.taxPercent);
  const notes = payload.notes?.trim() || null;

  const estimateNumber = await nextEstimateNumber();

  await prisma.estimate.create({
    data: {
      estimateNumber,
      clientId,
      issueDate,
      validUntil,
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

  revalidatePath("/estimates");
  revalidatePath("/");
  redirect("/estimates");
}

export async function updateEstimate(
  estimateId: string,
  payload: {
    clientId: string;
    issueDate: string;
    validUntil: string;
    taxPercent: string;
    notes: string;
    status: string;
    lines: EstimateLinePayload[];
  }
) {
  const clientId = payload.clientId?.trim();
  if (!clientId) return { error: "Choose a client." };

  const lines = normalizeLines(payload.lines);
  if (!lines.length) return { error: "Add at least one line item." };

  const issueDate = parseDate(payload.issueDate) ?? new Date();
  const validUntil = parseOptionalDate(payload.validUntil);
  const taxRateBps = percentToBps(payload.taxPercent);
  const notes = payload.notes?.trim() || null;
  const status = normalizeEstimateStatus(payload.status);

  await prisma.$transaction([
    prisma.estimateLineItem.deleteMany({ where: { estimateId } }),
    prisma.estimate.update({
      where: { id: estimateId },
      data: {
        clientId,
        issueDate,
        validUntil,
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

  revalidatePath("/estimates");
  revalidatePath(`/estimates/${estimateId}`);
  revalidatePath("/");
  redirect(`/estimates/${estimateId}`);
}

export async function setEstimateStatus(estimateId: string, status: string) {
  const s = normalizeEstimateStatus(status);
  await prisma.estimate.update({
    where: { id: estimateId },
    data: { status: s },
  });
  revalidatePath("/estimates");
  revalidatePath(`/estimates/${estimateId}`);
  revalidatePath("/");
}

export async function deleteEstimate(estimateId: string) {
  await prisma.estimate.delete({ where: { id: estimateId } });
  revalidatePath("/estimates");
  revalidatePath("/");
  redirect("/estimates");
}

function normalizeLines(lines: EstimateLinePayload[]) {
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
  return parseDate(s);
}

function normalizeEstimateStatus(s: string): string {
  const u = (s ?? "").toUpperCase();
  if (u === "SENT" || u === "ACCEPTED" || u === "DECLINED") return u;
  return "DRAFT";
}
