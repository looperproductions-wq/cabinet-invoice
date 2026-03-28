import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { centsToDollars } from "@/lib/money";
import { invoiceTotalCents } from "@/lib/invoice-calcs";

function estimateStatusClass(status: string) {
  switch (status) {
    case "ACCEPTED":
      return "bg-emerald-100 text-emerald-900";
    case "DECLINED":
      return "bg-red-100 text-red-800";
    case "SENT":
      return "bg-sky-100 text-sky-900";
    default:
      return "bg-stone-200 text-stone-800";
  }
}

export default async function DashboardPage() {
  const [clientCount, invoices, estimates] = await Promise.all([
    prisma.client.count(),
    prisma.invoice.findMany({
      include: {
        client: true,
        lineItems: true,
      },
      orderBy: { issueDate: "desc" },
      take: 6,
    }),
    prisma.estimate.findMany({
      include: {
        client: true,
        lineItems: true,
      },
      orderBy: { issueDate: "desc" },
      take: 6,
    }),
  ]);

  const unpaidInvoices = invoices.filter(
    (inv) => inv.status === "SENT" || inv.status === "DRAFT"
  );
  const outstandingCents = unpaidInvoices.reduce((sum, inv) => {
    const { totalCents } = invoiceTotalCents(inv.lineItems, inv.taxRateBps);
    return sum + totalCents;
  }, 0);

  const openEstimates = estimates.filter(
    (e) => e.status === "DRAFT" || e.status === "SENT"
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Dashboard
        </h1>
        <p className="mt-1 text-stone-600">
          Overview of clients, estimates, and invoices.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <p className="text-sm font-medium text-stone-500">Open estimates</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-stone-900">
            {openEstimates.length}
          </p>
          <Link
            href="/estimates/new"
            className="mt-3 inline-block text-sm font-medium text-stone-800 underline"
          >
            New estimate
          </Link>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Open invoices</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-stone-900">
            {unpaidInvoices.length}
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
            Outstanding (draft + sent invoices)
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
            Recent estimates
          </h2>
          <Link
            href="/estimates"
            className="text-sm font-medium text-stone-700 underline"
          >
            View all
          </Link>
        </div>
        {estimates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">
            <p>No estimates yet.</p>
            <Link
              href="/estimates/new"
              className="mt-2 inline-block font-medium text-stone-900 underline"
            >
              Create your first estimate
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            {estimates.map((est) => {
              const { totalCents } = invoiceTotalCents(
                est.lineItems,
                est.taxRateBps
              );
              return (
                <li key={est.id}>
                  <Link
                    href={`/estimates/${est.id}`}
                    className="flex flex-col gap-1 px-4 py-4 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-stone-900">
                        {est.estimateNumber}
                      </p>
                      <p className="text-sm text-stone-600">
                        {est.client.name}
                        {est.client.company ? ` · ${est.client.company}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${estimateStatusClass(est.status)}`}
                      >
                        {est.status.toLowerCase()}
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
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">
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
