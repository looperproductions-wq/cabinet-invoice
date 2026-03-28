import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { centsToDollars } from "@/lib/money";
import { invoiceTotalCents } from "@/lib/invoice-calcs";
import { requireUser } from "@/lib/require-user";

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

export default async function EstimatesPage() {
  const user = await requireUser();
  const estimates = await prisma.estimate.findMany({
    where: { userId: user.id },
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
            Estimates
          </h1>
          <p className="mt-1 text-stone-600">
            Quotes for clients before you send an invoice.
          </p>
        </div>
        <Link
          href="/estimates/new"
          className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          New estimate
        </Link>
      </div>

      {estimates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-600">
          <p>No estimates yet.</p>
          <Link
            href="/estimates/new"
            className="mt-2 inline-block font-medium text-stone-900 underline"
          >
            Create an estimate
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
              <tr>
                <th className="px-4 py-3 font-medium">Estimate</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Issued</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {estimates.map((est) => {
                const { totalCents } = invoiceTotalCents(
                  est.lineItems,
                  est.taxRateBps
                );
                return (
                  <tr key={est.id} className="hover:bg-stone-50/80">
                    <td className="px-4 py-3">
                      <Link
                        href={`/estimates/${est.id}`}
                        className="font-medium text-stone-900 underline-offset-2 hover:underline"
                      >
                        {est.estimateNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-700">{est.client.name}</td>
                    <td className="px-4 py-3 text-stone-600 tabular-nums">
                      {est.issueDate.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${estimateStatusClass(est.status)}`}
                      >
                        {est.status.toLowerCase()}
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
