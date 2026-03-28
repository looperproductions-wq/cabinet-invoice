import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EstimateForm } from "@/components/EstimateForm";

export default async function NewEstimatePage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/estimates"
          className="text-sm font-medium text-stone-600 underline hover:text-stone-900"
        >
          ← Estimates
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
          New estimate
        </h1>
        <p className="mt-1 text-stone-600">
          Build a quote with line items and tax. Numbers look like EST-2026-0001.
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="font-medium">Add a client first</p>
          <p className="mt-1 text-sm text-amber-900/90">
            You need at least one client before creating an estimate.
          </p>
          <Link
            href="/clients/new"
            className="mt-3 inline-block text-sm font-semibold underline"
          >
            Create a client
          </Link>
        </div>
      ) : (
        <EstimateForm mode="create" clients={clients} />
      )}
    </div>
  );
}
