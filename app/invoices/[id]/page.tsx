import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/require-user";
import { centsToDollars, bpsToPercentLabel } from "@/lib/money";
import {
  invoiceTotalCents,
  lineSubtotalCents,
} from "@/lib/invoice-calcs";
import { InvoiceStatusActions } from "@/components/InvoiceStatusActions";
import { DeleteInvoiceButton } from "@/components/DeleteInvoiceButton";

type Props = { params: Promise<{ id: string }> };

export default async function InvoiceDetailPage({ params }: Props) {
  const user = await getOptionalUser();
  if (!user) {
    notFound();
  }
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: {
      client: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!invoice) notFound();

  const { subtotalCents, taxCents, totalCents } = invoiceTotalCents(
    invoice.lineItems,
    invoice.taxRateBps
  );

  return (
    <div className="space-y-8">
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/invoices"
            className="text-sm font-medium text-stone-600 underline hover:text-stone-900"
          >
            ← Invoices
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
            {invoice.invoiceNumber}
          </h1>
          <p className="mt-1 text-stone-600">
            {invoice.client.name}
            {invoice.client.company ? ` · ${invoice.client.company}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Edit
          </Link>
          <DeleteInvoiceButton invoiceId={invoice.id} />
        </div>
      </div>

      <div className="no-print rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-medium text-stone-700">Status</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${
              invoice.status === "PAID"
                ? "bg-emerald-100 text-emerald-900"
                : invoice.status === "SENT"
                  ? "bg-amber-100 text-amber-900"
                  : "bg-stone-200 text-stone-800"
            }`}
          >
            {invoice.status.toLowerCase()}
          </span>
          <InvoiceStatusActions
            invoiceId={invoice.id}
            current={invoice.status}
          />
        </div>
      </div>

      <article className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        <header className="flex flex-col gap-6 border-b border-stone-200 pb-8 sm:flex-row sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Invoice
            </p>
            <p className="mt-1 text-xl font-semibold text-stone-900">
              {invoice.invoiceNumber}
            </p>
          </div>
          <div className="text-sm text-stone-600">
            <p>
              <span className="text-stone-500">Issued:</span>{" "}
              {invoice.issueDate.toLocaleDateString()}
            </p>
            {invoice.dueDate && (
              <p className="mt-1">
                <span className="text-stone-500">Due:</span>{" "}
                {invoice.dueDate.toLocaleDateString()}
              </p>
            )}
          </div>
        </header>

        <section className="grid gap-8 py-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Bill to
            </p>
            <p className="mt-2 font-medium text-stone-900">{invoice.client.name}</p>
            {invoice.client.company && (
              <p className="text-stone-700">{invoice.client.company}</p>
            )}
            {invoice.client.address && (
              <p className="mt-2 whitespace-pre-line text-stone-600">
                {invoice.client.address}
              </p>
            )}
            <div className="mt-2 text-sm text-stone-600">
              {invoice.client.email && <p>{invoice.client.email}</p>}
              {invoice.client.phone && <p>{invoice.client.phone}</p>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              From
            </p>
            <p className="mt-2 font-medium text-stone-900">CabinetPaint</p>
            <p className="text-sm text-stone-600">
              Cabinet painting services
            </p>
          </div>
        </section>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-3 pr-4 font-medium">Description</th>
                <th className="py-3 pr-4 font-medium">Qty</th>
                <th className="py-3 pr-4 font-medium text-right">Price</th>
                <th className="py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {invoice.lineItems.map((line) => {
                const lineTotal = lineSubtotalCents(line);
                return (
                  <tr key={line.id}>
                    <td className="py-3 pr-4 text-stone-900">{line.description}</td>
                    <td className="py-3 pr-4 tabular-nums text-stone-600">
                      {line.quantity}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-stone-600">
                      {centsToDollars(line.unitAmountCents)}
                    </td>
                    <td className="py-3 text-right font-medium tabular-nums text-stone-900">
                      {centsToDollars(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col items-end gap-2 border-t border-stone-200 pt-6 text-sm">
          <div className="flex w-full max-w-xs justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="tabular-nums">{centsToDollars(subtotalCents)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between text-stone-600">
            <span>Tax ({bpsToPercentLabel(invoice.taxRateBps)}%)</span>
            <span className="tabular-nums">{centsToDollars(taxCents)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between border-t border-stone-200 pt-2 text-base font-semibold text-stone-900">
            <span>Total</span>
            <span className="tabular-nums">{centsToDollars(totalCents)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 border-t border-stone-100 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Notes
            </p>
            <p className="mt-2 whitespace-pre-line text-sm text-stone-700">
              {invoice.notes}
            </p>
          </div>
        )}
      </article>

      <p className="no-print text-center text-xs text-stone-500">
        Use your browser&apos;s print dialog for a clean PDF or paper copy.
      </p>
    </div>
  );
}
