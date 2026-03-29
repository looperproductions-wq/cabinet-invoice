"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dollarsToCents, percentToBps } from "@/lib/money";
import { nextEstimateNumber } from "@/lib/estimate-number";
import { getActionUser, SAVE_REQUIRES_ACCOUNT } from "@/lib/require-user";

export type EstimateLinePayload = {
  description: string;
  quantity: number;
  unitDollars: string;
};

export async function createEstimate(payload: {
  clientId: string;
  newClientName: string;
  newClientCompany: string;
  newClientEmail: string;
  newClientPhone: string;
  issueDate: string;
  validUntil: string;
  taxPercent: string;
  notes: string;
  lines: EstimateLinePayload[];
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
  const validUntil = parseOptionalDate(payload.validUntil);
  const taxRateBps = percentToBps(payload.taxPercent);
  const notes = payload.notes?.trim() || null;

  const estimateNumber = await nextEstimateNumber(user.id);

  await prisma.estimate.create({
    data: {
      estimateNumber,
      userId: user.id,
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
    newClientName: string;
    newClientCompany: string;
    newClientEmail: string;
    newClientPhone: string;
    issueDate: string;
    validUntil: string;
    taxPercent: string;
    notes: string;
    status: string;
    lines: EstimateLinePayload[];
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

  const existing = await prisma.estimate.findFirst({
    where: { id: estimateId, userId: user.id },
  });
  if (!existing) return { error: "Estimate not found." };

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
  const user = await getActionUser();
  if (!user) return;

  const s = normalizeEstimateStatus(status);
  await prisma.estimate.updateMany({
    where: { id: estimateId, userId: user.id },
    data: { status: s },
  });
  revalidatePath("/estimates");
  revalidatePath(`/estimates/${estimateId}`);
  revalidatePath("/");
}

export async function deleteEstimate(estimateId: string) {
  const user = await getActionUser();
  if (!user) return;

  await prisma.estimate.deleteMany({
    where: { id: estimateId, userId: user.id },
  });
  revalidatePath("/estimates");
  revalidatePath("/");
  redirect("/estimates");
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
      error: "Select a client or enter a new client name under “Prepared for.”",
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
