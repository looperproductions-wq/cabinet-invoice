import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    redirect("/login");
  }
  return {
    id,
    email: session!.user!.email,
    name: session!.user!.name,
  };
}

/** Server actions: returns null if not signed in (no redirect). */
export async function getActionUser() {
  const session = await auth();
  const id = session?.user?.id;
  return id ? { id } : null;
}
