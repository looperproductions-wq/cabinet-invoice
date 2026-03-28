import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { centsToDollars, bpsToPercentLabel } from "@/lib/money";
import {
  invoiceTotalCents,
  lineSubtotalCents,
} from "@/lib/invoice-calcs";
import { EstimateStatusActions } from "@/components/EstimateStatusActions";
import { DeleteEstimateButton } from "@/components/DeleteEstimateButton";

type Props = { params: Promise<{ id: string }> };

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

export default async function EstimateDetailPage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;
  const estimate = await prisma.estimate.findFirst({
    where: { id, userId: user.id },
    include: {
      client: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!estimate) notFound();

  const { subtotalCents, taxCents, totalCents } = invoiceTotalCents(
    estimate.lineItems,
    estimate.taxRateBps
  );

  return (
    <div className="space-y-8">
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/estimates"
            className="text-sm font-medium text-stone-600 underline hover:text-stone-900"
          >
            ← Estimates
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
            {estimate.estimateNumber}
          </h1>
          <p className="mt-1 text-stone-600">
            {estimate.client.name}
            {estimate.client.company ? ` · ${estimate.client.company}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/estimates/${estimate.id}/edit`}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Edit
          </Link>
          <DeleteEstimateButton estimateId={estimate.id} />
        </div>
      </div>

      <div className="no-print rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-medium text-stone-700">Status</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${estimateStatusClass(estimate.status)}`}
          >
            {estimate.status.toLowerCase()}
          </span>
          <EstimateStatusActions
            estimateId={estimate.id}
            current={estimate.status}
          />
        </div>
      </div>

      <article className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        <header className="flex flex-col gap-6 border-b border-stone-200 pb-8 sm:flex-row sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Estimate
            </p>
            <p className="mt-1 text-xl font-semibold text-stone-900">
              {estimate.estimateNumber}
            </p>
          </div>
          <div className="text-sm text-stone-600">
            <p>
              <span className="text-stone-500">Issued:</span>{" "}
              {estimate.issueDate.toLocaleDateString()}
            </p>
            {estimate.validUntil && (
              <p className="mt-1">
                <span className="text-stone-500">Valid until:</span>{" "}
                {estimate.validUntil.toLocaleDateString()}
              </p>
            )}
          </div>
        </header>

        <section className="grid gap-8 py-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Prepared for
            </p>
            <p className="mt-2 font-medium text-stone-900">{estimate.client.name}</p>
            {estimate.client.company && (
              <p className="text-stone-700">{estimate.client.company}</p>
            )}
            {estimate.client.address && (
              <p className="mt-2 whitespace-pre-line text-stone-600">
                {estimate.client.address}
              </p>
            )}
            <div className="mt-2 text-sm text-stone-600">
              {estimate.client.email && <p>{estimate.client.email}</p>}
              {estimate.client.phone && <p>{estimate.client.phone}</p>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              From
            </p>
            <p className="mt-2 font-medium text-stone-900">CabinetPaint</p>
            <p className="text-sm text-stone-600">Cabinet painting services</p>
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
              {estimate.lineItems.map((line) => {
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
            <span>Tax ({bpsToPercentLabel(estimate.taxRateBps)}%)</span>
            <span className="tabular-nums">{centsToDollars(taxCents)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between border-t border-stone-200 pt-2 text-base font-semibold text-stone-900">
            <span>Estimated total</span>
            <span className="tabular-nums">{centsToDollars(totalCents)}</span>
          </div>
        </div>

        {estimate.notes && (
          <div className="mt-8 border-t border-stone-100 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Notes
            </p>
            <p className="mt-2 whitespace-pre-line text-sm text-stone-700">
              {estimate.notes}
            </p>
          </div>
        )}

        <p className="mt-8 text-xs text-stone-500">
          This is an estimate, not an invoice. Final pricing may vary with scope
          changes.
        </p>
      </article>

      <p className="no-print text-center text-xs text-stone-500">
        Use your browser&apos;s print dialog for a clean PDF or paper copy.
      </p>
    </div>
  );
}
