"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActionUser, SAVE_REQUIRES_ACCOUNT } from "@/lib/require-user";

export async function saveCompany(formData: FormData) {
  const user = await getActionUser();
  if (!user) return { error: SAVE_REQUIRES_ACCOUNT };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Company name is required." };

  const address = emptyToNull(formData.get("address"));
  const email = emptyToNull(formData.get("email"));
  const phone = emptyToNull(formData.get("phone"));
  const notes = emptyToNull(formData.get("notes"));

  try {
    await prisma.company.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        name,
        address,
        email,
        phone,
        notes,
      },
      update: {
        name,
        address,
        email,
        phone,
        notes,
      },
    });
  } catch (e) {
    return { error: "Could not save company details." };
  }

  revalidatePath("/company");
  redirect("/company");
}

function emptyToNull(v: FormDataEntryValue | null) {
  const s = (v ? String(v) : "").trim();
  return s.length ? s : null;
}

