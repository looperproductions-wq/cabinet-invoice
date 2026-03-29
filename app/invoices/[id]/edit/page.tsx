import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/require-user";
import { InvoiceForm } from "@/components/InvoiceForm";
import { GuestGate } from "@/components/GuestGate";

type Props = { params: Promise<{ id: string }> };

export default async function EditInvoicePage({ params }: Props) {
  const user = await getOptionalUser();
  const { id } = await params;

  if (!user) {
    return (
      <div className="space-y-8">
        <div>
          <Link
            href={`/invoices/${id}`}
            className="text-sm font-medium text-stone-600 underline hover:text-stone-900"
          >
            ← Invoice
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
            Edit invoice
          </h1>
        </div>
        <GuestGate
          title="Sign in to edit invoices"
          description="Editing saves to your account. Sign in or register to continue."
          callbackPath={`/invoices/${id}/edit`}
        />
      </div>
    );
  }

  const [invoice, clients] = await Promise.all([
    prisma.invoice.findFirst({
      where: { id, userId: user.id },
      include: { lineItems: true },
    }),
    prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
  ]);

  if (!invoice) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/invoices/${invoice.id}`}
          className="text-sm font-medium text-stone-600 underline hover:text-stone-900"
        >
          ← {invoice.invoiceNumber}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
          Edit invoice
        </h1>
        <p className="mt-1 text-stone-600">
          Update line items, dates, tax, or status.
        </p>
      </div>
      <InvoiceForm
        mode="edit"
        clients={clients}
        invoice={invoice}
        callbackPath={`/invoices/${invoice.id}/edit`}
      />
    </div>
  );
}
