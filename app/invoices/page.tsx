import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { centsToDollars } from "@/lib/money";
import { invoiceTotalCents } from "@/lib/invoice-calcs";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { issueDate: "desc" },
    include: {
      client: true,
      lineItems: true,
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Invoices
          </h1>
          <p className="mt-1 text-stone-600">
            Create and track bills for your cabinet painting jobs.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          New invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-600">
          <p>No invoices yet.</p>
          <Link
            href="/invoices/new"
            className="mt-2 inline-block font-medium text-stone-900 underline"
          >
            Create an invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Issued</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {invoices.map((inv) => {
                const { totalCents } = invoiceTotalCents(
                  inv.lineItems,
                  inv.taxRateBps
                );
                return (
                  <tr key={inv.id} className="hover:bg-stone-50/80">
                    <td className="px-4 py-3">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-stone-900 underline-offset-2 hover:underline"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-700">{inv.client.name}</td>
                    <td className="px-4 py-3 text-stone-600 tabular-nums">
                      {inv.issueDate.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          inv.status === "PAID"
                            ? "bg-emerald-100 text-emerald-900"
                            : inv.status === "SENT"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-stone-200 text-stone-800"
                        }`}
                      >
                        {inv.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-stone-900">
                      {centsToDollars(totalCents)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
