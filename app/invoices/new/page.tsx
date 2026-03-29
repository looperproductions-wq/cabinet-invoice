import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/require-user";
import { InvoiceForm } from "@/components/InvoiceForm";

export default async function NewInvoicePage() {
  const user = await getOptionalUser();
  const clients = user
    ? await prisma.client.findMany({
        where: { userId: user.id },
        orderBy: { name: "asc" },
        select: { id: true, name: true, company: true },
      })
    : [];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/invoices"
          className="text-sm font-medium text-stone-600 underline hover:text-stone-900"
        >
          ← Invoices
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
          New invoice
        </h1>
        <p className="mt-1 text-stone-600">
          Add line items, tax, and notes. Invoice numbers are assigned when you
          save (after sign-in). Guests can draft here first.
        </p>
      </div>
      <InvoiceForm
        mode="create"
        clients={clients}
        callbackPath="/invoices/new"
      />
    </div>
  );
}
