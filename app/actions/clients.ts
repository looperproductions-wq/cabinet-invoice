"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createClient(formData: FormData) {
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
    },
  });
  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClient(clientId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  await prisma.client.update({
    where: { id: clientId },
    data: {
      name,
      email: emptyToNull(formData.get("email")),
      phone: emptyToNull(formData.get("phone")),
      company: emptyToNull(formData.get("company")),
      address: emptyToNull(formData.get("address")),
      notes: emptyToNull(formData.get("notes")),
    },
  });
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/invoices");
  redirect("/clients");
}

export async function deleteClient(clientId: string) {
  const count = await prisma.invoice.count({ where: { clientId } });
  if (count > 0) {
    return { error: "Remove or reassign invoices before deleting this client." };
  }
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/clients");
  redirect("/clients");
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}
