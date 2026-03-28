import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { centsToDollars } from "@/lib/money";
import { invoiceTotalCents } from "@/lib/invoice-calcs";

export default async function DashboardPage() {
  const [clientCount, invoices] = await Promise.all([
    prisma.client.count(),
    prisma.invoice.findMany({
      include: {
        client: true,
        lineItems: true,
      },
      orderBy: { issueDate: "desc" },
      take: 8,
    }),
  ]);

  const unpaid = invoices.filter(
    (inv) => inv.status === "SENT" || inv.status === "DRAFT"
  );
  const outstandingCents = unpaid.reduce((sum, inv) => {
    const { totalCents } = invoiceTotalCents(inv.lineItems, inv.taxRateBps);
    return sum + totalCents;
  }, 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Dashboard
        </h1>
        <p className="mt-1 text-stone-600">
          Overview of clients and recent invoices.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Clients</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-stone-900">
            {clientCount}
          </p>
          <Link
            href="/clients/new"
            className="mt-3 inline-block text-sm font-medium text-stone-800 underline"
          >
            Add a client
          </Link>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Open invoices</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-stone-900">
            {unpaid.length}
          </p>
          <Link
            href="/invoices/new"
            className="mt-3 inline-block text-sm font-medium text-stone-800 underline"
          >
            New invoice
          </Link>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">
            Outstanding (draft + sent)
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-stone-900">
            {centsToDollars(outstandingCents)}
          </p>
          <p className="mt-2 text-xs text-stone-500">Excludes paid invoices.</p>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-stone-900">
            Recent invoices
          </h2>
          <Link
            href="/invoices"
            className="text-sm font-medium text-stone-700 underline"
          >
            View all
          </Link>
        </div>
        {invoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
            <p>No invoices yet.</p>
            <Link
              href="/invoices/new"
              className="mt-2 inline-block font-medium text-stone-900 underline"
            >
              Create your first invoice
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            {invoices.map((inv) => {
              const { totalCents } = invoiceTotalCents(
                inv.lineItems,
                inv.taxRateBps
              );
              return (
                <li key={inv.id}>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="flex flex-col gap-1 px-4 py-4 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-stone-900">
                        {inv.invoiceNumber}
                      </p>
                      <p className="text-sm text-stone-600">
                        {inv.client.name}
                        {inv.client.company ? ` · ${inv.client.company}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:text-right">
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
                      <span className="text-sm font-semibold tabular-nums text-stone-900">
                        {centsToDollars(totalCents)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
