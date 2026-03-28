import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EstimateForm } from "@/components/EstimateForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditEstimatePage({ params }: Props) {
  const { id } = await params;
  const [estimate, clients] = await Promise.all([
    prisma.estimate.findUnique({
      where: { id },
      include: { lineItems: true },
    }),
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
  ]);

  if (!estimate) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/estimates/${estimate.id}`}
          className="text-sm font-medium text-stone-600 underline hover:text-stone-900"
        >
          ← {estimate.estimateNumber}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
          Edit estimate
        </h1>
        <p className="mt-1 text-stone-600">
          Update line items, dates, tax, or status.
        </p>
      </div>
      <EstimateForm mode="edit" clients={clients} estimate={estimate} />
    </div>
  );
}
