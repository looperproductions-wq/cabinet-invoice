import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/require-user";
import { EstimateForm } from "@/components/EstimateForm";

export default async function NewEstimatePage() {
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
          href="/estimates"
          className="text-sm font-medium text-stone-600 underline hover:text-stone-900"
        >
          ← Estimates
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
          New estimate
        </h1>
        <p className="mt-1 text-stone-600">
          Build a quote with line items and tax. Numbers like EST-2026-0001 are
          assigned when you save (after sign-in). Guests can draft here first.
        </p>
      </div>
      <EstimateForm
        mode="create"
        clients={clients}
        callbackPath="/estimates/new"
      />
    </div>
  );
}
