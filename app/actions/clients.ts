"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActionUser } from "@/lib/require-user";

export async function createClient(formData: FormData) {
  const user = await getActionUser();
  if (!user) return { error: "You must be signed in." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  await prisma.client.create({
    data: {
      name,
      email: emptyToNull(formData.get("email")),
      phone: emptyToNull(formData.get("phone")),
      company: emptyToNull(formData.get("company")),
      address: emptyToNull(formData.get("address")),
      notes: emptyToNull(formData.get("notes")),
      userId: user.id,
    },
  });
  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClient(clientId: string, formData: FormData) {
  const user = await getActionUser();
  if (!user) return { error: "You must be signed in." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const updated = await prisma.client.updateMany({
    where: { id: clientId, userId: user.id },
    data: {
      name,
      email: emptyToNull(formData.get("email")),
      phone: emptyToNull(formData.get("phone")),
      company: emptyToNull(formData.get("company")),
      address: emptyToNull(formData.get("address")),
      notes: emptyToNull(formData.get("notes")),
    },
  });
  if (updated.count === 0) return { error: "Client not found." };

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/invoices");
  revalidatePath("/estimates");
  redirect("/clients");
}

export async function deleteClient(clientId: string) {
  const user = await getActionUser();
  if (!user) return { error: "You must be signed in." };

  const [invoiceCount, estimateCount] = await Promise.all([
    prisma.invoice.count({
      where: { clientId, userId: user.id },
    }),
    prisma.estimate.count({
      where: { clientId, userId: user.id },
    }),
  ]);
  if (invoiceCount > 0 || estimateCount > 0) {
    return {
      error:
        "Remove or reassign invoices and estimates before deleting this client.",
    };
  }
  const del = await prisma.client.deleteMany({
    where: { id: clientId, userId: user.id },
  });
  if (del.count === 0) return { error: "Client not found." };

  revalidatePath("/clients");
  redirect("/clients");
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}
