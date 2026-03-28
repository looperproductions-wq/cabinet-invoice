import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { InvoiceForm } from "@/components/InvoiceForm";

export default async function NewInvoicePage() {
  const user = await requireUser();
  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true },
  });

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
          Add line items, tax, and notes. Invoice numbers are assigned automatically.
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="font-medium">Add a client first</p>
          <p className="mt-1 text-sm text-amber-900/90">
            You need at least one client before creating an invoice.
          </p>
          <Link
            href="/clients/new"
            className="mt-3 inline-block text-sm font-semibold underline"
          >
            Create a client
          </Link>
        </div>
      ) : (
        <InvoiceForm mode="create" clients={clients} />
      )}
    </div>
  );
}
